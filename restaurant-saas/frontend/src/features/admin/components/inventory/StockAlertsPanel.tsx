import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useInventoryStore } from '../../store/inventory.store';
import { InventoryStatusBadge } from './InventoryStatusBadge';

function StockAlertsModal() {
  const { stockAlerts, showStockAlertsModal, setShowStockAlertsModal } = useInventoryStore();
  if (!showStockAlertsModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 w-full h-full cursor-default"
        onClick={() => setShowStockAlertsModal(false)}
        aria-label="Close modal"
      />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-5 sm:p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">All Stock Alerts</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowStockAlertsModal(false)}
            className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{stockAlerts.length} items need attention</p>
        <div className="space-y-3">
          {stockAlerts.map((alert) => (
            <div key={alert.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <span className="text-2xl leading-none flex-shrink-0">{alert.imageEmoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{alert.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{alert.detail}</p>
              </div>
              <InventoryStatusBadge status={alert.status} />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowStockAlertsModal(false)}
          className="w-full mt-5 px-4 py-2.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export function StockAlertsPanel() {
  const { stockAlerts, setShowStockAlertsModal } = useInventoryStore();
  const preview = stockAlerts.slice(0, 4);

  return (
    <>
      <StockAlertsModal />
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Stock Alerts</h3>
          <button
            type="button"
            onClick={() => setShowStockAlertsModal(true)}
            className="text-xs text-orange-500 hover:text-orange-600 dark:text-orange-400 font-medium transition-colors"
          >
            View all
          </button>
        </div>

        <div className="space-y-3">
          {preview.map((alert) => (
            <div key={alert.id} className="flex items-center gap-3">
              <span className="text-xl sm:text-2xl leading-none flex-shrink-0">{alert.imageEmoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{alert.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{alert.detail}</p>
              </div>
              <InventoryStatusBadge status={alert.status} />
            </div>
          ))}
        </div>

        {stockAlerts.length > 4 && (
          <button
            type="button"
            onClick={() => setShowStockAlertsModal(true)}
            className="w-full mt-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
          >
            +{stockAlerts.length - 4} more alerts
          </button>
        )}
      </div>
    </>
  );
}