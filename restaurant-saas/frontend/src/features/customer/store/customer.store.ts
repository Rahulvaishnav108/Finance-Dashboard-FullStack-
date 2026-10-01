import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateTableCode, getRecommendedItems } from '../utils/customer.utils';
import { apiClient } from '../../../shared/services/apiClient';

export type DiningSession = {
  sessionId: string;
  restaurantId: string;
  restaurantName: string;
  tableId: string;
  tableNumber: string;
  customerName: string;
  sessionToken: string;
  expiresAt: string;
  status: string;
} | null;

export type CustomerMenuItem = {
  id: number;
  name: string;
  desc: string;
  price: number;
  rating: number;
  reviews: number;
  cat: string;
  veg: boolean;
  img: string;
  badge: string;
};

export type CustomerCartItem = {
  id: number;
  qty: number;
};

export type ServiceRequestItem = {
  id: string;
  label: string;
  description: string;
  type: 'waiter' | 'water' | 'cleaning' | 'other';
  status?: string;
};

export type TrackedOrder = {
  id: string;
  items: string;
  total: number;
  status: 'Placed' | 'Preparing' | 'Ready' | 'Served' | 'Completed';
  eta: string;
  date?: string;
};

export type CustomerNotification = {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'order' | 'offer';
  redirectTo?: string;
};

export type LoyaltyHistory = {
  id: string;
  points: number;
  type: 'earn' | 'redeem';
  description: string;
  date: string;
};

export type OfferCoupon = {
  id: string;
  code: string;
  title: string;
  desc: string;
  requiredPoints: number;
  discountType: 'percentage' | 'fixed' | 'free_item';
  discountValue: number;
  minOrderAmount?: number;
  expiryDate: string;
  claimed: boolean;
};

export type CustomerProfile = {
  name: string;
  phone: string;
  email: string;
  isSmartMember: boolean;
  avatar?: string;
};

export type NotificationPreferences = {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  push: boolean;
};

