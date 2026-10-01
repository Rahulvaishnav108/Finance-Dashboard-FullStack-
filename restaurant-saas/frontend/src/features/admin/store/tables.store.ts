// src/features/admin/store/tables.store.ts
// Zustand store for table management with backend API integration

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../../../shared/services/apiClient';

// ── Types ─────────────────────────────────────────────────────────────────────

export type TableStatus = 'Available' | 'Occupied' | 'Reserved' | 'Cleaning' | 'Blocked';
export type TableShape = 'Round' | 'Square' | 'Rectangle';
export type TableSection = 'Indoor' | 'Outdoor' | 'Bar' | 'Private';

export interface Table {
  id: string; // MongoDB ObjectId
  label: string;
  seats: number;
  shape: TableShape;
  section: TableSection;
  floor: number;
  status: TableStatus;
  x: number;
  y: number;
  notes?: string;
  qr_token?: string;
  currentOrder?: {
    id: string;
    time: string;
    amount: number;
    items: number;
  };
  reservedFor?: string;
  reservedAt?: string;
}

export interface TableFilter {
  section: TableSection | 'All';
  status: TableStatus | 'All';
  floor: number | 'All';
  search: string;
}

export type ViewMode = 'grid' | 'list' | 'floor' | 'floor-map';

interface TablesStore {
  // Data
  tables: Table[];
  tablePositions: Record<string, { x: number; y: number }>;

  // UI state
  viewMode: ViewMode;
  stats: {
    total: number;
    available: number;
    occupied: number;
    reserved: number;
    cleaning: number;
    blocked: number;
    occupancyRate: number;
    revenueToday: number;
    coversTodday: number;
    avgTurnover: string;
  };
  selectedFloor: number;
  selectedTableId: string | null;
  showAddModal: boolean;
  showEditModal: boolean;
  filter: TableFilter;

