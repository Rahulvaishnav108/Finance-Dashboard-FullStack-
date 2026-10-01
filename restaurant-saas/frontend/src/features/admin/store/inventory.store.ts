import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ────────────────────────────────────────────────────────────────────

export type ItemCategory  = 'Ingredients' | 'Beverages' | 'Packaging' | 'Cleaning Supplies' | 'Other';
export type ItemStatus    = 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Expiring Soon';
export type ItemTab       = 'All Items' | ItemCategory;

export interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  unit: string;
  currentStock: number;
  parLevel: number;
  status: ItemStatus;
  lastUpdated: string;
  imageEmoji: string;
}

export interface InventoryStats {
  totalItems: number;
  totalItemsChange: string;
  totalValue: string;
  totalValueChange: string;
  lowStockItems: number;
  lowStockChange: string;
  outOfStockItems: number;
  outOfStockChange: string;
  expiringSoon: number;
}

export interface StockAlert {
  id: string;
  name: string;
  detail: string;
  status: 'Low Stock' | 'Out of Stock';
  imageEmoji: string;
}

export interface Supplier {
  id: string;
  name: string;
  spent: string;
  color: string;
  initials: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface StatusDistribution {
  inStock: number;
  inStockPct: number;
  lowStock: number;
  lowStockPct: number;
  outOfStock: number;
  outOfStockPct: number;
  expiringSoon: number;
  expiringSoonPct: number;
}

export interface NewItemForm {
  name: string;
  category: ItemCategory;
  unit: string;
  currentStock: string;
  parLevel: string;
  imageEmoji: string;
}

interface InventoryStore {
  stats: InventoryStats;
  items: InventoryItem[];
  stockAlerts: StockAlert[];
  topSuppliers: Supplier[];
  valueOverTime: ChartDataPoint[];
  topUsedIngredients: ChartDataPoint[];
  statusDistribution: StatusDistribution;

  activeTab: ItemTab;
  activeCategory: ItemCategory | 'All Categories';
  searchQuery: string;
  currentPage: number;
  perPage: number;

  // Modal states
  showAddItemModal: boolean;
  showImportModal: boolean;
  showStockAlertsModal: boolean;
  showSuppliersModal: boolean;
  showValueChartModal: boolean;
  showDonutModal: boolean;
  showIngredientsModal: boolean;

  setActiveTab:      (t: ItemTab) => void;
  setActiveCategory: (c: ItemCategory | 'All Categories') => void;
  setSearchQuery:    (q: string) => void;
  setCurrentPage:    (p: number) => void;

  // Modal toggles
  setShowAddItemModal:      (v: boolean) => void;
  setShowImportModal:       (v: boolean) => void;
  setShowStockAlertsModal:  (v: boolean) => void;
  setShowSuppliersModal:    (v: boolean) => void;
  setShowValueChartModal:   (v: boolean) => void;
  setShowDonutModal:        (v: boolean) => void;
  setShowIngredientsModal:  (v: boolean) => void;

