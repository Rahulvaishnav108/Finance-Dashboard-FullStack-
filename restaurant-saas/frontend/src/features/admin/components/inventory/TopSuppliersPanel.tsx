import React from 'react';
import { X, Building2 } from 'lucide-react';
import { useInventoryStore } from '../../store/inventory.store';

function SuppliersModal() {
  const { topSuppliers, showSuppliersModal, setShowSuppliersModal } = useInventoryStore();
  if (!showSuppliersModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 w-full h-full cursor-default"
        onClick={() => setShowSuppliersModal(false)}
        aria-label="Close modal"
      />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-5 sm:p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-blue-500" />
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">All Suppliers</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowSuppliersModal(false)}
            className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="space-y-3">
          {topSuppliers.map((s, idx) => (
            <div key={s.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <span className="text-xs font-bold text-gray-400 w-5 text-center">#{idx + 1}</span>
              <div
                className={`w-9 h-9 rounded-full ${s.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
              >
                {s.initials}
              </div>
              <p className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{s.name}</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">{s.spent}</p>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowSuppliersModal(false)}
          className="w-full mt-5 px-4 py-2.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export function TopSuppliersPanel() {
  const { topSuppliers, setShowSuppliersModal } = useInventoryStore();
  const preview = topSuppliers.slice(0, 3);

  return (
    <>
      <SuppliersModal />
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Top Suppliers</h3>
          <button
            type="button"
            onClick={() => setShowSuppliersModal(true)}
            className="text-xs text-orange-500 hover:text-orange-600 dark:text-orange-400 font-medium transition-colors"
          >
            View all
          </button>
        </div>

        <div className="space-y-3">
          {preview.map((s) => (
            <div key={s.id} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full ${s.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
              >
                {s.initials}
              </div>
              <p className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{s.name}</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">{s.spent}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}