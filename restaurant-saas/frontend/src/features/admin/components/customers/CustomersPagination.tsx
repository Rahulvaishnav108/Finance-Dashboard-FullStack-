import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCustomersStore } from '../../store/customers.store';

interface CustomersPaginationProps {
  totalFiltered: number;
}

export function CustomersPagination({ totalFiltered }: CustomersPaginationProps) {
  const { currentPage, perPage, setCurrentPage } = useCustomersStore();
  const totalPages = Math.ceil(totalFiltered / perPage);
  const from = Math.min((currentPage - 1) * perPage + 1, totalFiltered);
  const to   = Math.min(currentPage * perPage, totalFiltered);

  if (totalPages <= 1 && totalFiltered === 0) return null;

  const pages: Array<number | '...'> = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 sm:px-5 py-3 border-t border-gray-100 dark:border-gray-800">
      <p className="text-xs text-gray-500 dark:text-gray-400 order-2 sm:order-1">
        Showing {from}–{to} of {totalFiltered.toLocaleString('en-IN')} customers
      </p>

      <div className="flex items-center gap-1 order-1 sm:order-2">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span
              key={`ellipsis-${i}`}
              className="w-8 h-8 flex items-center justify-center text-xs text-gray-400"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => setCurrentPage(p as number)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                p === currentPage
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}