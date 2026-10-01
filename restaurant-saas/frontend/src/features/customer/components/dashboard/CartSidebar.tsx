import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isPersistent?: boolean;
}

export default function CartSidebar({ isOpen, onClose, isPersistent = false }: Props) {
  const { items, updateQuantity, removeItem, clearCart, subtotal, resCharges, discount, total } = useCart();
  const navigate = useNavigate();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <button
          onClick={onClose}
          type="button"
          aria-label="Close cart"
          className="fixed inset-0 w-full h-full bg-black/40 z-40 transition-opacity duration-300 border-none outline-none cursor-default"
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 bg-white z-50 flex flex-col h-screen transition-transform duration-300 shadow-2xl ${
          isOpen ? 'w-full sm:w-[380px] translate-x-0' : 'w-full sm:w-[380px] translate-x-full'
        }`}
      >
      {/* Toggle tab (visible on closed state edge) */}
      {!isOpen && (
        <button
          onClick={onClose}
          className="absolute -left-10 top-1/2 -translate-y-1/2 w-10 h-20 bg-white border border-r-0 border-sd-surface-variant rounded-l-xl flex items-center justify-center shadow-md hover:bg-sd-surface-container-low transition-colors"
          title="Open cart"
        >
          <span className="material-symbols-outlined text-sd-on-surface-variant text-[20px]">shopping_cart</span>
        </button>
      )}

      <div className={`flex flex-col h-full p-6 ${isOpen ? '' : 'hidden'}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h3 className="text-lg font-bold text-sd-on-surface font-sans">Your Order</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={clearCart}
              className="text-sd-primary text-xs font-bold hover:underline font-sans"
            >
              Clear all
            </button>
            <button
              onClick={onClose}
              className="p-1 text-sd-on-surface-variant hover:bg-sd-surface-container rounded-lg transition-colors"
              title="Minimise cart"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto sd-custom-scrollbar pr-2 space-y-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-sd-on-surface-variant">
              <span className="material-symbols-outlined text-5xl mb-4 opacity-30">shopping_cart</span>
              <p className="text-sm font-sans">Your cart is empty</p>
              <button
                onClick={() => navigate('/customer/menu')}
                className="mt-4 text-sd-primary font-bold text-sm font-sans hover:underline"
              >
                Browse Menu →
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-sd-surface-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sd-on-surface-variant">flatware</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-sm text-sd-on-surface truncate font-sans">{item.name}</p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-sd-on-surface-variant hover:text-sd-error transition-colors shrink-0 ml-2"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                  <p className="text-sd-primary font-bold text-xs font-sans">₹{item.price}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 border border-sd-surface-variant rounded-md flex items-center justify-center hover:bg-sd-surface-container transition-all"
                    >
                      <span className="material-symbols-outlined text-[14px]">remove</span>
                    </button>
                    <span className="text-sm font-bold w-4 text-center font-sans">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 border border-sd-surface-variant rounded-md flex items-center justify-center hover:bg-sd-surface-container transition-all"
                    >
                      <span className="material-symbols-outlined text-[14px]">add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total */}
        {items.length > 0 && (
          <div className="pt-6 border-t border-sd-surface-variant space-y-3 mt-4 shrink-0">
            <div className="flex justify-between text-sm font-sans">
              <span className="text-sd-on-surface-variant">Subtotal</span>
              <span className="font-bold text-sd-on-surface">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm font-sans">
              <span className="text-sd-on-surface-variant">Restaurant charges</span>
              <span className="font-bold text-sd-on-surface">₹{resCharges}</span>
            </div>
            <div className="flex justify-between text-sm font-sans text-sd-secondary">
              <span>Discount</span>
              <span className="font-bold">- ₹{discount}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 font-sans">
              <span className="text-sd-on-surface">Total</span>
              <span className="text-sd-primary">₹{total}</span>
            </div>
            <button
              onClick={() => navigate('/customer/checkout')}
              className="w-full bg-sd-primary-container text-white py-4 rounded-[1.25rem] font-bold text-sm mt-4 shadow-xl hover:shadow-sd-primary-container/20 hover:scale-[1.02] active:scale-95 transition-all font-sans flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        )}
      </div>
    </aside>
    </>
  );
}
