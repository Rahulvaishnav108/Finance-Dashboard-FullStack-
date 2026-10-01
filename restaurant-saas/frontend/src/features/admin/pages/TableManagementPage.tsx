import React from 'react';
import { Plus, LayoutGrid, Download } from 'lucide-react';
import { useTablesStore } from '../store/tables.store';
import { downloadAllQRCodes } from '../utils/downloadAllQRCodes';
import { useAuth } from '../../../app/providers/AuthProvider';

import {
  TableStatCards,
  TableFilterBar,
  FloorMap,
  TableGrid,
  TableList,
  TableDetailPanel,
  TableModal,
  TableOccupancySummary,
} from '../components/tables';

export function TableManagementPage(): JSX.Element {
  const { user } = useAuth();
  const {
    tables,
    viewMode,
    selectedFloor,
    showAddModal,
    showEditModal,
    selectedTableId,
    setFloor,
    setShowAddModal,
    setShowEditModal,
    fetchTables,
  } = useTablesStore();

  React.useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const floors = [1, 2];

  return (
    <div className="space-y-5">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Table Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Monitor and manage all restaurant tables in real-time
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Floor switcher */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {floors.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFloor(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedFloor === f
                    ? 'bg-white dark:bg-gray-700 text-orange-500 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Floor {f}
              </button>
            ))}
          </div>

          {/* Download All QR */}
          {tables.length === 0 && (
            <span className="text-xs text-amber-500 font-semibold bg-amber-50 dark:bg-amber-950/20 px-3 py-2 rounded-xl border border-amber-100 dark:border-amber-900/30">
              ⚠️ Please add a table
            </span>
          )}
          <button
            type="button"
            onClick={() => downloadAllQRCodes(tables, user?.restaurantId)}
            disabled={tables.length === 0}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm ${
              tables.length === 0
                ? 'bg-gray-300 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-gray-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            title={tables.length === 0 ? "Please add a table first" : "Download QR codes for all tables"}
          >
            <Download className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Download All QR</span>
            <span className="sm:hidden">QR</span>
          </button>

          {/* Add table */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            <span>Add Table</span>
          </button>
        </div>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────────────── */}
      <TableStatCards />

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <TableFilterBar />

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row gap-5 items-start">
        {/* Left – main view */}
        <div className="w-full xl:flex-1 xl:min-w-0 space-y-5">
          {viewMode === 'floor-map' && <FloorMap />}
          {viewMode === 'grid' && <TableGrid />}
          {viewMode === 'list' && <TableList />}
        </div>

        {/* Right – detail + occupancy summary */}
        <div className="w-full xl:w-72 xl:flex-shrink-0 space-y-4">
          {selectedTableId !== null ? (
            <TableDetailPanel />
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-6 text-center text-sm text-gray-400 dark:text-gray-500">
              <LayoutGrid className="w-8 h-8 mx-auto mb-2 opacity-40" />
              Select a table to view details and manage its status
            </div>
          )}

          <TableOccupancySummary />
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      {showAddModal && (
        <TableModal mode="add" onClose={() => setShowAddModal(false)} />
      )}

      {showEditModal && selectedTableId !== null && (
        <TableModal mode="edit" onClose={() => setShowEditModal(false)} />
      )}
    </div>
  );
}