  // Actions
  addItem: (form: NewItemForm) => void;
  deleteItem: (id: string) => void;
  importItems: (raw: string) => void;
}

// ── Seed Data ─────────────────────────────────────────────────────────────────

const seedItems: InventoryItem[] = [
  { id: 'I001', name: 'Tomatoes',           category: 'Ingredients',       unit: 'kg',  currentStock: 24.50, parLevel: 20.00, status: 'In Stock',      lastUpdated: 'May 20, 2025', imageEmoji: '🍅' },
  { id: 'I002', name: 'Chicken Breast',     category: 'Ingredients',       unit: 'kg',  currentStock: 15.20, parLevel: 15.00, status: 'Low Stock',     lastUpdated: 'May 20, 2025', imageEmoji: '🍗' },
  { id: 'I003', name: 'Olive Oil',          category: 'Ingredients',       unit: 'L',   currentStock:  3.00, parLevel:  5.00, status: 'Low Stock',     lastUpdated: 'May 19, 2025', imageEmoji: '🫒' },
  { id: 'I004', name: 'Mozzarella Cheese',  category: 'Ingredients',       unit: 'kg',  currentStock:  0.00, parLevel: 10.00, status: 'Out of Stock',  lastUpdated: 'May 19, 2025', imageEmoji: '🧀' },
  { id: 'I005', name: 'Lettuce',            category: 'Ingredients',       unit: 'kg',  currentStock:  8.50, parLevel: 10.00, status: 'Low Stock',     lastUpdated: 'May 18, 2025', imageEmoji: '🥬' },
  { id: 'I006', name: 'Coca Cola',          category: 'Beverages',         unit: 'pcs', currentStock: 48,    parLevel: 30,    status: 'In Stock',      lastUpdated: 'May 18, 2025', imageEmoji: '🥤' },
  { id: 'I007', name: 'Paper Cups (12oz)',  category: 'Packaging',         unit: 'pcs', currentStock: 120,   parLevel: 100,   status: 'In Stock',      lastUpdated: 'May 18, 2025', imageEmoji: '🧃' },
  { id: 'I008', name: 'Disinfectant Spray', category: 'Cleaning Supplies', unit: 'pcs', currentStock:  2,    parLevel:  5,    status: 'Low Stock',     lastUpdated: 'May 17, 2025', imageEmoji: '🧴' },
  { id: 'I009', name: 'Garlic',             category: 'Ingredients',       unit: 'kg',  currentStock: 12.00, parLevel:  8.00, status: 'In Stock',      lastUpdated: 'May 16, 2025', imageEmoji: '🧄' },
  { id: 'I010', name: 'Onions',             category: 'Ingredients',       unit: 'kg',  currentStock:  9.50, parLevel: 10.00, status: 'Low Stock',     lastUpdated: 'May 16, 2025', imageEmoji: '🧅' },
  { id: 'I011', name: 'Sparkling Water',    category: 'Beverages',         unit: 'pcs', currentStock: 60,    parLevel: 40,    status: 'In Stock',      lastUpdated: 'May 15, 2025', imageEmoji: '💧' },
  { id: 'I012', name: 'Take-out Boxes',     category: 'Packaging',         unit: 'pcs', currentStock: 200,   parLevel: 150,   status: 'In Stock',      lastUpdated: 'May 15, 2025', imageEmoji: '📦' },
  { id: 'I013', name: 'Floor Cleaner',      category: 'Cleaning Supplies', unit: 'L',   currentStock:  4.00, parLevel:  5.00, status: 'Low Stock',     lastUpdated: 'May 14, 2025', imageEmoji: '🧹' },
  { id: 'I014', name: 'Bell Peppers',       category: 'Ingredients',       unit: 'kg',  currentStock:  6.00, parLevel:  6.00, status: 'Expiring Soon', lastUpdated: 'May 14, 2025', imageEmoji: '🫑' },
  { id: 'I015', name: 'Orange Juice',       category: 'Beverages',         unit: 'L',   currentStock: 18,    parLevel: 12,    status: 'In Stock',      lastUpdated: 'May 13, 2025', imageEmoji: '🍊' },
];

function deriveStatus(currentStock: number, parLevel: number): ItemStatus {
  if (currentStock === 0) return 'Out of Stock';
  if (currentStock <= parLevel * 0.5) return 'Low Stock';
  if (currentStock <= parLevel) return 'Low Stock';
  return 'In Stock';
}

function recomputeStats(items: InventoryItem[]): InventoryStats {
  const low     = items.filter((i) => i.status === 'Low Stock').length;
  const out     = items.filter((i) => i.status === 'Out of Stock').length;
  const expiring = items.filter((i) => i.status === 'Expiring Soon').length;
  return {
    totalItems: items.length,
    totalItemsChange: '+12.5%',
    totalValue: `₹${(items.length * 1640).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    totalValueChange: '+8.3%',
    lowStockItems: low,
    lowStockChange: `-${low}`,
    outOfStockItems: out,
    outOfStockChange: `-${out}`,
    expiringSoon: expiring,
  };
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set) => ({
      stats: recomputeStats(seedItems),

      items: seedItems,

      stockAlerts: [
        { id: 'A001', name: 'Chicken Breast',     detail: '15.20 kg left',  status: 'Low Stock',    imageEmoji: '🍗' },
        { id: 'A002', name: 'Olive Oil',          detail: '3.00 L left',    status: 'Low Stock',    imageEmoji: '🫒' },
        { id: 'A003', name: 'Mozzarella Cheese',  detail: 'Out of stock',   status: 'Out of Stock', imageEmoji: '🧀' },
        { id: 'A004', name: 'Disinfectant Spray', detail: '2 pcs left',     status: 'Low Stock',    imageEmoji: '🧴' },
        { id: 'A005', name: 'Lettuce',            detail: '8.50 kg left',   status: 'Low Stock',    imageEmoji: '🥬' },
        { id: 'A006', name: 'Onions',             detail: '9.50 kg left',   status: 'Low Stock',    imageEmoji: '🧅' },
        { id: 'A007', name: 'Floor Cleaner',      detail: '4.00 L left',    status: 'Low Stock',    imageEmoji: '🧹' },
      ],

      topSuppliers: [
        { id: 'S001', name: 'Fresh Farm Foods',     spent: '₹12,450.00', color: 'bg-green-500',  initials: 'FF' },
        { id: 'S002', name: 'Global Beverages',     spent: '₹6,780.50',  color: 'bg-blue-500',   initials: 'GB' },
        { id: 'S003', name: 'Pack & More Supplies', spent: '₹3,240.00',  color: 'bg-orange-500', initials: 'PM' },
        { id: 'S004', name: 'CleanPro India',       spent: '₹1,890.00',  color: 'bg-purple-500', initials: 'CP' },
        { id: 'S005', name: 'Agro Direct',          spent: '₹1,320.00',  color: 'bg-red-500',    initials: 'AD' },
      ],

      valueOverTime: [
        { label: 'Apr 20', value: 18000 },
        { label: 'Apr 27', value: 19500 },
        { label: 'May 4',  value: 17800 },
        { label: 'May 11', value: 21000 },
        { label: 'May 18', value: 24680 },
      ],

      topUsedIngredients: [
        { label: 'Chicken Breast', value: 90 },
        { label: 'Tomatoes',       value: 75 },
        { label: 'Lettuce',        value: 55 },
        { label: 'Cheese',         value: 40 },
        { label: 'Olive Oil',      value: 30 },
      ],

      statusDistribution: {
        inStock: 156, inStockPct: 62.9,
        lowStock: 18, lowStockPct: 7.3,
        outOfStock: 6, outOfStockPct: 2.4,
        expiringSoon: 11, expiringSoonPct: 4.4,
      },

      activeTab:      'All Items',
      activeCategory: 'All Categories',
      searchQuery:    '',
      currentPage:    1,
      perPage:        8,

      // Modals
      showAddItemModal:     false,
      showImportModal:      false,
      showStockAlertsModal: false,
      showSuppliersModal:   false,
      showValueChartModal:  false,
      showDonutModal:       false,
      showIngredientsModal: false,

      setActiveTab:      (t) => set({ activeTab: t,      currentPage: 1 }),
      setActiveCategory: (c) => set({ activeCategory: c, currentPage: 1 }),
      setSearchQuery:    (q) => set({ searchQuery: q,    currentPage: 1 }),
      setCurrentPage:    (p) => set({ currentPage: p }),

      setShowAddItemModal:     (v) => set({ showAddItemModal: v }),
      setShowImportModal:      (v) => set({ showImportModal: v }),
      setShowStockAlertsModal: (v) => set({ showStockAlertsModal: v }),
      setShowSuppliersModal:   (v) => set({ showSuppliersModal: v }),
      setShowValueChartModal:  (v) => set({ showValueChartModal: v }),
      setShowDonutModal:       (v) => set({ showDonutModal: v }),
      setShowIngredientsModal: (v) => set({ showIngredientsModal: v }),

      addItem: (form) =>
        set((state) => {
          const currentStock = parseFloat(form.currentStock) || 0;
          const parLevel     = parseFloat(form.parLevel) || 0;
          const newItem: InventoryItem = {
            id:           `I${String(state.items.length + 1).padStart(3, '0')}`,
            name:         form.name.trim(),
            category:     form.category,
            unit:         form.unit.trim() || 'pcs',
            currentStock,
            parLevel,
            status:       deriveStatus(currentStock, parLevel),
            lastUpdated:  new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            imageEmoji:   form.imageEmoji || '📦',
          };
          const items = [newItem, ...state.items];
          return {
            items,
            stats: recomputeStats(items),
            showAddItemModal: false,
          };
        }),

      deleteItem: (id) =>
        set((state) => {
          const items = state.items.filter((i) => i.id !== id);
          return { items, stats: recomputeStats(items) };
        }),

      importItems: (raw) =>
        set((state) => {
          const lines = raw.trim().split('\n').filter(Boolean);
          const newItems: InventoryItem[] = lines.map((line, idx) => {
            const parts = line.split(',').map((s) => s.trim());
            const currentStock = parseFloat(parts[2]) || 0;
            const parLevel     = parseFloat(parts[3]) || 0;
            return {
              id:           `IMP${Date.now()}_${idx}`,
              name:         parts[0] || `Item ${idx + 1}`,
              category:     (parts[1] as ItemCategory) || 'Other',
              unit:         parts[4] || 'pcs',
              currentStock,
              parLevel,
              status:       deriveStatus(currentStock, parLevel),
              lastUpdated:  new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
              imageEmoji:   parts[5] || '📦',
            };
          });
          const items = [...newItems, ...state.items];
          return { items, stats: recomputeStats(items), showImportModal: false };
        }),
    }),
    {
      name: 'admin-inventory-store',
    }
  )
);
