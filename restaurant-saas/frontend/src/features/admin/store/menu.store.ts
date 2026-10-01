import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ─────────────────────────────────────────────────────────────────────

export type MenuItemStatus = 'Available' | 'Unavailable' | 'Low Stock' | 'Out of Stock';
export type SortOption = 'Name A-Z' | 'Name Z-A' | 'Price Low-High' | 'Price High-Low' | 'Stock Low-High';
export type FilterTab = 'All Items' | 'Available' | 'Unavailable' | 'Low Stock';

export interface AdvancedFilter {
  minPrice: string;
  maxPrice: string;
  statuses: MenuItemStatus[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  status: MenuItemStatus;
  stock: number;
  image: string;
  enabled: boolean;
}

export interface Category {
  id: string;
  name: string;
  count: number;
}

export interface MenuStore {
  // Data
  items: MenuItem[];
  categories: Category[];

  // Filters / UI state
  activeCategory: string;
  activeFilter: FilterTab;
  advancedFilter: AdvancedFilter;
  searchQuery: string;
  sortOption: SortOption;
  currentPage: number;
  perPage: number;

  // Actions – items
  setActiveCategory: (id: string) => void;
  setActiveFilter: (f: FilterTab) => void;
  setAdvancedFilter: (f: AdvancedFilter) => void;
  setSearchQuery: (q: string) => void;
  setSortOption: (s: SortOption) => void;
  setCurrentPage: (p: number) => void;
  toggleItemEnabled: (id: string) => void;
  updateItemStatus: (id: string, status: MenuItemStatus) => void;
  addItem: (item: Omit<MenuItem, 'id'>) => void;
  updateItem: (id: string, data: Partial<Omit<MenuItem, 'id'>>) => void;
  deleteItem: (id: string) => void;

  // Actions – categories
  addCategory: (name: string) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
}

// ── Seed Data ─────────────────────────────────────────────────────────────────

const seedCategories: Category[] = [
  { id: 'all',         name: 'All Categories', count: 12 },
  { id: 'appetizers',  name: 'Appetizers',     count: 1  },
  { id: 'main-course', name: 'Main Course',    count: 5  },
  { id: 'beverages',   name: 'Beverages',      count: 2  },
  { id: 'desserts',    name: 'Desserts',       count: 1  },
  { id: 'salads',      name: 'Salads',         count: 1  },
  { id: 'sides',       name: 'Sides',          count: 2  },
];

const seedItems: MenuItem[] = [
  {
    id: 'm1', name: 'Margherita Pizza', description: 'Classic delight with 100% fresh ingredients',
    price: 1050, category: 'main-course', status: 'Available', stock: 45,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=120&h=120&fit=crop',
    enabled: true,
  },
  {
    id: 'm2', name: 'Grilled Salmon', description: 'Fresh salmon with lemon butter sauce',
    price: 1590, category: 'main-course', status: 'Available', stock: 25,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=120&h=120&fit=crop',
    enabled: true,
  },
  {
    id: 'm3', name: 'Chicken Burger', description: 'Grilled chicken with special sauce',
    price: 820, category: 'main-course', status: 'Available', stock: 60,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=120&h=120&fit=crop',
    enabled: true,
  },
  {
    id: 'm4', name: 'Caesar Salad', description: 'Crisp romaine with caesar dressing',
    price: 630, category: 'salads', status: 'Available', stock: 30,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=120&h=120&fit=crop',
    enabled: true,
  },
  {
    id: 'm5', name: 'Chocolate Cake', description: 'Rich chocolate layered cake',
    price: 520, category: 'desserts', status: 'Available', stock: 20,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=120&h=120&fit=crop',
    enabled: true,
  },
  {
    id: 'm6', name: 'Lemonade', description: 'Fresh lemonade with mint',
    price: 270, category: 'beverages', status: 'Available', stock: 50,
    image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=120&h=120&fit=crop',
    enabled: true,
  },
  {
    id: 'm7', name: 'Pasta Alfredo', description: 'Creamy alfredo pasta',
    price: 990, category: 'main-course', status: 'Available', stock: 40,
    image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=120&h=120&fit=crop',
    enabled: true,
  },
  {
    id: 'm8', name: 'French Fries', description: 'Crispy golden french fries',
    price: 330, category: 'sides', status: 'Low Stock', stock: 9,
    image: 'https://images.unsplash.com/photo-1630431341973-02e1b662ec35?w=120&h=120&fit=crop',
    enabled: true,
  },
  {
    id: 'm9', name: 'BBQ Chicken Wings', description: 'Spicy BBQ chicken wings',
    price: 750, category: 'appetizers', status: 'Available', stock: 35,
    image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=120&h=120&fit=crop',
    enabled: true,
  },
  {
    id: 'm10', name: 'Iced Coffee', description: 'Chilled coffee with ice',
    price: 380, category: 'beverages', status: 'Available', stock: 25,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=120&h=120&fit=crop',
    enabled: true,
  },
  {
    id: 'm11', name: 'Vegetable Stir Fry', description: 'Stir fried veggies with asian sauce',
    price: 830, category: 'main-course', status: 'Available', stock: 30,
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=120&h=120&fit=crop',
    enabled: true,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function rebuildCounts(items: MenuItem[], categories: Category[]): Category[] {
  return categories.map((cat) => ({
    ...cat,
    count: cat.id === 'all' ? items.length : items.filter((i) => i.category === cat.id).length,
  }));
}

const DEFAULT_ADVANCED_FILTER: AdvancedFilter = { minPrice: '', maxPrice: '', statuses: [] };

// ── Store ─────────────────────────────────────────────────────────────────────

let nextItemId = 100;
let nextCatId  = 200;

export const useMenuStore = create<MenuStore>()(
  persist(
    (set) => ({
      items:      seedItems,
      categories: rebuildCounts(seedItems, seedCategories),

      activeCategory:  'all',
      activeFilter:    'All Items',
      advancedFilter:  DEFAULT_ADVANCED_FILTER,
      searchQuery:     '',
      sortOption:      'Name A-Z',
      currentPage:     1,
      perPage:         12,

      setActiveCategory:  (id) => set({ activeCategory: id,  currentPage: 1 }),
      setActiveFilter:    (f)  => set({ activeFilter: f,     currentPage: 1 }),
      setAdvancedFilter:  (f)  => set({ advancedFilter: f,   currentPage: 1 }),
      setSearchQuery:     (q)  => set({ searchQuery: q,      currentPage: 1 }),
      setSortOption:      (s)  => set({ sortOption: s }),
      setCurrentPage:     (p)  => set({ currentPage: p }),

      toggleItemEnabled: (id) =>
        set((state) => {
          const items = state.items.map((item) =>
            item.id === id ? { ...item, enabled: !item.enabled } : item
          );
          return { items, categories: rebuildCounts(items, state.categories) };
        }),

      updateItemStatus: (id, status) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, status } : item
          ),
        })),

      addItem: (item) =>
        set((state) => {
          const newItem: MenuItem = { ...item, id: `m${++nextItemId}` };
          const items = [...state.items, newItem];
          return { items, categories: rebuildCounts(items, state.categories), currentPage: 1 };
        }),

      updateItem: (id, data) =>
        set((state) => {
          const items = state.items.map((item) =>
            item.id === id ? { ...item, ...data } : item
          );
          return { items, categories: rebuildCounts(items, state.categories) };
        }),

      deleteItem: (id) =>
        set((state) => {
          const items = state.items.filter((item) => item.id !== id);
          return { items, categories: rebuildCounts(items, state.categories) };
        }),

      addCategory: (name) =>
        set((state) => {
          const newCat: Category = {
            id:    `cat${++nextCatId}-${slugify(name)}`,
            name,
            count: 0,
          };
          const withoutAll = state.categories.filter((c) => c.id !== 'all');
          const allCat     = state.categories.find((c)  => c.id === 'all')!;
          return { categories: [allCat, ...withoutAll, newCat] };
        }),

      updateCategory: (id, name) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, name } : c
          ),
        })),

      deleteCategory: (id) =>
        set((state) => {
          const items = state.items.map((item) =>
            item.category === id ? { ...item, category: 'uncategorised' } : item
          );
          const categories = state.categories.filter((c) => c.id !== id && c.id !== 'all');
          const allCat     = { ...state.categories.find((c) => c.id === 'all')!, count: items.length };
          return {
            items,
            categories: [allCat, ...categories],
            activeCategory: state.activeCategory === id ? 'all' : state.activeCategory,
          };
        }),
    }),
    {
      name: 'admin-menu-store',
    }
  )
);

