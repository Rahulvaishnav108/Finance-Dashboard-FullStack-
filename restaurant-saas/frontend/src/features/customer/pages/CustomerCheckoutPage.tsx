import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  createCustomerPayment,
  verifyCustomerPayment,
  type CustomerPaymentMethod,
} from '../api/customer.api';
import { useCart } from '../components/dashboard/CartContext';
import { useCustomerStore } from '../store/customer.store';

type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
  theme?: {
    color?: string;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void };
  }
}

const loadRazorpayCheckout = () =>
  new Promise<void>((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load Razorpay checkout. Please try again.'));
    document.body.appendChild(script);
  });

export default function CustomerCheckoutPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    subtotal,
    resCharges,
    discount,
    total,
    clearCart,
    appliedCoupon,
    setAppliedCoupon,
  } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [coupon, setCoupon] = useState(appliedCoupon ? appliedCoupon.code : '');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const navigate = useNavigate();
  const { addNotification, tableCode, offers, loyaltyPoints, claimOffer, addOrder } = useCustomerStore();

  const completeLocalOrder = () => {
    if (items.length === 0) return;

    const orderId = `#ORD-${Math.floor(3000 + Math.random() * 6000)}`;
    const itemsStr = items.map((i) => `${i.name} x${i.quantity}`).join(', ');

    const newOrder = {
      id: orderId,
      items: itemsStr,
      total: total,
      status: 'Placed' as const,
      eta: '15 min'
    };

    addOrder(newOrder);

    addNotification(
      'Order Placed! 🍽️',
      `Your order for ${itemsStr} has been placed. Total: ₹${total}`,
      'order',
      '/customer/orders'
    );
    clearCart();
    navigate('/customer/orders');
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0 || isPaying) return;

    const paymentMethodMap: Record<string, CustomerPaymentMethod> = {
      upi: 'UPI',
      card: 'CARD',
      netbanking: 'ONLINE',
    };
    const backendPaymentMethod = paymentMethodMap[paymentMethod] ?? 'ONLINE';

    setIsPaying(true);
    setPaymentError('');

    try {
      const payment = await createCustomerPayment(backendPaymentMethod);
      const paymentId = payment.razorpayOrderId ?? payment.paymentId ?? payment.paymentIntentId;

      if (payment.provider === 'razorpay' && payment.razorpayKeyId && payment.razorpayOrderId) {
        await loadRazorpayCheckout();

        const Checkout = window.Razorpay;
        if (!Checkout) {
          throw new Error('Razorpay checkout is unavailable. Please try again.');
        }

        const checkout = new Checkout({
          key: payment.razorpayKeyId,
          amount: Math.round(payment.amount * 100),
          currency: payment.currency ?? 'INR',
          name: 'Smart Dining',
          description: 'Table bill payment',
          order_id: payment.razorpayOrderId,
          handler: async (response) => {
            try {
              await verifyCustomerPayment({
                paymentId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              completeLocalOrder();
            } catch (error) {
              setPaymentError(error instanceof Error ? error.message : 'Payment verification failed.');
            } finally {
              setIsPaying(false);
            }
          },
          modal: {
            ondismiss: () => {
              setIsPaying(false);
            },
          },
          theme: {
            color: '#df6b21',
          },
        });

        checkout.open();
        return;
      }

      await verifyCustomerPayment({
        paymentId,
        simulateStatus: 'COMPLETED',
      });
      completeLocalOrder();
      setIsPaying(false);
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Unable to start payment. Please try again.');
      setIsPaying(false);
    }
  };

  const handleApplyCoupon = (codeStr: string) => {
    const code = codeStr.trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon code.');
      setCouponSuccess('');
      return;
    }

    const offer = offers.find((o) => o.code.toUpperCase() === code);
    if (!offer) {
      setCouponError('Invalid coupon code.');
      setCouponSuccess('');
      return;
    }

    if (!offer.claimed) {
      setCouponError('This coupon is not yet unlocked. Redeem it first using your points!');
      setCouponSuccess('');
      return;
    }

    if (offer.minOrderAmount && subtotal < offer.minOrderAmount) {
      setCouponError(`Min order amount of ₹${offer.minOrderAmount} required.`);
      setCouponSuccess('');
      return;
    }

    // Free item / BOGO checks
    if (code === 'FREEBEV') {
      const hasLassi = items.some(i => i.name.toLowerCase().includes('mango lassi'));
      if (!hasLassi) {
        setCouponError('This coupon requires a Mango Lassi in your cart.');
        setCouponSuccess('');
        return;
      }
    }
    if (code === 'DESSERT80') {
      const hasJamun = items.some(i => i.name.toLowerCase().includes('gulab jamun'));
      if (!hasJamun) {
        setCouponError('This coupon requires a Gulab Jamun in your cart.');
        setCouponSuccess('');
        return;
      }
    }
    if (code === 'BURGERBOGO') {
      const burger = items.find(i => i.name.toLowerCase().includes('smash burger'));
      if (!burger || burger.quantity < 2) {
        setCouponError('Buy 1 Get 1 Burger requires at least 2 Smash Burgers in your cart.');
        setCouponSuccess('');
        return;
      }
    }

    setAppliedCoupon(offer);
    setCouponError('');
    setCouponSuccess(`Coupon "${offer.code}" applied successfully!`);
    setCoupon(offer.code);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCoupon('');
    setCouponSuccess('');
    setCouponError('');
  };

  const PAYMENT_OPTIONS = [
    { id: 'upi', icon: 'account_balance_wallet', label: 'UPI', desc: 'Google Pay, PhonePe, Paytm & more' },
    { id: 'card', icon: 'credit_card', label: 'Card', desc: 'Visa, Mastercard, RuPay & more' },
    { id: 'netbanking', icon: 'account_balance', label: 'Net Banking', desc: 'All major banks supported' },
  ];

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto h-full sd-custom-scrollbar">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-sd-on-surface font-sans">Checkout</h2>
        <div className="flex items-center gap-2 mt-1">
          <span className="material-symbols-outlined text-sd-primary text-[18px]">location_on</span>
          <span className="text-sm text-sd-on-surface-variant font-sans">Table {tableCode}</span>
          <span className="mx-1 text-sd-surface-variant">|</span>
          <div className="flex items-center gap-1 bg-sd-secondary-container/10 dark:bg-sd-secondary-container/20 px-2 py-0.5 rounded-full">
            <span className="material-symbols-outlined text-sd-secondary dark:text-sd-secondary-container text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
            <span className="text-[11px] text-sd-secondary dark:text-sd-secondary-container font-sans">Secure Checkout</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Order Items */}
          <section className="bg-white rounded-2xl shadow-sm border border-sd-surface-variant overflow-hidden">
            <div className="p-5 border-b border-sd-surface-variant flex items-center justify-between">
              <h3 className="text-base font-bold font-sans flex items-center gap-2">
                Your Order <span className="text-sd-on-surface-variant font-normal text-sm">({items.length} items)</span>
              </h3>
              <Link to="/customer/menu" className="text-sd-primary font-bold text-sm font-sans hover:underline">Edit Order</Link>
            </div>
            <div className="divide-y divide-sd-surface-variant">
              {items.map((item) => (
                <div key={item.id} className="p-5 flex gap-4 group">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-sd-surface-container">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-sd-on-surface-variant/30">flatware</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sd-on-surface text-sm font-sans">{item.name}</h4>
                      <p className="font-bold text-sd-on-surface text-sm font-sans">₹{item.price * item.quantity}</p>
                    </div>
                    {item.description && (
                      <p className="text-xs text-sd-on-surface-variant font-sans mt-0.5 line-clamp-1">{item.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center border border-sd-surface-variant rounded-lg overflow-hidden">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2.5 py-1 hover:bg-sd-surface-container-low text-sd-on-surface-variant transition-colors text-sm">−</button>
                        <span className="px-2.5 font-bold text-sd-on-surface text-sm font-sans">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2.5 py-1 hover:bg-sd-surface-container-low text-sd-on-surface-variant transition-colors text-sm">+</button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-sd-error text-xs font-semibold flex items-center gap-1 font-sans">
                        <span className="material-symbols-outlined text-[14px]">delete</span> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-sd-surface-container-low text-center">
              <Link to="/customer/menu" className="text-sd-primary font-bold text-sm flex items-center justify-center gap-2 font-sans">
                <span className="material-symbols-outlined text-[18px]">add_circle</span> Add more items
              </Link>
            </div>
          </section>

          {/* Payment Methods */}
          <section className="space-y-4">
            <h3 className="text-base font-bold font-sans">Payment Methods</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PAYMENT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setPaymentMethod(opt.id)}
                  className={`p-5 rounded-2xl border-2 shadow-sm flex items-start gap-4 text-left transition-all ${
                    paymentMethod === opt.id ? 'border-sd-primary-container bg-white' : 'border-sd-surface-variant bg-white hover:border-sd-primary-container/50'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${paymentMethod === opt.id ? 'bg-sd-primary-container/10' : 'bg-sd-surface-container'}`}>
                    <span className={`material-symbols-outlined text-[24px] ${paymentMethod === opt.id ? 'text-sd-primary-container' : 'text-sd-on-surface-variant'}`}>{opt.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sd-on-surface text-sm font-sans">{opt.label}</p>
                    <p className="text-[11px] text-sd-on-surface-variant font-sans mt-0.5">{opt.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${paymentMethod === opt.id ? 'border-sd-primary-container' : 'border-sd-surface-variant'}`}>
                    {paymentMethod === opt.id && <div className="w-2 h-2 rounded-full bg-sd-primary-container" />}
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Coupon */}
          <section className="bg-sd-primary-fixed/20 p-5 rounded-2xl border border-sd-primary-fixed flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute -left-4 -bottom-4 opacity-10">
              <span className="material-symbols-outlined text-[100px]">local_activity</span>
            </div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-sd-primary-container rounded-full flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
              </div>
              <div>
                <h4 className="font-bold text-sd-on-surface text-sm font-sans">Apply Coupon</h4>
                <p className="text-[11px] text-sd-on-surface-variant font-sans">Get exciting offers & rewards!</p>
              </div>
            </div>
            <div className="flex flex-col w-full md:w-auto gap-1.5 relative z-10 items-stretch md:items-end">
              <div className="flex gap-2">
                <input
                  className="flex-1 md:w-56 bg-white border border-sd-surface-variant rounded-xl px-4 h-11 focus:outline-none focus:ring-2 focus:ring-sd-primary-container transition-all text-sm font-sans"
                  placeholder="Enter coupon code"
                  value={coupon}
                  disabled={!!appliedCoupon}
                  onChange={(e) => setCoupon(e.target.value)}
                />
                {appliedCoupon ? (
                  <button
                    onClick={handleRemoveCoupon}
                    className="bg-sd-error text-white px-5 h-11 rounded-xl font-bold text-sm hover:scale-105 transition-transform font-sans"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={() => handleApplyCoupon(coupon)}
                    className="bg-sd-primary-container text-white px-5 h-11 rounded-xl font-bold text-sm hover:scale-105 transition-transform font-sans"
                  >
                    Apply
                  </button>
                )}
              </div>

              {couponError && <p className="text-xs text-red-500 font-bold font-sans mt-0.5">{couponError}</p>}
              {couponSuccess && <p className="text-xs text-green-600 font-bold font-sans mt-0.5">{couponSuccess}</p>}

              <button
                onClick={() => setIsModalOpen(true)}
                className="text-sd-primary font-bold text-xs hover:underline flex items-center justify-center md:justify-start gap-1 font-sans mt-1.5 cursor-pointer self-center md:self-start"
              >
                <span className="material-symbols-outlined text-[16px]">local_offer</span>
                View Available Coupons
              </button>
            </div>
          </section>
        </div>

        {/* Right Column — Bill Summary */}
        <aside className="lg:col-span-4 lg:sticky lg:top-4 self-start space-y-5">
          <div className="bg-white rounded-2xl shadow-lg border border-sd-surface-variant p-5 space-y-5">
            <h3 className="text-base font-bold font-sans">Bill Summary</h3>
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm font-sans"><span className="text-sd-on-surface-variant">Item Total</span><span>₹{subtotal}</span></div>
              <div className="flex justify-between text-sm font-sans"><span className="text-sd-on-surface-variant">Restaurant Charges</span><span>₹{resCharges}</span></div>
              <div className="flex justify-between text-sm font-sans text-sd-secondary"><span>Discount</span><span className="font-bold">- ₹{discount}</span></div>
              <div className="pt-2.5 border-t border-sd-surface-variant flex justify-between">
                <span className="text-lg font-bold text-sd-on-surface font-sans">To Pay</span>
                <span className="text-lg font-bold text-sd-primary font-sans">₹{total}</span>
              </div>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={items.length === 0 || isPaying}
              className="w-full bg-sd-primary-container text-white h-13 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-sd-primary-container/20 transition-all active:scale-95 font-sans disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPaying ? 'Processing...' : `Pay ₹${total}`}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            {paymentError && (
              <p className="text-xs text-sd-error font-bold font-sans">{paymentError}</p>
            )}
            <div className="bg-sd-surface-container-low p-3.5 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-sd-secondary">
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                <span className="text-xs font-bold font-sans">100% Secure Payments</span>
              </div>
              <p className="text-[11px] text-sd-on-surface-variant font-sans">Your transaction is encrypted and secure.</p>
            </div>
          </div>
        </aside>
      </div>

      {/* Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scaleUp flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="p-6 border-b border-sd-surface-variant flex justify-between items-center bg-sd-surface-container-low shrink-0">
              <div>
                <h3 className="text-lg font-bold text-sd-on-surface font-sans">Coupons & Offers</h3>
                <p className="text-xs text-sd-on-surface-variant font-sans mt-0.5">Redeem points or apply unlocked coupons</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-sd-surface-container rounded-lg text-sd-on-surface-variant transition-colors"
                title="Close"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Points Balance Card */}
            <div className="px-6 py-4 bg-sd-primary-fixed/10 border-b border-sd-surface-variant/50 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sd-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                  <span className="text-sm font-bold text-sd-on-surface font-sans">Your Reward Points</span>
                </div>
                <span className="text-base font-black text-sd-primary font-sans">{loyaltyPoints} Points</span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 sd-custom-scrollbar">

              {/* Unlocked Coupons Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sd-on-surface-variant/80 font-sans">
                  Your Available Coupons
                </h4>

                {offers.filter(o => o.claimed).length === 0 ? (
                  <p className="text-xs text-sd-on-surface-variant italic font-sans py-2">No coupons available. Redeem some below!</p>
                ) : (
                  <div className="space-y-3">
                    {offers.filter(o => o.claimed).map((offer) => {
                      const isCurrent = appliedCoupon?.id === offer.id;
                      return (
                        <div
                          key={offer.id}
                          className={`relative border-2 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all overflow-hidden ${
                            isCurrent
                              ? 'border-green-500 bg-green-50/20'
                              : 'border-sd-surface-variant hover:border-sd-primary-container/40 bg-white'
                          }`}
                        >
                          {/* Left Decorative Coupon Notch */}
                          <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-sd-surface border-r-2 border-sd-surface-variant z-10" />
                          {/* Right Decorative Coupon Notch */}
                          <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-sd-surface border-l-2 border-sd-surface-variant z-10" />

                          <div className="flex-1 pl-2 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="bg-sd-primary/10 text-sd-primary text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                                {offer.code}
                              </span>
                              {isCurrent && (
                                <span className="bg-green-500/10 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded font-sans flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-[12px]">check_circle</span> Active
                                </span>
                              )}
                            </div>
                            <h5 className="font-bold text-sm text-sd-on-surface mt-1.5 font-sans">{offer.title}</h5>
                            <p className="text-xs text-sd-on-surface-variant mt-1 font-sans leading-relaxed">{offer.desc}</p>
                            <p className="text-[10px] text-sd-on-surface-variant/60 mt-2 font-sans">Expires: {offer.expiryDate}</p>
                          </div>

                          <div>
                            {isCurrent ? (
                              <button
                                onClick={handleRemoveCoupon}
                                className="px-4 py-2 bg-sd-error/10 hover:bg-sd-error/20 text-sd-error font-bold text-xs rounded-xl transition-all font-sans"
                              >
                                Remove
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  handleApplyCoupon(offer.code);
                                  setIsModalOpen(false);
                                }}
                                className="px-4 py-2 bg-sd-primary-container text-white hover:scale-105 font-bold text-xs rounded-xl transition-transform font-sans"
                              >
                                Apply
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Redeem with Points Section */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sd-on-surface-variant/80 font-sans">
                  Redeem Points for Coupons
                </h4>

                {offers.filter(o => !o.claimed).length === 0 ? (
                  <p className="text-xs text-sd-on-surface-variant italic font-sans py-2">All offers redeemed!</p>
                ) : (
                  <div className="space-y-3">
                    {offers.filter(o => !o.claimed).map((offer) => {
                      const canAfford = loyaltyPoints >= offer.requiredPoints;
                      return (
                        <div
                          key={offer.id}
                          className="relative border border-dashed border-sd-surface-variant bg-sd-surface-container-lowest rounded-2xl p-4 flex items-center justify-between gap-4 overflow-hidden"
                        >
                          {/* Left Decorative Coupon Notch */}
                          <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-sd-surface border-r border-sd-surface-variant z-10" />
                          {/* Right Decorative Coupon Notch */}
                          <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-sd-surface border-l border-sd-surface-variant z-10" />

                          <div className="flex-1 pl-2 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="bg-sd-secondary-container/10 dark:bg-sd-secondary-container/20 text-sd-secondary dark:text-sd-secondary-container text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                                {offer.code}
                              </span>
                              <span className="bg-sd-primary-fixed/20 text-sd-primary-container text-[10px] font-bold px-2 py-0.5 rounded font-sans">
                                Costs: {offer.requiredPoints} pts
                              </span>
                            </div>
                            <h5 className="font-bold text-sm text-sd-on-surface mt-1.5 font-sans">{offer.title}</h5>
                            <p className="text-xs text-sd-on-surface-variant mt-1 font-sans leading-relaxed">{offer.desc}</p>
                            <p className="text-[10px] text-sd-on-surface-variant/60 mt-2 font-sans">Expiry: {offer.expiryDate}</p>
                          </div>

                          <div>
                            <button
                              onClick={() => {
                                if (canAfford) {
                                  const ok = claimOffer(offer.id);
                                  if (ok) {
                                    setCouponSuccess(`Successfully unlocked "${offer.title}"!`);
                                    setCouponError('');
                                  }
                                }
                              }}
                              disabled={!canAfford}
                              className={`px-4 py-2 font-bold text-xs rounded-xl transition-all font-sans whitespace-nowrap ${
                                canAfford
                                  ? 'bg-sd-secondary text-white hover:scale-105 transition-transform'
                                  : 'bg-sd-surface-variant text-sd-on-surface-variant/40 cursor-not-allowed'
                              }`}
                            >
                              Redeem
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-sd-surface-container-low border-t border-sd-surface-variant text-center shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-sd-outline-variant/30 hover:bg-sd-outline-variant/50 text-sd-on-surface font-bold text-sm rounded-xl transition-all font-sans"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
