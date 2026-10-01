import React, { useState, useEffect } from 'react';
import { INVENTORY, type InventoryItem } from '../store/kitchenData';
import { useKitchenSearch } from '../components/dashboard/KitchenSearchContext';

export default function KitchenInventoryPage() {
  const { query } = useKitchenSearch();

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kitchen_inventory');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse kitchen inventory", e);
        }
      }
    }
    return INVENTORY;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kitchen_inventory_selected_category');
      if (stored) return stored;
    }
    return 'All';
  });

  useEffect(() => {
    localStorage.setItem('kitchen_inventory', JSON.stringify(inventory));
  }, [inventory]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    localStorage.setItem('kitchen_inventory_selected_category', category);
  };

  // Categories list derived from inventory data
  const categories = ['All', ...Array.from(new Set(inventory.map(item => item.category)))];

  const filteredItems = inventory.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    if (!matchesCategory) return false;

    if (query) {
      const q = query.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleRestock = (id: string) => {
    setInventory(prev =>
      prev.map(item => {
        if (item.id === id) {
          // Boost stock to double the min stock or add a fixed amount
          const addedStock = Math.max(item.minStock * 2 - item.stock, 10);
          return {
            ...item,
            stock: item.stock + addedStock,
            status: 'ok' as const,
            lastRestocked: 'Just now',
          };
        }
        return item;
      })
    );
  };

  const handleTrackUsage = (id: string) => {
    setInventory(prev =>
      prev.map(item => {
        if (item.id === id && item.stock > 0) {
          const newStock = Math.max(0, item.stock - 1);
          let newStatus: 'ok' | 'low' | 'critical' = 'ok';
          if (newStock <= item.minStock * 0.5) {
            newStatus = 'critical';
          } else if (newStock <= item.minStock) {
            newStatus = 'low';
          }
          return {
            ...item,
            stock: newStock,
            status: newStatus,
          };
        }
        return item;
      })
    );
  };

  // Metrics
  const totalItems = inventory.length;
  const lowStockCount = inventory.filter(i => i.status === 'low').length;
  const criticalStockCount = inventory.filter(i => i.status === 'critical').length;

  const statusColors = {
    ok: 'bg-green-50 text-green-700 border-green-200',
    low: 'bg-amber-50 text-amber-700 border-amber-200',
    critical: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className="p-4 lg:p-8 h-full overflow-y-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Inventory Management</h2>
          <p className="text-sm text-slate-500 font-medium">Monitor stock levels, track usage, and manage ingredient reorders</p>
        </div>
        <button className="px-5 py-2.5 bg-orange-600 text-white rounded-xl font-bold text-sm hover:bg-orange-700 shadow-lg shadow-orange-100 flex items-center gap-2 transition-all active:scale-[0.98]">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Item
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
            <span className="material-symbols-outlined text-[24px]">inventory_2</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Ingredients</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{totalItems}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-amber-50 text-amber-600 p-3 rounded-xl">
            <span className="material-symbols-outlined text-[24px]">warning</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Alerts</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-0.5">{lowStockCount}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-red-50 text-red-600 p-3 rounded-xl">
            <span className="material-symbols-outlined text-[24px]">error</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Critically Low</p>
            <h3 className="text-2xl font-bold text-red-600 mt-0.5">{criticalStockCount}</h3>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-6 scrollbar-hide">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCategory === category
                ? 'bg-orange-50 text-orange-600 border-orange-200'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Inventory Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Item Details</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Stock Level</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Daily Usage</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Restocked</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{item.name}</div>
                    <div className="text-[10px] text-slate-400 font-bold mt-0.5">{item.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="font-bold text-slate-700">
                      {item.stock} {item.unit}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Min: {item.minStock} {item.unit}</div>
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-slate-600">
                    {item.dailyUsage} {item.unit}/day
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 border rounded-full text-[10px] font-bold uppercase ${statusColors[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                    {item.lastRestocked}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleTrackUsage(item.id)}
                        className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors"
                        title="Deduct 1 unit of stock"
                      >
                        Use 1
                      </button>
                      <button
                        onClick={() => handleRestock(item.id)}
                        className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs font-bold hover:bg-orange-700 transition-colors shadow-sm shadow-orange-100"
                      >
                        Restock
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No inventory items match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
