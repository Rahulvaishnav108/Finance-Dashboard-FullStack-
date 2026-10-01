import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { OfferCoupon } from '../../store/customer.store';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  description?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  resCharges: number;
  discount: number;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  appliedCoupon: OfferCoupon | null;
  setAppliedCoupon: (coupon: OfferCoupon | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<OfferCoupon | null>(null);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedCoupon(null);
  }, []);

  const itemCount = useMemo(() => items.length, [items]);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);
  const resCharges = 30;
  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;

    // Check min order amount
    if (appliedCoupon.minOrderAmount && subtotal < appliedCoupon.minOrderAmount) {
      return 0;
    }

    const code = appliedCoupon.code.toUpperCase();
    if (code === 'FREEBEV') {
      const hasLassi = items.some(i => i.name.toLowerCase().includes('mango lassi'));
      if (!hasLassi) return 0;
    }
    if (code === 'DESSERT80') {
      const hasJamun = items.some(i => i.name.toLowerCase().includes('gulab jamun'));
      if (!hasJamun) return 0;
    }
    if (code === 'BURGERBOGO') {
      const burger = items.find(i => i.name.toLowerCase().includes('smash burger'));
      if (!burger || burger.quantity < 2) return 0;
      return burger.price;
    }

    if (appliedCoupon.discountType === 'percentage') {
      return Math.round(subtotal * (appliedCoupon.discountValue / 100));
    }
    if (appliedCoupon.discountType === 'fixed' || appliedCoupon.discountType === 'free_item') {
      return appliedCoupon.discountValue;
    }

    return 0;
  }, [appliedCoupon, subtotal, items]);
  const total = useMemo(() => Math.max(0, subtotal + resCharges - discount), [subtotal, resCharges, discount]);

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
      resCharges,
      discount,
      total,
      isCartOpen,
      setIsCartOpen,
      appliedCoupon,
      setAppliedCoupon,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal, resCharges, discount, total, isCartOpen, appliedCoupon]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
