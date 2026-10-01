import React from 'react';
import { useInventoryStore } from '../store/inventory.store';
import {
  InventoryHeader,
  InventoryStatCards,
  InventoryTabBar,
  InventoryTable,
  InventoryPagination,
  StockAlertsPanel,
  TopSuppliersPanel,
  InventoryValueChart,
  StockStatusDonut,
  TopUsedIngredientsChart,
} from '../components/inventory';

export function InventoryPage() {
  const { items, activeTab, activeCategory, searchQuery, currentPage, perPage } =
    useInventoryStore();

  const filtered = items.filter((item) => {
    const matchTab      = activeTab === 'All Items' || item.category === activeTab;
    const matchCategory = activeCategory === 'All Categories' || item.category === activeCategory;
    const q             = searchQuery.toLowerCase();
    const matchSearch   = !q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
    return matchTab && matchCategory && matchSearch;
  });

  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="space-y-4 sm:space-y-5">

      {/* 1. Header */}
      <InventoryHeader />

      {/* 2. Stat cards */}
      <InventoryStatCards />

      {/* 3. Table + sidebar
            Mobile  (<lg): stack vertically — full-width table card, then full-width sidebar cards
            Desktop (≥lg): side by side — table takes remaining space, sidebar is fixed width
      */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-5">

        {/* Table card */}
        <div className="w-full min-w-0 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 lg:flex-1">
          <InventoryTabBar />
          <InventoryTable items={paginated} />
          <InventoryPagination totalFiltered={filtered.length} />
        </div>

        {/* Sidebar
            Mobile : two cards displayed side by side in a 2-col grid for a compact look
            Desktop: single column, fixed width next to the table
        */}
        <div className="w-full lg:w-64 xl:w-72 lg:flex-shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <StockAlertsPanel />
            <TopSuppliersPanel />
          </div>
        </div>
      </div>

      {/* 4. Bottom charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <InventoryValueChart />
        <StockStatusDonut />
        <TopUsedIngredientsChart />
      </div>

    </div>
  );
}