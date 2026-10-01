import React, { useState } from 'react';
import { X, Plus, Pencil, Trash2, Check, AlertTriangle } from 'lucide-react';
import { useMenuStore } from '../../store/menu.store';

interface Props {
  onClose: () => void;
}

export function ManageCategoriesModal({ onClose }: Props): JSX.Element {
  const { categories, addCategory, updateCategory, deleteCategory } = useMenuStore();

  const [newName,       setNewName]       = useState('');
  const [newNameError,  setNewNameError]  = useState('');
  const [editingId,     setEditingId]     = useState<string | null>(null);
  const [editingName,   setEditingName]   = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const editableCategories = categories.filter((c) => c.id !== 'all');

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) { setNewNameError('Name is required'); return; }
    const duplicate = categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (duplicate) { setNewNameError('Category already exists'); return; }
    addCategory(trimmed);
    setNewName('');
    setNewNameError('');
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
    setConfirmDelete(null);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const trimmed = editingName.trim();
    if (!trimmed) return;
    updateCategory(editingId, trimmed);
    setEditingId(null);
    setEditingName('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleDelete = (id: string) => {
    deleteCategory(id);
    setConfirmDelete(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm w-full h-full cursor-default"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-extrabold text-gray-800 dark:text-gray-100">Manage Categories</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Add, rename, or remove menu categories</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Add New */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <label htmlFor="new-category" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">New Category</label>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                id="new-category"
                type="text"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setNewNameError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
                placeholder="e.g. Soups & Starters"
                className={`w-full px-3 py-2 text-sm rounded-xl border outline-none transition-all bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 ${
                  newNameError
                    ? 'border-red-400 focus:ring-2 focus:ring-red-100'
                    : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/40 focus:border-orange-300 dark:focus:border-orange-700'
                }`}
              />
              {newNameError && <p className="text-xs text-red-500 mt-1">{newNameError}</p>}
            </div>
            <button
              onClick={handleAdd}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>

        {/* Category List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1.5">
          {editableCategories.length === 0 && (
            <p className="text-sm text-center text-gray-400 py-6">No categories yet. Add one above.</p>
          )}
          {editableCategories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
            >
              {editingId === cat.id ? (
                <>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
                    className="flex-1 px-2 py-1 text-sm rounded-lg border border-orange-300 dark:border-orange-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/40"
                  />
                  <button
                    onClick={saveEdit}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-green-500 hover:bg-green-50 dark:hover:bg-green-950/40 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : confirmDelete === cat.id ? (
                <>
                  <div className="flex-1 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      Delete <strong>{cat.name}</strong>? Items will be uncategorised.
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="px-2.5 py-1 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="px-2.5 py-1 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{cat.name}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold ml-1">{cat.count}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(cat.id, cat.name)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { setConfirmDelete(cat.id); setEditingId(null); }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-sm transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}