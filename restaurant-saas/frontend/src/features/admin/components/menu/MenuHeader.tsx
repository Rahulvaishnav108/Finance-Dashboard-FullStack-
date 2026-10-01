import React, { useState, useRef } from 'react';
import { RefreshCw, Download, Plus, LayoutList, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { AddItemModal } from './AddItemModal';
import { useMenuStore } from '../../store/menu.store';
import type { MenuItemStatus } from '../../store/menu.store';

interface Props {
  /** Mobile: toggle the category drawer */
  onToggleCategories?: () => void;
}

type SyncState = 'idle' | 'syncing' | 'synced' | 'error';
type ImportState = 'idle' | 'importing' | 'done' | 'error';

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

const STATUS_MAP: Record<string, MenuItemStatus> = {
  available:    'Available',
  unavailable:  'Unavailable',
  'low stock':  'Low Stock',
  'out of stock': 'Out of Stock',
};

function parseCSV(text: string): { rows: Record<string, string>[]; errors: string[] } {
  const lines = text.trim().split(/\r?\n/);
  const errors: string[] = [];
  if (lines.length < 2) {
    errors.push('CSV must have a header row and at least one data row.');
    return { rows: [], errors };
  }
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const required = ['name', 'price'];
  const missing = required.filter((r) => !headers.includes(r));
  if (missing.length) {
    errors.push(`Missing required columns: ${missing.join(', ')}`);
    return { rows: [], errors };
  }
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(',').map((v) => v.trim());
    if (vals.every((v) => v === '')) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] ?? ''; });
    rows.push(row);
  }
  return { rows, errors };
}

