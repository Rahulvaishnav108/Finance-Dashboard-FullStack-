import React, { useState } from 'react';
import { PackageOpen, TrendingDown, Pencil, Trash2, MoreVertical, X } from 'lucide-react';
import type { MenuItem, MenuItemStatus } from '../../store/menu.store';
import { useMenuStore } from '../../store/menu.store';
import { MenuStatusBadge } from './MenuStatusBadge';

interface Props { item: MenuItem; }

const STATUS_OPTIONS: MenuItemStatus[] = ['Available', 'Unavailable', 'Low Stock', 'Out of Stock'];

const FALLBACK_IMG = 'https://via.placeholder.com/70x70/f3f4f6/9ca3af?text=dish';

export function MenuItemCard({ item }: Props): JSX.Element {
  const { toggleItemEnabled, updateItem, deleteItem, categories } = useMenuStore();

  const [showMenu,   setShowMenu]   = useState(false);
  const [showEdit,   setShowEdit]   = useState(false);
  const [editName,   setEditName]   = useState(item.name);
  const [editDesc,   setEditDesc]   = useState(item.description);
  const [editPrice,  setEditPrice]  = useState(String(item.price));
  const [editStock,  setEditStock]  = useState(String(item.stock));
  const [editStatus, setEditStatus] = useState<MenuItemStatus>(item.status);
  const [editCat,    setEditCat]    = useState(item.category);
  const [confirmDel, setConfirmDel] = useState(false);

  const validCategories = categories.filter((c) => c.id !== 'all');

  const stockIcon =
    item.status === 'Out of Stock' ? <PackageOpen className="w-3.5 h-3.5 text-red-400" /> :
    item.status === 'Low Stock'    ? <TrendingDown className="w-3.5 h-3.5 text-amber-400" /> :
                                     <PackageOpen className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />;

  const stockLabel =
    item.status === 'Out of Stock' ? 'Out of Stock' :
    item.status === 'Low Stock'    ? `Low Stock (${item.stock})` :
                                     `In Stock (${item.stock})`;

  const stockLabelClass =
    item.status === 'Out of Stock' ? 'text-red-400' :
    item.status === 'Low Stock'    ? 'text-amber-500 dark:text-amber-400' :
                                     'text-gray-400 dark:text-gray-500';

  const saveEdit = () => {
    updateItem(item.id, {
      name:        editName.trim() || item.name,
      description: editDesc.trim(),
      price:       parseFloat(editPrice) || item.price,
      stock:       parseInt(editStock, 10) || 0,
      status:      editStatus,
      category:    editCat,
    });
    setShowEdit(false);
  };

  const inputClass = 'w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/40 focus:border-orange-300 dark:focus:border-orange-700 placeholder:text-gray-400 transition-all';

  if (confirmDel) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900 rounded-2xl p-4 flex flex-col gap-3 items-center justify-center text-center">
        <Trash2 className="w-7 h-7 text-red-400" />
        <div>
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Delete item?</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{item.name}</p>
        </div>
        <div className="flex gap-2 w-full">
          <button
            onClick={() => setConfirmDel(false)}
            className="flex-1 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => deleteItem(item.id)}
            className="flex-1 py-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  if (showEdit) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-orange-200 dark:border-orange-800 rounded-2xl p-4 flex flex-col gap-2.5 shadow-md">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-orange-500">Edit Item</span>
          <button onClick={() => setShowEdit(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <input value={editName}  onChange={(e) => setEditName(e.target.value)}  placeholder="Name"        className={inputClass} />
        <input value={editDesc}  onChange={(e) => setEditDesc(e.target.value)}  placeholder="Description" className={inputClass} />
        <div className="grid grid-cols-2 gap-1.5">
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">₹</span>
            <input value={editPrice} onChange={(e) => setEditPrice(e.target.value)} type="number" placeholder="Price" className={`${inputClass} pl-5`} />
          </div>
          <input value={editStock} onChange={(e) => setEditStock(e.target.value)} type="number" placeholder="Stock" className={inputClass} />
        </div>
        <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as MenuItemStatus)} className={inputClass}>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={editCat} onChange={(e) => setEditCat(e.target.value)} className={inputClass}>
          {validCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="flex gap-2 mt-1">
          <button onClick={() => setShowEdit(false)} className="flex-1 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
          <button onClick={saveEdit}                 className="flex-1 py-1.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors">Save</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex gap-3 hover:shadow-md transition-shadow relative overflow-hidden group">
      {/* Toggle */}
      <button
        onClick={() => toggleItemEnabled(item.id)}
        className={`absolute top-3 right-3 w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none ${
          item.enabled ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'
        }`}
        title={item.enabled ? 'Disable item' : 'Enable item'}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
          item.enabled ? 'left-[22px]' : 'left-0.5'
        }`} />
      </button>

      {/* Actions menu —
          On desktop: hidden until hover (group-hover)
          On touch: always visible (touch-device class via CSS or just always show on small screens) */}
      <div className="absolute top-9 right-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <div className="relative">
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
          {showMenu && (
            <>
              {/* Click-outside backdrop */}
              <button
                type="button"
                className="fixed inset-0 z-10 w-full h-full cursor-default"
                aria-label="Close menu"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-7 z-20 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg py-1 w-28">
                <button
                  onClick={() => { setShowEdit(true); setShowMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5 text-orange-400" /> Edit
                </button>
                <button
                  onClick={() => { setConfirmDel(true); setShowMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Image */}
      <div className="w-[70px] h-[70px] flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            e.currentTarget.src = FALLBACK_IMG;
          }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-8">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate leading-tight">{item.name}</h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{item.description}</p>
        <p className="text-base font-extrabold text-gray-800 dark:text-gray-100 mt-1.5">
          ₹{item.price.toLocaleString('en-IN')}
        </p>
        <div className="mt-1.5"><MenuStatusBadge status={item.status} /></div>
        <div className={`flex items-center gap-1 mt-1.5 text-xs ${stockLabelClass}`}>
          {stockIcon}
          <span>{stockLabel}</span>
        </div>
      </div>
    </div>
  );
}