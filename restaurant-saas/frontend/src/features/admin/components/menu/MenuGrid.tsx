import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMenuStore, getFilteredItems } from '../../store/menu.store';
import { MenuItemCard } from './MenuItemCard';

export function MenuGrid(): JSX.Element {
  const store = useMenuStore();
  const { currentPage, perPage, setCurrentPage } = store;

  const filtered = getFilteredItems(store);
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  // Clamp so stale page never overshoots
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const start     = (safePage - 1) * perPage;
  const paginated = filtered.slice(start, start + perPage);

  const showingFrom = totalItems === 0 ? 0 : start + 1;
  const showingTo   = Math.min(start + perPage, totalItems);

  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (safePage > 3) pages.push('...');
    for (let p = Math.max(2, safePage - 1); p <= Math.min(totalPages - 1, safePage + 1); p++) {
      pages.push(p);
    }
    if (safePage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex flex-col">
      {/* Grid — no flex-1, just natural height */}
      {paginated.length === 0 ? (
        <div className="flex items-center justify-center py-24 text-gray-400 dark:text-gray-600">
          <div className="text-center">
            <div className="text-4xl mb-3">🍽️</div>
            <p className="text-sm font-medium">No menu items found</p>
            <p className="text-xs mt-1">Try adjusting your filters or search query</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {paginated.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Pagination — always rendered so it's always visible */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Showing {showingFrom}–{showingTo} of {totalItems} items
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
            disabled={safePage === 1}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {getPageNumbers().map((page, i) =>
            page === '...' ? (
              <span key={`e-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-xs">
                …
              </span>
            ) : (
              <button
                key={page}
                onClick={() => setCurrentPage(page as number)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                  safePage === page
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
            disabled={safePage === totalPages}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}