export function MenuHeader({ onToggleCategories }: Props): JSX.Element {
  const { addItem, categories, updateItem, items } = useMenuStore();

  const [showAddModal,  setShowAddModal]  = useState(false);
  const [syncState,     setSyncState]     = useState<SyncState>('idle');
  const [syncMsg,       setSyncMsg]       = useState('Synced 2 mins ago');
  const [importState,   setImportState]   = useState<ImportState>('idle');
  const [importResult,  setImportResult]  = useState<ImportResult | null>(null);
  const [showImportInfo, setShowImportInfo] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Inventory Sync ──────────────────────────────────────────────────────────
  const handleSync = () => {
    if (syncState === 'syncing') return;
    setSyncState('syncing');
    setSyncMsg('Syncing…');

    // Simulate sync: randomise stock for low/out-of-stock items
    setTimeout(() => {
      try {
        items.forEach((item) => {
          if (item.status === 'Low Stock' || item.status === 'Out of Stock') {
            const newStock = Math.floor(Math.random() * 40) + 10;
            updateItem(item.id, {
              stock: newStock,
              status: newStock > 10 ? 'Available' : 'Low Stock',
            });
          }
        });
        setSyncState('synced');
        setSyncMsg('Just synced');
        setTimeout(() => {
          setSyncState('idle');
          setSyncMsg('Synced just now');
        }, 3000);
      } catch {
        setSyncState('error');
        setSyncMsg('Sync failed');
      }
    }, 1400);
  };

  // ── Import Items (CSV) ──────────────────────────────────────────────────────
  const handleImportClick = () => {
    setShowImportInfo(false);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset so the same file can be re-selected
    e.target.value = '';

    setImportState('importing');
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const { rows, errors: parseErrors } = parseCSV(text);

        if (parseErrors.length) {
          setImportState('error');
          setImportResult({ imported: 0, skipped: 0, errors: parseErrors });
          return;
        }

        const validCats = categories.filter((c) => c.id !== 'all');
        const defaultCat = validCats[0]?.id ?? '';
        let imported = 0;
        let skipped = 0;
        const rowErrors: string[] = [];

        rows.forEach((row, idx) => {
          const name  = row['name']?.trim();
          const price = parseFloat(row['price']);
          if (!name || isNaN(price) || price <= 0) {
            skipped++;
            rowErrors.push(`Row ${idx + 2}: invalid name or price — skipped.`);
            return;
          }

          const stock = parseInt(row['stock'] ?? '0', 10);
          const rawStatus = (row['status'] ?? '').toLowerCase();
          const status: MenuItemStatus = STATUS_MAP[rawStatus] ?? 'Available';

          const catInput = (row['category'] ?? '').toLowerCase();
          const matchedCat = validCats.find(
            (c) => c.name.toLowerCase() === catInput || c.id === catInput
          );
          const catId = matchedCat?.id ?? defaultCat;

          addItem({
            name,
            description: row['description']?.trim() ?? '',
            price,
            stock: isNaN(stock) ? 0 : stock,
            category: catId,
            status,
            image: row['image']?.trim() || 'https://via.placeholder.com/120x120/f3f4f6/9ca3af?text=dish',
            enabled: true,
          });
          imported++;
        });

        setImportState('done');
        setImportResult({ imported, skipped, errors: rowErrors });
      } catch {
        setImportState('error');
        setImportResult({ imported: 0, skipped: 0, errors: ['Failed to read file.'] });
      }
    };
    reader.readAsText(file);
  };

  // ── Sync indicator colour ───────────────────────────────────────────────────
  const syncDot =
    syncState === 'syncing' ? 'bg-yellow-400 animate-pulse' :
    syncState === 'synced'  ? 'bg-green-500' :
    syncState === 'error'   ? 'bg-red-400' :
                              'bg-green-500';

  const syncIcon =
    syncState === 'syncing' ? <RefreshCw className="w-4 h-4 animate-spin" /> :
    syncState === 'error'   ? <AlertCircle className="w-4 h-4 text-red-400" /> :
                              <RefreshCw className="w-4 h-4" />;

  return (
    <>
      {/* Hidden CSV file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="px-3 sm:px-4 lg:px-0 pt-1 pb-4 sm:pb-5">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Menu Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Manage items, categories and availability
            </p>
          </div>

          {/* Mobile: categories toggle + add */}
          <div className="flex items-center gap-2 lg:hidden flex-shrink-0">
            <button
              onClick={onToggleCategories}
              className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
            >
              <LayoutList className="w-4 h-4" />
              <span className="hidden sm:inline">Categories</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Item</span>
            </button>
          </div>
        </div>

        {/* Actions row */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Inventory Sync */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm min-w-0">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${syncDot}`} />
            <div className="min-w-0 hidden sm:block">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 leading-none whitespace-nowrap">Inventory Sync</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 whitespace-nowrap">{syncMsg}</p>
            </div>
            <button
              onClick={handleSync}
              disabled={syncState === 'syncing'}
              title="Sync inventory now"
              className="ml-1 text-gray-400 hover:text-orange-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex-shrink-0"
            >
              {syncIcon}
            </button>
          </div>

          {/* Import Items */}
          <div className="relative">
            <button
              onClick={() => setShowImportInfo((v) => !v)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Import Items</span>
            </button>

            {/* Import info dropdown */}
            {showImportInfo && (
              <div className="absolute left-0 top-full mt-2 z-30 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Import via CSV</p>
                  <button onClick={() => setShowImportInfo(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                  Upload a CSV file with columns: <span className="font-mono font-semibold">name, price, description, category, status, stock, image</span>.
                  Only <span className="font-semibold">name</span> and <span className="font-semibold">price</span> are required.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleImportClick}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Choose CSV File
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Add New Item — desktop only */}
          <button
            onClick={() => setShowAddModal(true)}
            className="hidden lg:flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Item
          </button>
        </div>

        {/* Import result toast */}
        {importResult && (
          <div className={`mt-3 flex items-start gap-2.5 p-3 rounded-xl border text-xs ${
            importState === 'error'
              ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
              : 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
          }`}>
            {importState === 'error'
              ? <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              : <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            }
            <div className="flex-1 min-w-0">
              {importState === 'done' && (
                <p className="font-semibold">
                  Imported {importResult.imported} item{importResult.imported !== 1 ? 's' : ''}
                  {importResult.skipped > 0 && `, skipped ${importResult.skipped}`}.
                </p>
              )}
              {importResult.errors.map((err, i) => (
                <p key={i} className="mt-0.5 opacity-80">{err}</p>
              ))}
            </div>
            <button
              onClick={() => { setImportResult(null); setImportState('idle'); }}
              className="text-current opacity-60 hover:opacity-100 flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {showAddModal && <AddItemModal onClose={() => setShowAddModal(false)} />}
    </>
  );
}