  // Actions
  fetchTables: () => Promise<void>;
  addTable: (table: Omit<Table, 'id' | 'x' | 'y'>) => Promise<void>;
  updateTable: (id: string, updates: Partial<Table>) => Promise<void>;
  deleteTable: (id: string) => Promise<void>;
  updateTableStatus: (id: string, status: TableStatus) => Promise<void>;
  regenerateQrCode: (id: string) => Promise<void>;
  selectTable: (id: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setFloor: (floor: number) => void;
  setShowAddModal: (show: boolean) => void;
  setShowEditModal: (show: boolean) => void;
  setFilter: (patch: Partial<TableFilter>) => void;
  setSearchQuery: (query: string) => void;
}

// ── Default layout mapping (to preserve map coordinates in UI) ────────────────

const layoutDefaults: Record<string, { x: number; y: number; shape: TableShape; section: TableSection; floor: number }> = {
  'T1': { x: 10, y: 15, shape: 'Square',    section: 'Indoor',  floor: 1 },
  'T2': { x: 30, y: 15, shape: 'Rectangle', section: 'Indoor',  floor: 1 },
  'T3': { x: 50, y: 15, shape: 'Round',     section: 'Indoor',  floor: 1 },
  'T4': { x: 70, y: 15, shape: 'Rectangle', section: 'Private', floor: 1 },
  'T5': { x: 10, y: 45, shape: 'Square',    section: 'Outdoor', floor: 1 },
  'B1': { x: 30, y: 45, shape: 'Round',     section: 'Bar',     floor: 1 },
  'T6': { x: 10, y: 15, shape: 'Square',    section: 'Indoor',  floor: 2 },
  'T7': { x: 30, y: 15, shape: 'Rectangle', section: 'Indoor',  floor: 2 },
};

function mapBackendStatusToFrontendStatus(status: string, isActive: boolean): TableStatus {
  if (!isActive) return 'Blocked';
  switch (status) {
    case 'AVAILABLE':
      return 'Available';
    case 'OCCUPIED':
    case 'ORDERING':
    case 'BILL_PENDING':
    case 'PAYMENT_PENDING':
    case 'PAID':
      return 'Occupied';
    case 'RESERVED':
      return 'Reserved';
    case 'NEEDS_CLEANING':
    case 'CLEANING_IN_PROGRESS':
      return 'Cleaning';
    default:
      return 'Available';
  }
}

function mapFrontendStatusToBackendStatus(status: TableStatus): string {
  switch (status) {
    case 'Available':
      return 'AVAILABLE';
    case 'Occupied':
      return 'OCCUPIED';
    case 'Reserved':
      return 'RESERVED';
    case 'Cleaning':
      return 'NEEDS_CLEANING';
    default:
      return 'AVAILABLE';
  }
}

function computeStats(tables: Table[]) {
  const total = tables.length;
  const available = tables.filter((t) => t.status === 'Available').length;
  const occupied = tables.filter((t) => t.status === 'Occupied').length;
  const reserved = tables.filter((t) => t.status === 'Reserved').length;
  const cleaning = tables.filter((t) => t.status === 'Cleaning').length;
  const blocked = tables.filter((t) => t.status === 'Blocked').length;

  const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;
  const revenueToday = tables.reduce((sum, t) => sum + (t.currentOrder?.amount ?? 0), 0);
  const coversTodday = tables.reduce((sum, t) => sum + (t.currentOrder ? t.seats : 0), 0);
  const avgTurnover = occupied > 0 ? `50 min` : '—';

  return {
    total,
    available,
    occupied,
    reserved,
    cleaning,
    blocked,
    occupancyRate,
    revenueToday,
    coversTodday,
    avgTurnover,
  };
}

export const useTablesStore = create<TablesStore>()(
  persist(
    (set, get) => ({
      tables: [],
      tablePositions: {},
      viewMode: 'grid',
      stats: computeStats([]),
      selectedFloor: 1,
      selectedTableId: null,
      showAddModal: false,
      showEditModal: false,
      filter: { section: 'All', status: 'All', floor: 'All', search: '' },

      fetchTables: async () => {
        try {
          const res = await apiClient.get('/admin/tables');
          const backendTables = res.data?.data?.tables || [];

          const tablePositions = get().tablePositions || {};
          const mappedTables: Table[] = backendTables.map((t: any) => {
            const tableNumber = t.tableNumber || 'Table';
            const tableId = t._id || t.id;
            const layout = layoutDefaults[tableNumber] || {
              x: 50,
              y: 50,
              shape: t.capacity > 4 ? 'Rectangle' : 'Square',
              section: (t.section as TableSection) || 'Indoor',
              floor: t.floor || 1,
            };

            // Retrieve from persistent tablePositions first
            let x = layout.x;
            let y = layout.y;
            if (tablePositions[tableId]) {
              x = tablePositions[tableId].x;
              y = tablePositions[tableId].y;
            }

            // Parse optional order details if occupied
            let currentOrder = undefined;
            if (t.status === 'OCCUPIED' && t.currentSessionId) {
              currentOrder = {
                id: 'ORD-ACTIVE',
                time: 'Just now',
                amount: 0,
                items: 0,
              };
            }

            return {
              id: tableId,
              label: tableNumber,
              seats: t.capacity,
              shape: layout.shape,
              section: (t.section as TableSection) || layout.section,
              floor: t.floor || layout.floor,
              status: mapBackendStatusToFrontendStatus(t.status, t.isActive !== false),
              x,
              y,
              qr_token: t.qrToken,
              notes: t.notes || '',
              currentOrder,
            };
          });

          set({ tables: mappedTables, stats: computeStats(mappedTables) });
        } catch (err) {
          console.error('Failed to fetch tables from API', err);
        }
      },

      addTable: async (table) => {
        try {
          const payload = {
            tableNumber: table.label,
            capacity: table.seats,
            floor: table.floor,
            section: table.section,
            status: mapFrontendStatusToBackendStatus(table.status),
          };
          await apiClient.post('/admin/tables', payload);
          await get().fetchTables();
        } catch (err) {
          console.error('Failed to add table via API', err);
        }
      },

      updateTable: async (id, updates) => {
        try {
          if (updates.x !== undefined || updates.y !== undefined) {
            set((state) => {
              const newPositions = {
                ...state.tablePositions,
                [id]: {
                  x: updates.x !== undefined ? updates.x : (state.tablePositions[id]?.x ?? 50),
                  y: updates.y !== undefined ? updates.y : (state.tablePositions[id]?.y ?? 50),
                },
              };
              return {
                tablePositions: newPositions,
                tables: state.tables.map((t) =>
                  t.id === id ? { ...t, ...updates } : t
                ),
              };
            });
          }

          const payload: any = {};
          if (updates.label !== undefined) payload.tableNumber = updates.label;
          if (updates.seats !== undefined) payload.capacity = updates.seats;
          if (updates.floor !== undefined) payload.floor = updates.floor;
          if (updates.section !== undefined) payload.section = updates.section;
          if (updates.status !== undefined) {
            payload.isActive = updates.status !== 'Blocked';
          }

          const hasApiUpdates = Object.keys(payload).length > 0;
          if (hasApiUpdates) {
            await apiClient.patch(`/admin/tables/${id}`, payload);
            if (updates.status !== undefined && updates.status !== 'Blocked') {
              await apiClient.patch(`/tables/${id}/status`, {
                status: mapFrontendStatusToBackendStatus(updates.status),
              });
            }
          }
          await get().fetchTables();
        } catch (err) {
          console.error('Failed to update table via API', err);
        }
      },

      deleteTable: async (id) => {
        try {
          await apiClient.delete(`/admin/tables/${id}`);
          await get().fetchTables();
          set({ selectedTableId: null });
        } catch (err) {
          console.error('Failed to delete table via API', err);
        }
      },

      updateTableStatus: async (id, status) => {
        try {
          if (status === 'Blocked') {
            await apiClient.patch(`/admin/tables/${id}`, { isActive: false });
          } else {
            await apiClient.patch(`/admin/tables/${id}`, { isActive: true });
            const payload = {
              status: mapFrontendStatusToBackendStatus(status),
            };
            await apiClient.patch(`/tables/${id}/status`, payload);
          }
          await get().fetchTables();
        } catch (err) {
          console.error('Failed to update table status via API', err);
        }
      },

      regenerateQrCode: async (id) => {
        try {
          await apiClient.post(`/admin/tables/${id}/qr/regenerate`);
          await get().fetchTables();
        } catch (err) {
          console.error('Failed to regenerate table QR code via API', err);
        }
      },

      selectTable: (id) => set({ selectedTableId: id }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setFloor: (floor) => set({ selectedFloor: floor }),
      setShowAddModal: (show) => set({ showAddModal: show }),
      setShowEditModal: (show) => set({ showEditModal: show }),
      setFilter: (patch) =>
        set((state) => ({ filter: { ...state.filter, ...patch } })),
      setSearchQuery: (query) =>
        set((state) => ({ filter: { ...state.filter, search: query } })),
    }),
    {
      name: 'ra-tables-store',
      partialize: (state) => ({
        viewMode: state.viewMode,
        selectedFloor: state.selectedFloor,
        tablePositions: state.tablePositions,
      }),
    },
  ),
);
