import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { useCustomerStore, TrackedOrder } from '../store/customer.store';

const STEPS = [
  { icon: 'assignment_turned_in', label: 'Confirmed' },
  { icon: 'skillet', label: 'Preparing' },
  { icon: 'room_service', label: 'Ready' },
  { icon: 'check_circle', label: 'Served' },
];

export default function CustomerOrderTrackingPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { orders, reorder, tableCode, diningSession } = useCustomerStore();

  // Read invoice query param: e.g. ?invoice=ORD-2840
  const invoiceOrderId = searchParams.get('invoice');
  const matchedOrder = invoiceOrderId
    ? orders.find(o => o.id === invoiceOrderId || o.id.replace('#', '') === invoiceOrderId.replace('#', ''))
    : null;

  // Find active orders (status in Placed, Preparing, Ready)
  const activeOrder = diningSession
    ? orders.find(o => o.status === 'Placed' || o.status === 'Preparing' || o.status === 'Ready')
    : undefined;
  // Find past orders (status in Served, Completed)
  const pastOrders = orders.filter(o => o.status === 'Served' || o.status === 'Completed');

  const getInitialProgress = (status?: string) => {
    if (status === 'Placed') return 25;
    if (status === 'Preparing') return 60;
    if (status === 'Ready') return 90;
    return 65;
  };

  // Local simulated progress for live cooking section
  const [progress, setProgress] = useState(() => getInitialProgress(activeOrder?.status));
  const [prevOrderId, setPrevOrderId] = useState<string | undefined>(activeOrder?.id);
  const [prevOrderStatus, setPrevOrderStatus] = useState<string | undefined>(activeOrder?.status);

  if (activeOrder?.id !== prevOrderId || activeOrder?.status !== prevOrderStatus) {
    setPrevOrderId(activeOrder?.id);
    setPrevOrderStatus(activeOrder?.status);
    setProgress(getInitialProgress(activeOrder?.status));
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 95 ? prev + Math.random() * 0.5 : prev));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getActiveStep = (status: string) => {
    switch (status) {
      case 'Placed': return 0;
      case 'Preparing': return 1;
      case 'Ready': return 2;
      case 'Served':
      case 'Completed':
        return 3;
      default: return 0;
    }
  };

  const getStepTime = (stepIdx: number, orderId: string) => {
    // Return standard mock times based on order ID hash
    const numId = parseInt(orderId.replace(/\D/g, '')) || 1200;
    const hour = (numId % 2) + 7;
    const min = (numId % 50);

    if (stepIdx === 0) return `${hour}:${String(min).padStart(2, '0')} PM`;
    if (stepIdx === 1) return `${hour}:${String(min + 7).padStart(2, '0')} PM`;
    if (stepIdx === 2) return `${hour}:${String(min + 15).padStart(2, '0')} PM`;
    return '--:--';
  };

  // Helper to parse items list string: "Hyderabadi Biryani x1, Mango Lassi x1" -> array of { name, qty, estimatedPrice }
  const parseOrderItems = (itemsStr: string) => {
    return itemsStr.split(', ').map(itemStr => {
      const match = itemStr.match(/(.+)\s+x(\d+)/);
      if (match) {
        const name = match[1];
        const qty = parseInt(match[2]);
        let price = 150; // default estimated price fallback
        // Match with known MENU_ITEMS prices for high fidelity
        if (name.includes("Biryani")) price = 249;
        else if (name.includes("Lassi")) price = 89;
        else if (name.includes("Burger")) price = 259;
        else if (name.includes("Naan")) price = 49;
        else if (name.includes("Butter Chicken")) price = 229;
        else if (name.includes("Pizza")) price = 199;
        else if (name.includes("Jamun")) price = 99;
        else if (name.includes("Paneer")) price = 229;
        else if (name.includes("Manchurian")) price = 199;
        else if (name.includes("Pasta")) price = 199;
        else if (name.includes("Cake")) price = 149;

        return { name, qty, price, total: price * qty };
      }
      return { name: itemStr, qty: 1, price: 150, total: 150 };
    });
  };

  // Download PDF receipt generator
  const downloadInvoice = (order: TrackedOrder) => {
    const doc = new jsPDF();
    const orderItems = parseOrderItems(order.items);

    // Header styling
    doc.setFillColor(235, 120, 40); // Smart Dining primary color tone
    doc.rect(0, 0, 210, 15, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("SMART DINING BILL RECEIPT", 14, 10);

    // Restaurant Info
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(20);
    doc.text("Smart Dining SaaS", 14, 30);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Table: " + tableCode + " | Date: " + new Date().toLocaleDateString(), 14, 37);
    doc.text("Payment Mode: UPI (Paid via Smart Wallet)", 14, 42);

    // Divider
    doc.setDrawColor(220, 220, 220);
    doc.line(14, 48, 196, 48);

    // Order Info
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Order ID: " + order.id, 14, 55);
    doc.text("Status: Completed & Paid", 14, 60);

    // Items table header
    let y = 72;
    doc.line(14, y - 4, 196, y - 4);
    doc.setFontSize(10);
    doc.text("Item Details", 14, y);
    doc.text("Qty", 125, y);
    doc.text("Unit Price", 150, y);
    doc.text("Total", 175, y);
    doc.line(14, y + 2, 196, y + 2);

    y += 8;
    doc.setFont("helvetica", "normal");
    orderItems.forEach(item => {
      doc.text(item.name, 14, y);
      doc.text(String(item.qty), 125, y);
      doc.text("INR " + item.price, 150, y);
      doc.text("INR " + item.total, 175, y);
      y += 8;
    });

    doc.line(14, y - 4, 196, y - 4);
    y += 4;

    // Summary
    doc.setFont("helvetica", "bold");
    doc.text("Subtotal:", 125, y);
    doc.text("INR " + order.total, 175, y);

    y += 6;
    doc.text("GST (5%):", 125, y);
    doc.text("INR " + Math.round(order.total * 0.05), 175, y);

    y += 6;
    doc.text("Service Charge (5%):", 125, y);
    doc.text("INR " + Math.round(order.total * 0.05), 175, y);

    y += 8;
    doc.setFontSize(12);
    doc.text("Grand Total:", 125, y);
    doc.text("INR " + Math.round(order.total * 1.10), 175, y);

    // Footer
    y += 20;
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text("Thank you for dining with us! Hope to serve you again.", 14, y);

    doc.save(`invoice-${order.id.replace('#', '')}.pdf`);
  };

  // ────────────────────────────────────────────────────────
  // RENDER: Orders Tracking & Past Orders List
  // ────────────────────────────────────────────────────────
  if (!diningSession) {
    return (
      <div className="p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto h-full sd-custom-scrollbar">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-sd-on-surface font-sans">Your Orders</h2>
          <p className="text-xs text-sd-on-surface-variant font-sans mt-0.5">View your past order history and receipts.</p>
        </div>

        <div className="max-w-4xl space-y-4">
          <h3 className="text-base font-bold text-sd-on-surface font-sans px-1">Order History & Receipts</h3>
          {pastOrders.length === 0 ? (
            <p className="text-xs text-sd-on-surface-variant font-sans text-center py-6 bg-white dark:bg-sd-surface-container rounded-2xl border border-sd-outline-variant">
              No past orders recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {pastOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white dark:bg-sd-surface-container p-4 rounded-2xl border border-sd-outline-variant dark:border-sd-outline-variant/40 sd-food-card-shadow flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-sd-on-surface font-sans">{order.id}</span>
                      <span className="bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded text-[10px] font-bold font-sans uppercase">
                        Served
                      </span>
                    </div>
                    <p className="text-xs text-sd-on-surface-variant font-sans mt-1 max-w-sm truncate">
                      {order.items}
                    </p>
                    <p className="text-[10px] text-sd-on-surface-variant/60 font-sans mt-1">Total Paid: ₹{order.total}</p>
                  </div>

                  <div className="flex gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => setSearchParams({ invoice: order.id })}
                      className="px-3.5 py-1.5 border border-sd-surface-variant hover:bg-sd-surface-container rounded-xl text-xs font-bold font-sans transition-colors text-sd-on-surface"
                    >
                      View Invoice
                    </button>
                    <button
                      onClick={() => {
                        reorder(order);
                        navigate('/customer/menu');
                      }}
                      className="px-3.5 py-1.5 bg-sd-primary/10 text-sd-primary hover:bg-sd-primary hover:text-white rounded-xl text-xs font-bold font-sans transition-colors"
                    >
                      Reorder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invoice Modal Popup */}
        {matchedOrder && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-sd-surface-container rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scaleUp flex flex-col max-h-[90vh]">

              {/* Modal Header */}
              <div className="p-6 border-b border-sd-surface-variant flex justify-between items-center bg-sd-surface-container-low shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-sd-on-surface font-sans">Order Invoice</h3>
                  <p className="text-xs text-sd-on-surface-variant font-sans mt-0.5">Billing details for {matchedOrder.id}</p>
                </div>
                <button
                  onClick={() => setSearchParams({})}
                  className="p-1.5 hover:bg-sd-surface-container rounded-lg text-sd-on-surface-variant transition-colors"
                  title="Close"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 sd-custom-scrollbar">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-sd-surface-variant">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="bg-sd-primary-container w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm shrink-0">
                          <span className="material-symbols-outlined text-[16px]">restaurant</span>
                        </div>
                        <h2 className="text-xl font-bold text-sd-primary font-sans">Smart Dining</h2>
                      </div>
                      <p className="text-xs text-sd-on-surface-variant font-sans mt-1">Order Billing Receipt</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 px-3.5 py-1 rounded-full text-xs font-bold font-sans flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        PAID & SERVED
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                    <div>
                      <p className="text-sd-on-surface-variant font-bold uppercase tracking-wider text-[10px]">Order Details</p>
                      <p className="text-sd-on-surface font-semibold mt-1">Order ID: {matchedOrder.id}</p>
                    </div>
                    <div>
                      <p className="text-sd-on-surface-variant font-bold uppercase tracking-wider text-[10px]">Payment Details</p>
                      <p className="text-sd-on-surface font-semibold mt-1">Method: UPI payment</p>
                    </div>
                  </div>

                  {/* Calculations */}
                  <div className="space-y-2 border-t pt-4 border-sd-surface-variant text-sm font-sans text-sd-on-surface-variant">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-sd-on-surface">₹{matchedOrder.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CGST & SGST (5%)</span>
                      <span className="font-semibold text-sd-on-surface">₹{Math.round(matchedOrder.total * 0.05)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service Charge (5%)</span>
                      <span className="font-semibold text-sd-on-surface">₹{Math.round(matchedOrder.total * 0.05)}</span>
                    </div>
                  </div>

                  {/* Grand Total */}
                  <div className="flex justify-between items-center text-base font-bold font-sans text-sd-on-surface pt-4 border-t border-sd-surface-variant/40">
                    <span>Grand Total</span>
                    <span className="text-lg text-sd-primary">₹{Math.round(matchedOrder.total * 1.1)}</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-sd-surface-container-low border-t border-sd-surface-variant flex gap-3 shrink-0">
                <button
                  onClick={() => downloadInvoice(matchedOrder)}
                  className="flex-1 bg-sd-primary hover:bg-sd-primary/95 text-white py-3 rounded-2xl font-bold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2 font-sans active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Download PDF
                </button>
                <button
                  onClick={() => setSearchParams({})}
                  className="flex-1 border border-sd-surface-variant hover:bg-sd-surface-container py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 font-sans text-sd-on-surface"
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

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto h-full sd-custom-scrollbar">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-sd-on-surface font-sans">Your Orders</h2>
          <div className="flex items-center gap-1 text-sd-primary cursor-pointer hover:opacity-80 transition-opacity mt-0.5">
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            <span className="text-sm font-semibold font-sans">{diningSession?.tableNumber || '...'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Active Order Column */}
        <div className="lg:col-span-8 space-y-6">

          {/* Past Orders Section */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-sd-on-surface font-sans px-1">Order History & Receipts</h3>
            {pastOrders.length === 0 ? (
              <p className="text-xs text-sd-on-surface-variant font-sans text-center py-6 bg-white dark:bg-sd-surface-container rounded-2xl border border-sd-outline-variant">
                No past orders recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {pastOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-sd-surface-container p-4 rounded-2xl border border-sd-outline-variant dark:border-sd-outline-variant/40 sd-food-card-shadow flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-sd-on-surface font-sans">{order.id}</span>
                        <span className="bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded text-[10px] font-bold font-sans uppercase">
                          Served
                        </span>
                      </div>
                      <p className="text-xs text-sd-on-surface-variant font-sans mt-1 max-w-sm truncate">
                        {order.items}
                      </p>
                      <p className="text-[10px] text-sd-on-surface-variant/60 font-sans mt-1">Total Paid: ₹{order.total}</p>
                    </div>

                    <div className="flex gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => setSearchParams({ invoice: order.id })}
                        className="px-3.5 py-1.5 border border-sd-surface-variant hover:bg-sd-surface-container rounded-xl text-xs font-bold font-sans transition-colors text-sd-on-surface"
                      >
                        View Invoice
                      </button>
                      <button
                        onClick={() => {
                          reorder(order);
                          navigate('/customer/orders'); // reload list
                        }}
                        className="px-3.5 py-1.5 bg-sd-primary/10 text-sd-primary hover:bg-sd-primary hover:text-white rounded-xl text-xs font-bold font-sans transition-colors"
                      >
                        Reorder
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active order tracking */}
          {activeOrder ? (
            <div className="space-y-6">
              {/* Stepper Card */}
              <div className="bg-white dark:bg-sd-surface-container rounded-2xl p-6 border border-sd-outline-variant dark:border-sd-outline-variant/40 sd-food-card-shadow">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-base font-bold text-sd-on-surface font-sans">Order {activeOrder.id}</h3>
                    <p className="text-xs text-sd-on-surface-variant font-sans">Estimated Prep Time: {activeOrder.eta || '15 mins'}</p>
                  </div>
                  <span className="bg-sd-primary/10 text-sd-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 font-sans">
                    <span className="w-2 h-2 bg-sd-primary rounded-full animate-pulse" />
                    In Kitchen
                  </span>
                </div>

                {/* Stepper */}
                <div className="relative flex justify-between items-start">
                  <div className="absolute top-6 left-0 right-0 h-0.5 bg-sd-surface-variant dark:bg-sd-surface-variant/40" />
                  <div
                    className="absolute top-6 left-0 h-0.5 bg-sd-primary transition-all duration-1000"
                    style={{ width: `${(getActiveStep(activeOrder.status) / (STEPS.length - 1)) * 100}%` }}
                  />
                  {STEPS.map((step, i) => {
                    const activeStepIdx = getActiveStep(activeOrder.status);
                    const isDone = i < activeStepIdx;
                    const isActive = i === activeStepIdx;
                    const isFuture = i > activeStepIdx;

                    return (
                      <div key={step.label} className={`relative z-10 flex flex-col items-center text-center w-1/4 ${isFuture ? 'opacity-40' : ''}`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-500 ${
                          isActive ? 'bg-sd-primary text-white shadow-lg scale-110' :
                          isDone ? 'border-2 border-sd-primary bg-white dark:bg-sd-surface text-sd-primary shadow-md' :
                          'border-2 border-sd-outline-variant dark:border-sd-outline-variant/40 bg-white dark:bg-sd-surface text-sd-on-surface-variant'
                        }`}>
                          <span className="material-symbols-outlined text-[20px]">{step.icon}</span>
                        </div>
                        <span className={`text-xs font-semibold font-sans ${isActive ? 'text-sd-primary font-bold' : isDone ? 'text-sd-primary' : 'text-sd-on-surface'}`}>
                          {step.label}
                        </span>
                        <span className="text-[10px] font-sans mt-0.5 text-sd-on-surface-variant">
                          {getStepTime(i, activeOrder.id)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Cooking Feed */}
              {activeOrder.status === 'Preparing' && (
                <div className="bg-white dark:bg-sd-surface-container rounded-2xl overflow-hidden border border-sd-outline-variant dark:border-sd-outline-variant/40 sd-food-card-shadow flex flex-col md:flex-row">
                  <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping" />
                      <span className="text-red-600 font-bold text-xs tracking-wider font-sans">LIVE COOKING FEED</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 font-sans text-sd-on-surface">
                      Your meal is <span className="text-sd-primary">being prepared</span> 👨‍Chef
                    </h3>
                    <p className="text-xs text-sd-on-surface-variant mb-6 max-w-sm font-sans">
                      Our chefs are putting finishing touches. Clean ingredients, hot serving.
                    </p>
                    <div className="w-full">
                      <div className="flex justify-between items-end mb-1.5">
                        <span className="text-sd-primary font-bold text-xs font-sans">{Math.floor(progress)}% Cooking Completed</span>
                        <span className="text-sd-on-surface-variant text-[11px] font-sans">approx. 6 mins left</span>
                      </div>
                      <div className="h-3 w-full bg-sd-surface-variant/40 rounded-full overflow-hidden">
                        <div className="h-full bg-sd-primary rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 h-40 md:h-auto min-h-[160px] relative">
                    <img
                      className="absolute inset-0 w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOuzvhhHsEDrrMH1coqv2a10CTYgQjDCWUHxrjrXawjcY9-pGVNmcP6l2fOekd9G8ogTDdrwi3v3FAqmnyv-FMWr7GZgFEtURv64ncIWHLbbC1p8CmBf2QrQhcisBAZGxNLEeTa_UWYSyJuPmIJNrTllaLa7I2f2xugfXa8nR_ZuL5nv_DrXIxnd-p2G1ZckDlcVi7MY5pm2oPSk8TNTYbTg8gdvia6Q8sP6J0xBZbiXkFqx17ntQUyHn9Y_sl1oTr9Pczq1C62Zs"
                      alt="Chef cooking"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-sd-surface-container via-transparent to-transparent" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-sd-surface-container rounded-2xl p-8 border border-sd-outline-variant dark:border-sd-outline-variant/40 text-center sd-food-card-shadow flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-sd-surface-variant/40 flex items-center justify-center text-sd-on-surface-variant/60 mb-3">
                <span className="material-symbols-outlined text-2xl">receipt</span>
              </div>
              <h3 className="font-bold text-sm font-sans text-sd-on-surface">No Active Orders</h3>
              <p className="text-xs text-sd-on-surface-variant font-sans mt-0.5">Explore our menu and place a fresh table request.</p>
              <button
                onClick={() => navigate('/customer/menu')}
                className="mt-4 px-5 py-2 bg-sd-primary text-white rounded-xl text-xs font-bold font-sans active:scale-95 transition-transform"
              >
                Go to Menu
              </button>
            </div>
          )}
        </div>

        {/* Right / Bill Details Column */}
        <div className="lg:col-span-4 space-y-5">
          {/* Active Order Item details */}
          {activeOrder && (
            <div className="bg-white dark:bg-sd-surface-container p-5 border border-sd-outline-variant dark:border-sd-outline-variant/40 rounded-2xl sd-food-card-shadow">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-bold text-sd-on-surface font-sans">Active Bill Items</h3>
                <span className="text-sd-primary font-bold text-sm font-sans">
                  {parseOrderItems(activeOrder.items).reduce((sum, item) => sum + item.qty, 0)} Items
                </span>
              </div>
              <div className="space-y-3 mb-6">
                {parseOrderItems(activeOrder.items).map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-xl bg-sd-surface-variant/40 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-sd-on-surface-variant text-[18px]">restaurant</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sd-on-surface text-sm font-sans truncate">{item.name}</h4>
                      <p className="text-[10px] text-sd-on-surface-variant font-sans">Qty: {item.qty} • Unit: ₹{item.price}</p>
                    </div>
                    <span className="font-bold text-sd-on-surface text-sm font-sans shrink-0">₹{item.total}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-sd-surface-variant flex justify-between items-center text-sm font-sans text-sd-on-surface">
                <span className="font-bold">Total Bill (approx.)</span>
                <span className="font-bold text-sd-primary text-base">₹{activeOrder.total}</span>
              </div>
            </div>
          )}

          {/* Support / Quick Help Card */}
          <div className="bg-white dark:bg-sd-surface-container rounded-2xl p-5 border border-sd-outline-variant dark:border-sd-outline-variant/40 sd-food-card-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-sd-surface-variant/50 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-sd-on-surface-variant text-xl">forum</span>
              </div>
              <div>
                <h4 className="text-sm font-bold font-sans text-sd-on-surface">Need help?</h4>
                <p className="text-[10px] text-sd-on-surface-variant font-sans">Chat directly with wait staff</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/customer/feedback')}
              className="w-full py-2.5 rounded-xl border border-sd-primary text-sd-primary font-bold text-sm hover:bg-sd-primary/5 transition-colors font-sans"
            >
              Contact Staff
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Modal Popup */}
      {matchedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-sd-surface-container rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scaleUp flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="p-6 border-b border-sd-surface-variant flex justify-between items-center bg-sd-surface-container-low shrink-0">
              <div>
                <h3 className="text-lg font-bold text-sd-on-surface font-sans">Order Invoice</h3>
                <p className="text-xs text-sd-on-surface-variant font-sans mt-0.5">Billing details for {matchedOrder.id}</p>
              </div>
              <button
                onClick={() => setSearchParams({})}
                className="p-1.5 hover:bg-sd-surface-container rounded-lg text-sd-on-surface-variant transition-colors"
                title="Close"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 sd-custom-scrollbar">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-sd-surface-variant">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="bg-sd-primary-container w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm shrink-0">
                        <span className="material-symbols-outlined text-[16px]">restaurant</span>
                      </div>
                      <h2 className="text-xl font-bold text-sd-primary font-sans">Smart Dining</h2>
                    </div>
                    <p className="text-xs text-sd-on-surface-variant font-sans mt-1">Table {tableCode} | Order Billing Receipt</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 px-3.5 py-1 rounded-full text-xs font-bold font-sans flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      PAID & SERVED
                    </span>
                    <p className="text-[10px] text-sd-on-surface-variant font-sans mt-1.5">Date: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                  <div>
                    <p className="text-sd-on-surface-variant font-bold uppercase tracking-wider text-[10px]">Order Details</p>
                    <p className="text-sd-on-surface font-semibold mt-1">Order ID: {matchedOrder.id}</p>
                    <p className="text-sd-on-surface-variant mt-0.5">ETA: Served ({matchedOrder.eta || '-'})</p>
                  </div>
                  <div>
                    <p className="text-sd-on-surface-variant font-bold uppercase tracking-wider text-[10px]">Payment Details</p>
                    <p className="text-sd-on-surface font-semibold mt-1">Method: UPI payment</p>
                    <p className="text-sd-on-surface-variant mt-0.5">Reference: SMART-UPI-9840</p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border-t border-b border-sd-surface-variant py-4">
                  <h4 className="text-[10px] font-bold text-sd-on-surface-variant uppercase tracking-wider mb-3 font-sans">Bill Summary</h4>
                  <div className="space-y-3">
                    {parseOrderItems(matchedOrder.items).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm font-sans text-sd-on-surface">
                        <div className="flex-1">
                          <p className="font-bold">{item.name}</p>
                          <p className="text-[10px] text-sd-on-surface-variant">Unit Price: ₹{item.price}</p>
                        </div>
                        <span className="text-sd-on-surface-variant font-semibold w-16 text-center">x{item.qty}</span>
                        <span className="font-bold w-20 text-right">₹{item.total}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calculations */}
                <div className="space-y-2 border-b border-sd-surface-variant pb-4 text-sm font-sans text-sd-on-surface-variant">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-sd-on-surface">₹{matchedOrder.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CGST & SGST (5%)</span>
                    <span className="font-semibold text-sd-on-surface">₹{Math.round(matchedOrder.total * 0.05)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Charge (5%)</span>
                    <span className="font-semibold text-sd-on-surface">₹{Math.round(matchedOrder.total * 0.05)}</span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="flex justify-between items-center text-base font-bold font-sans text-sd-on-surface">
                  <span>Grand Total</span>
                  <span className="text-lg text-sd-primary">₹{Math.round(matchedOrder.total * 1.1)}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-sd-surface-container-low border-t border-sd-surface-variant flex gap-3 shrink-0">
              <button
                onClick={() => downloadInvoice(matchedOrder)}
                className="flex-1 bg-sd-primary hover:bg-sd-primary/95 text-white py-3 rounded-2xl font-bold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2 font-sans active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Download PDF
              </button>
              <button
                onClick={() => setSearchParams({})}
                className="flex-1 border border-sd-surface-variant hover:bg-sd-surface-container py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 font-sans text-sd-on-surface"
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