// ── Selector (pure, no hooks) ─────────────────────────────────────────────────

export function getFilteredItems(store: MenuStore): MenuItem[] {
  let result = [...store.items];

  // Category
  if (store.activeCategory !== 'all') {
    result = result.filter((i) => i.category === store.activeCategory);
  }

  // Tab filter
  if (store.activeFilter === 'Available')   result = result.filter((i) => i.status === 'Available');
  if (store.activeFilter === 'Unavailable') result = result.filter((i) => i.status === 'Unavailable' || i.status === 'Out of Stock');
  if (store.activeFilter === 'Low Stock')   result = result.filter((i) => i.status === 'Low Stock');

  // Advanced filter — price range
  const { minPrice, maxPrice, statuses } = store.advancedFilter;
  const min = minPrice !== '' ? parseFloat(minPrice) : null;
  const max = maxPrice !== '' ? parseFloat(maxPrice) : null;
  if (min !== null && !isNaN(min)) result = result.filter((i) => i.price >= min);
  if (max !== null && !isNaN(max)) result = result.filter((i) => i.price <= max);

  // Advanced filter — statuses (additive: show any of the selected)
  if (statuses.length > 0) {
    result = result.filter((i) => statuses.includes(i.status));
  }

  // Search
  if (store.searchQuery.trim()) {
    const q = store.searchQuery.toLowerCase();
    result = result.filter((i) =>
      i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
    );
  }

  // Sort
  switch (store.sortOption) {
    case 'Name A-Z':       result.sort((a, b) => a.name.localeCompare(b.name)); break;
    case 'Name Z-A':       result.sort((a, b) => b.name.localeCompare(a.name)); break;
    case 'Price Low-High': result.sort((a, b) => a.price - b.price);            break;
    case 'Price High-Low': result.sort((a, b) => b.price - a.price);            break;
    case 'Stock Low-High': result.sort((a, b) => a.stock - b.stock);            break;
  }

  return result;
}