import React, { useState } from 'react';
import { Plus, Upload, X } from 'lucide-react';
import { useInventoryStore, type ItemCategory, type NewItemForm } from '../../store/inventory.store';

const CATEGORIES: ItemCategory[] = ['Ingredients', 'Beverages', 'Packaging', 'Cleaning Supplies', 'Other'];
const EMOJI_OPTIONS = ['🍅', '🍗', '🫒', '🧀', '🥬', '🥤', '🧃', '🧴', '🧄', '🧅', '💧', '📦', '🧹', '🫑', '🍊', '🌶️', '🥩', '🧂', '🍋', '🫙'];

const DEFAULT_FORM: NewItemForm = {
  name: '',
  category: 'Ingredients',
  unit: 'kg',
  currentStock: '',
  parLevel: '',
  imageEmoji: '📦',
};

const inputClass =
  'w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400';

function AddItemModal() {
  const { showAddItemModal, setShowAddItemModal, addItem } = useInventoryStore();
  const [form, setForm] = useState<NewItemForm>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof NewItemForm, string>>>({});

  if (!showAddItemModal) return null;

  const validate = () => {
    const e: Partial<Record<keyof NewItemForm, string>> = {};
    if (!form.name.trim())        e.name         = 'Item name is required';
    if (!form.unit.trim())        e.unit         = 'Unit is required';
    if (form.currentStock === '') e.currentStock = 'Current stock is required';
    if (form.parLevel === '')     e.parLevel     = 'Par level is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    addItem(form);
    setForm(DEFAULT_FORM);
    setErrors({});
  };

  const handleClose = () => {
    setShowAddItemModal(false);
    setForm(DEFAULT_FORM);
    setErrors({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 w-full h-full cursor-default"
        onClick={handleClose}
        aria-label="Close modal"
      />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Add New Inventory Item</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Emoji picker */}
        <div>
          <span className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Icon</span>
          <div className="flex flex-wrap gap-1.5">
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setForm((f) => ({ ...f, imageEmoji: e }))}
                className={`text-xl p-1.5 rounded-xl border-2 transition-colors ${
                  form.imageEmoji === e
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-950'
                    : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Item Name */}
        <div>
          <label htmlFor="input-name" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
            Item Name
          </label>
          <input
            id="input-name"
            type="text"
            placeholder="e.g. Chicken Breast"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={inputClass}
          />
          {errors.name && <p className="mt-0.5 text-xs text-red-500">{errors.name}</p>}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category-select" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
            Category
          </label>
          <select
            id="category-select"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ItemCategory }))}
            className={inputClass}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Unit */}
        <div>
          <label htmlFor="input-unit" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
            Unit
          </label>
          <input
            id="input-unit"
            type="text"
            placeholder="e.g. kg, L, pcs"
            value={form.unit}
            onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
            className={inputClass}
          />
          {errors.unit && <p className="mt-0.5 text-xs text-red-500">{errors.unit}</p>}
        </div>

        {/* Stock + Par Level */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="input-currentStock" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Current Stock
            </label>
            <input
              id="input-currentStock"
              type="number"
              placeholder="0"
              value={form.currentStock}
              onChange={(e) => setForm((f) => ({ ...f, currentStock: e.target.value }))}
              className={inputClass}
            />
            {errors.currentStock && <p className="mt-0.5 text-xs text-red-500">{errors.currentStock}</p>}
          </div>
          <div>
            <label htmlFor="input-parLevel" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Par Level
            </label>
            <input
              id="input-parLevel"
              type="number"
              placeholder="0"
              value={form.parLevel}
              onChange={(e) => setForm((f) => ({ ...f, parLevel: e.target.value }))}
              className={inputClass}
            />
            {errors.parLevel && <p className="mt-0.5 text-xs text-red-500">{errors.parLevel}</p>}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors shadow-sm"
          >
            Add Item
          </button>
        </div>
      </div>
    </div>
  );
}

function ImportModal() {
  const { showImportModal, setShowImportModal, importItems } = useInventoryStore();
  const [csv, setCsv] = useState('');

  if (!showImportModal) return null;

  const handleClose = () => { setShowImportModal(false); setCsv(''); };

  const handleImport = () => {
    if (csv.trim()) importItems(csv);
    else handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 w-full h-full cursor-default"
        onClick={handleClose}
        aria-label="Close modal"
      />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Import Inventory</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900 rounded-xl p-3">
          <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-1">CSV Format</p>
          <code className="text-xs text-gray-600 dark:text-gray-400 font-mono">
            Name, Category, CurrentStock, ParLevel, Unit, Emoji
          </code>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">e.g: Tomatoes, Ingredients, 24.5, 20, kg, 🍅</p>
        </div>

        <div>
          <label htmlFor="csv-input" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
            Paste CSV data
          </label>
          <textarea
            id="csv-input"
            rows={6}
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            placeholder={'Tomatoes, Ingredients, 24.5, 20, kg, 🍅\nOlive Oil, Ingredients, 3, 5, L, 🫒'}
            className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400 font-mono resize-none"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors shadow-sm"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}

export function InventoryHeader() {
  const { setShowAddItemModal, setShowImportModal } = useInventoryStore();

  return (
    <>
      <AddItemModal />
      <ImportModal />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 flex-wrap">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Track ingredients, monitor stock levels, and manage suppliers
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
            <span className="hidden sm:inline">Import Inventory</span>
            <span className="sm:hidden">Import</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddItemModal(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 rounded-xl transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Add Item
          </button>
        </div>
      </div>
    </>
  );
}