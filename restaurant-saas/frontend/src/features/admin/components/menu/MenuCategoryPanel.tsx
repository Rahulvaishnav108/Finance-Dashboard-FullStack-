import React, { useState, useEffect } from 'react';
import { Plus, Settings2, X } from 'lucide-react';
import { useMenuStore } from '../../store/menu.store';
import { ManageCategoriesModal } from './ManageCategoriesModal';
import { AddItemModal } from './AddItemModal';

interface Props {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface CategoryListProps {
  onClose?: () => void;
  onManageCategories: () => void;
  onAddItem: () => void;
}

function CategoryList({ onClose, onManageCategories, onAddItem }: CategoryListProps) {
  const { categories, activeCategory, setActiveCategory } = useMenuStore();

  const handleCategoryClick = (id: string) => {
    setActiveCategory(id);
    onClose?.();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">Categories</h3>
        <button
          onClick={onAddItem}
          title="Add new item"
          className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-500 transition-colors"
        >
          <Plus className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="flex flex-col gap-0.5 flex-1 overflow-y-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all text-left ${
              activeCategory === cat.id
                ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-semibold'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <span className="truncate">{cat.name}</span>
            <span className={`text-xs ml-2 flex-shrink-0 ${
              activeCategory === cat.id
                ? 'text-orange-500 dark:text-orange-400 font-bold'
                : 'text-gray-400 dark:text-gray-500'
            }`}>{cat.count}</span>
          </button>
        ))}
      </div>

      <button
        onClick={onManageCategories}
        className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl text-xs text-gray-500 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-600 dark:hover:text-orange-400 transition-colors font-semibold"
      >
        <Settings2 className="w-3.5 h-3.5" />
        Manage Categories
      </button>
    </>
  );
}

export function MenuCategoryPanel({ mobileOpen = false, onMobileClose }: Props): JSX.Element {
  // Modals lifted here so only one instance exists regardless of desktop/mobile
  const [showManage,  setShowManage]  = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex w-[200px] flex-shrink-0 flex-col sticky top-0 self-start pt-1">
        <CategoryList
          onManageCategories={() => setShowManage(true)}
          onAddItem={() => setShowAddItem(true)}
        />
      </aside>

      {/* ── Mobile drawer backdrop ── */}
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 w-full h-full bg-black/40 backdrop-blur-sm lg:hidden cursor-default"
          aria-label="Close category panel"
          onClick={onMobileClose}
        />
      )}

      {/* ── Mobile drawer ── */}
      <div className={`
        fixed top-0 left-0 bottom-0 z-50 w-64 flex flex-col
        bg-white dark:bg-gray-900 shadow-2xl
        transition-transform duration-300 ease-in-out
        lg:hidden
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between px-4 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800">
          <span className="text-sm font-bold text-gray-800 dark:text-gray-100">Filter by Category</span>
          <button
            onClick={onMobileClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 flex flex-col p-3 overflow-y-auto">
          <CategoryList
            onClose={onMobileClose}
            onManageCategories={() => { setShowManage(true); onMobileClose?.(); }}
            onAddItem={() => { setShowAddItem(true); onMobileClose?.(); }}
          />
        </div>
      </div>

      {/* ── Modals — single instance, mounted at panel level ── */}
      {showManage  && <ManageCategoriesModal onClose={() => setShowManage(false)} />}
      {showAddItem && <AddItemModal          onClose={() => setShowAddItem(false)} />}
    </>
  );
}