export const MENU_ITEMS: CustomerMenuItem[] = [
  { id: 1, name: 'Hyderabadi Biryani', desc: 'Aromatic basmati rice cooked with spices', price: 249, rating: 4.6, reviews: 230, cat: 'Biryani', veg: false, img: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80', badge: 'Bestseller' },
  { id: 2, name: 'Butter Chicken', desc: 'Creamy tomato gravy with tender chicken', price: 229, rating: 4.5, reviews: 186, cat: 'Biryani', veg: false, img: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', badge: '' },
  { id: 3, name: 'Veg Pizza', desc: 'Loaded with veggies & extra cheese', price: 199, rating: 4.4, reviews: 182, cat: 'Pizza', veg: true, img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', badge: '' },
  { id: 4, name: 'Smash Burger', desc: 'Double patty with cheese & crispy fries', price: 259, rating: 4.8, reviews: 95, cat: 'Burgers', veg: false, img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', badge: 'Hot' },
  { id: 5, name: 'Gulab Jamun', desc: 'Soft milk-solid dumplings in sugar syrup', price: 99, rating: 4.7, reviews: 148, cat: 'Desserts', veg: true, img: 'https://images.unsplash.com/photo-1542828183-4e0a0d95f83d?w=400&q=80', badge: '' },
  { id: 6, name: 'Mango Lassi', desc: 'Chilled yogurt drink with fresh mango', price: 89, rating: 4.5, reviews: 112, cat: 'Drinks', veg: true, img: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&q=80', badge: '' },
  { id: 7, name: 'Paneer Tikka', desc: 'Grilled cottage cheese with mint chutney', price: 189, rating: 4.6, reviews: 204, cat: 'Biryani', veg: true, img: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80', badge: 'Chef Special' },
  { id: 8, name: 'Cold Coffee', desc: 'Blended iced coffee with cream', price: 129, rating: 4.3, reviews: 89, cat: 'Drinks', veg: true, img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80', badge: '' },
];

export const MENU_CATEGORIES = [
  { label: 'All', icon: '🍽️' },
  { label: 'Biryani', icon: '🍛' },
  { label: 'Pizza', icon: '🍕' },
  { label: 'Burgers', icon: '🍔' },
  { label: 'Desserts', icon: '🧁' },
  { label: 'Drinks', icon: '🥤' },
];

const DEFAULT_OFFERS: OfferCoupon[] = [
  { id: '1', code: 'WELCOME50', title: '₹50 Off Welcome Deal', desc: 'Get flat ₹50 off on orders above ₹200.', requiredPoints: 0, discountType: 'fixed', discountValue: 50, minOrderAmount: 200, expiryDate: '30 Jun 2026', claimed: true },
  { id: '2', code: 'FREEBEV', title: 'Free Mango Lassi', desc: 'Redeem 100 reward points for a free chilled Mango Lassi.', requiredPoints: 100, discountType: 'free_item', discountValue: 89, expiryDate: '15 Jul 2026', claimed: false },
  { id: '3', code: 'BURGERBOGO', title: 'Buy 1 Get 1 Burger', desc: 'Buy any Smash Burger and get another free.', requiredPoints: 150, discountType: 'percentage', discountValue: 100, expiryDate: '10 Jul 2026', claimed: false },
  { id: '4', code: 'CHEF15', title: 'Chef Special 15% OFF', desc: 'Enjoy 15% off on Chef Special dishes.', requiredPoints: 200, discountType: 'percentage', discountValue: 15, expiryDate: '25 Jun 2026', claimed: false },
  { id: '5', code: 'DESSERT80', title: 'Free Gulab Jamun', desc: 'Redeem 80 points to get a free sweet Gulab Jamun dessert.', requiredPoints: 80, discountType: 'free_item', discountValue: 99, expiryDate: '05 Jul 2026', claimed: false },
];

const DEFAULT_NOTIFICATIONS: CustomerNotification[] = [
  { id: 'n1', title: 'Welcome to Smart Dining! 👋', message: 'Scan table QR code to start ordering and earn reward points.', timestamp: '30 mins ago', read: false, type: 'info' },
  { id: 'n2', title: 'Smart Member Activated! ✨', message: 'Congratulations! You are now a Smart Member. Enjoy priority service and exclusive perks.', timestamp: '25 mins ago', read: false, type: 'info' },
  { id: 'n3', title: 'Special Dessert Discount 🧁', message: 'Craving sweets? Get a free Gulab Jamun using 80 points in your Offers tab!', timestamp: 'Yesterday', read: true, type: 'offer' },
];

const DEFAULT_LOYALTY_HISTORY: LoyaltyHistory[] = [
  { id: 'h1', points: 100, type: 'earn', description: 'Welcome bonus points', date: 'Yesterday' },
  { id: 'h2', points: -50, type: 'redeem', description: 'Redeemed for Free Beverage coupon', date: '2 days ago' },
  { id: 'h3', points: 400, type: 'earn', description: 'Earned from Order #ORD-2840', date: '3 days ago' }
];

type CustomerStore = {
  tableCode: string;
  category: string;
  search: string;
  vegOnly: boolean;
  cart: CustomerCartItem[];
  favourites: number[];
  orders: TrackedOrder[];
  serviceRequests: ServiceRequestItem[];

  // Dining Session State
  diningSession: DiningSession;
  lastActivity: number | null;

  // Profile Features State
  profile: CustomerProfile;
  loyaltyPoints: number;
  loyaltyHistory: LoyaltyHistory[];
  offers: OfferCoupon[];
  notificationPreferences: NotificationPreferences;
  notifications: CustomerNotification[];

  setCategory: (category: string) => void;
  setSearch: (search: string) => void;
  toggleVegOnly: () => void;
  addToCart: (id: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  toggleFavourite: (id: number) => void;
  placeOrder: () => TrackedOrder | null;
  reorder: (order: TrackedOrder) => void;
  requestService: (request: ServiceRequestItem) => void;
  getCartQuantity: (id: number) => number;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getFilteredItems: () => CustomerMenuItem[];
  getRecommendedItems: () => CustomerMenuItem[];
  assignRandomTable: () => void;
  setTableCode: (code: string) => void;
  addOrder: (order: TrackedOrder) => void;

  // Dining Session Actions
  setDiningSession: (session: DiningSession) => void;
  clearDiningSession: () => Promise<void>;
  recordActivity: () => void;
  checkSessionInactivity: () => Promise<void>;

  // Profile Features Actions
  updateProfile: (profile: Partial<CustomerProfile>) => void;
  addLoyaltyPoints: (points: number, description: string) => void;
  claimOffer: (offerId: string) => boolean;
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) => void;

  // Notification Actions
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (title: string, message: string, type: 'info' | 'order' | 'offer', redirectTo?: string) => void;
};

export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set, get) => ({
      tableCode: 'T07',
      category: 'All',
      search: '',
      vegOnly: false,
      cart: [],
      favourites: [],
      orders: [
        { id: '#ORD-2841', items: 'Hyderabadi Biryani x1, Mango Lassi x1', total: 338, status: 'Preparing', eta: '12 min', date: '23 Jun, 08:49 PM' },
        { id: '#ORD-2840', items: 'Smash Burger x2', total: 518, status: 'Served', eta: '-', date: '23 Jun, 08:15 PM' },
      ],
      serviceRequests: [],
      diningSession: null,
      lastActivity: null,

      // Initializing Profile Features State
      profile: {
        name: 'Rahul Sharma',
        phone: '+91 98765 43210',
        email: 'rahul.sharma@example.com',
        isSmartMember: true,
      },
      loyaltyPoints: 450,
      loyaltyHistory: DEFAULT_LOYALTY_HISTORY,
      offers: DEFAULT_OFFERS,
      notificationPreferences: {
        email: true,
        sms: true,
        whatsapp: false,
        push: true,
      },
      notifications: DEFAULT_NOTIFICATIONS,

      setCategory: (category) => set({ category }),
      setSearch: (search) => set({ search }),
      toggleVegOnly: () => set((state) => ({ vegOnly: !state.vegOnly })),
      addToCart: (id) => {
        get().recordActivity();
        set((state) => {
          const existing = state.cart.find((item) => item.id === id);
          return {
            cart: existing
              ? state.cart.map((item) => item.id === id ? { ...item, qty: item.qty + 1 } : item)
              : [...state.cart, { id, qty: 1 }],
          };
        });
      },
      removeFromCart: (id) => {
        get().recordActivity();
        set((state) => ({
          cart: state.cart.map((item) => item.id === id ? { ...item, qty: Math.max(0, item.qty - 1) } : item).filter((item) => item.qty > 0),
        }));
      },
      clearCart: () => {
        get().recordActivity();
        set({ cart: [] });
      },
      toggleFavourite: (id) => set((state) => ({
        favourites: state.favourites.includes(id)
          ? state.favourites.filter((favouriteId) => favouriteId !== id)
          : [...state.favourites, id],
      })),
      placeOrder: () => {
        get().recordActivity();
        const { cart } = get();
        if (cart.length === 0) return null;

        const items = cart.map((cartItem) => {
          const item = MENU_ITEMS.find((menuItem) => menuItem.id === cartItem.id);
          return `${item?.name ?? 'Item'} x${cartItem.qty}`;
        }).join(', ');

        const total = get().getTotalPrice();
        const orderId = `#ORD-${Math.floor(3000 + Math.random() * 6000)}`;
        const now = new Date();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${String(now.getHours() % 12 || 12).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
        const order: TrackedOrder = {
          id: orderId,
          items,
          total,
          status: 'Placed',
          eta: '18 min',
          date: formattedDate,
        };

        // Calculate reward points earned: 1 point per 10 Rupees
        const pointsEarned = Math.floor(total / 10);

        set((state) => {
          const updatedHistory = pointsEarned > 0 ? [
            {
              id: `h-${Date.now()}`,
              points: pointsEarned,
              type: 'earn' as const,
              description: `Points earned from Order ${orderId}`,
              date: 'Just now',
            },
            ...state.loyaltyHistory
          ] : state.loyaltyHistory;

          const updatedNotifications = [
            {
              id: `n-${Date.now()}`,
              title: 'Order Placed! 🍽️',
              message: `Your order ${orderId} (Total: ₹${total}) was placed. You earned ${pointsEarned} reward points!`,
              timestamp: 'Just now',
              read: false,
              type: 'order' as const,
            },
            ...state.notifications
          ];

          return {
            orders: [order, ...state.orders],
            cart: [],
            loyaltyPoints: state.loyaltyPoints + pointsEarned,
            loyaltyHistory: updatedHistory,
            notifications: updatedNotifications,
          };
        });

        return order;
      },
      reorder: (order) => {
        get().recordActivity();
        const orderId = `#ORD-${Math.floor(3000 + Math.random() * 6000)}`;
        const now = new Date();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${String(now.getHours() % 12 || 12).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
        const newOrder: TrackedOrder = {
          ...order,
          id: orderId,
          status: 'Placed',
          eta: '18 min',
          date: formattedDate,
        };

        const pointsEarned = Math.floor(newOrder.total / 10);

        set((state) => {
          const updatedHistory = pointsEarned > 0 ? [
            {
              id: `h-${Date.now()}`,
              points: pointsEarned,
              type: 'earn' as const,
              description: `Points earned from Reorder ${orderId}`,
              date: 'Just now',
            },
            ...state.loyaltyHistory
          ] : state.loyaltyHistory;

          const updatedNotifications = [
            {
              id: `n-${Date.now()}`,
              title: 'Reordered items! 🍽️',
              message: `Your reorder ${orderId} was placed. You earned ${pointsEarned} reward points!`,
              timestamp: 'Just now',
              read: false,
              type: 'order' as const,
            },
            ...state.notifications
          ];

          return {
            orders: [newOrder, ...state.orders],
            loyaltyPoints: state.loyaltyPoints + pointsEarned,
            loyaltyHistory: updatedHistory,
            notifications: updatedNotifications,
          };
        });
      },
      requestService: (request) => {
        get().recordActivity();
        set((state) => ({ serviceRequests: [{ ...request, id: `${request.id}-${Date.now()}` }, ...state.serviceRequests] }));
      },
      getCartQuantity: (id) => get().cart.find((item) => item.id === id)?.qty ?? 0,
      getTotalItems: () => get().cart.reduce((total, item) => total + item.qty, 0),
      getTotalPrice: () => get().cart.reduce((total, cartItem) => {
        const item = MENU_ITEMS.find((menuItem) => menuItem.id === cartItem.id);
        return total + (item?.price ?? 0) * cartItem.qty;
      }, 0),
      getFilteredItems: () => {
        const { category, search, vegOnly } = get();
        return MENU_ITEMS.filter((item) => {
          const matchesCategory = category === 'All' || item.cat === category;
          const matchesSearch = !search.trim() || `${item.name} ${item.desc} ${item.cat}`.toLowerCase().includes(search.toLowerCase());
          const matchesVeg = !vegOnly || item.veg;
          return matchesCategory && matchesSearch && matchesVeg;
        });
      },
      getRecommendedItems: () => getRecommendedItems(MENU_ITEMS, get().favourites, get().cart),
      assignRandomTable: () => set({ tableCode: generateTableCode() }),
      setTableCode: (tableCode) => set({ tableCode }),
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),

      setDiningSession: (diningSession) => {
        if (diningSession) {
          localStorage.setItem('x-session-token', diningSession.sessionToken);
          set({
            diningSession,
            tableCode: diningSession.tableNumber,
            lastActivity: Date.now(),
          });
        } else {
          localStorage.removeItem('x-session-token');
          set({
            diningSession: null,
            lastActivity: null,
          });
        }
      },
      clearDiningSession: async () => {
        const { diningSession } = get();
        if (diningSession) {
          try {
            await apiClient.post('/customer/session/end');
          } catch (e) {
            console.error('Failed to end dining session on backend', e);
          }
        }
        localStorage.removeItem('x-session-token');
        set({
          diningSession: null,
          lastActivity: null,
        });
      },
      recordActivity: () => {
        if (get().diningSession) {
          set({ lastActivity: Date.now() });
        }
      },
      checkSessionInactivity: async () => {
        const { diningSession, lastActivity, clearDiningSession } = get();
        if (diningSession && lastActivity) {
          const inactiveMs = Date.now() - lastActivity;
          if (inactiveMs > 20 * 60 * 1000) {
            console.log('Inactivity timeout reached (20 minutes). Clearing session.');
            await clearDiningSession();
          }
        }
      },

      // Profile features action implementations
      updateProfile: (profileUpdates) => set((state) => ({
        profile: { ...state.profile, ...profileUpdates }
      })),
      addLoyaltyPoints: (points, description) => set((state) => ({
        loyaltyPoints: state.loyaltyPoints + points,
        loyaltyHistory: [
          {
            id: `h-${Date.now()}`,
            points,
            type: points > 0 ? 'earn' : 'redeem',
            description,
            date: 'Just now'
          },
          ...state.loyaltyHistory
        ]
      })),
      claimOffer: (offerId) => {
        let success = false;
        set((state) => {
          const offer = state.offers.find((o) => o.id === offerId);
          if (!offer || offer.claimed || state.loyaltyPoints < offer.requiredPoints) {
            return {};
          }

          success = true;
          const updatedOffers = state.offers.map((o) =>
            o.id === offerId ? { ...o, claimed: true } : o
          );

          const updatedHistory: LoyaltyHistory[] = offer.requiredPoints > 0 ? [
            {
              id: `h-${Date.now()}`,
              points: -offer.requiredPoints,
              type: 'redeem' as const,
              description: `Redeemed for ${offer.title}`,
              date: 'Just now'
            },
            ...state.loyaltyHistory
          ] : state.loyaltyHistory;

          const updatedNotifications = [
            {
              id: `n-${Date.now()}`,
              title: 'Offer Unlocked! 🎉',
              message: `You successfully unlocked "${offer.title}". Use coupon code "${offer.code}" during checkout.`,
              timestamp: 'Just now',
              read: false,
              type: 'offer' as const,
            },
            ...state.notifications
          ];

          return {
            loyaltyPoints: state.loyaltyPoints - offer.requiredPoints,
            offers: updatedOffers,
            loyaltyHistory: updatedHistory,
            notifications: updatedNotifications,
          };
        });
        return success;
      },
      updateNotificationPreferences: (prefs) => set((state) => ({
        notificationPreferences: { ...state.notificationPreferences, ...prefs }
      })),

      // Notification action implementations
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n)
      })),
      markAllNotificationsRead: () => set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true }))
      })),
      deleteNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id)
      })),
      clearAllNotifications: () => set({ notifications: [] }),
      addNotification: (title, message, type, redirectTo) => set((state) => ({
        notifications: [
          {
            id: `n-${Date.now()}`,
            title,
            message,
            timestamp: 'Just now',
            read: false,
            type,
            redirectTo,
          },
          ...state.notifications
        ]
      })),
    }),
    {
      name: 'restohub-customer-store',
    }
  )
);
