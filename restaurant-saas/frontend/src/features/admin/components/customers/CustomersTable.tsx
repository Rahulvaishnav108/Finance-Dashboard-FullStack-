import React from 'react';
import { MoreVertical } from 'lucide-react';
import type { Customer } from '../../store/customers.store';
import { LoyaltyBadge } from './LoyaltyBadge';
import { CustomerStatusBadge } from './CustomerStatusBadge';

interface CustomersTableProps {
  customers: Customer[];
}

const AVATAR_COLORS: Record<string, string> = {
  JS: 'bg-orange-500', SJ: 'bg-blue-500',   MB: 'bg-green-500',  ED: 'bg-purple-500',
  DW: 'bg-teal-500',   LA: 'bg-rose-500',   JT: 'bg-amber-500',  OM: 'bg-indigo-500',
  RG: 'bg-cyan-500',   JL: 'bg-pink-500',   AH: 'bg-lime-600',
};

const COLUMNS = ['Customer', 'Loyalty Tier', 'Total Visits', 'Total Spent', 'Last Order', 'Status', 'Actions'];

function CustomerAvatar({ initials }: { initials: string }) {
  const bg = AVATAR_COLORS[initials] ?? 'bg-gray-500';
  return (
    <div
      className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
    >
      {initials}
    </div>
  );
}

function EmptyState() {
  return (
    <tr>
      <td colSpan={7} className="py-16 text-center">
        <p className="text-gray-400 dark:text-gray-600 text-sm">No customers found</p>
        <p className="text-gray-300 dark:text-gray-700 text-xs mt-1">
          Try adjusting your search or filters
        </p>
      </td>
    </tr>
  );
}

/** Card shown on mobile (< md) for each customer row */
function CustomerCard({ c }: { c: Customer }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5 border-b border-gray-50 dark:border-gray-800/60 last:border-0">
      <CustomerAvatar initials={c.avatar} />
      <div className="flex-1 min-w-0">
        {/* Name + action */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{c.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{c.email}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{c.phone}</p>
          </div>
          <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0 mt-0.5">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Badges row */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <LoyaltyBadge tier={c.loyaltyTier} />
          <CustomerStatusBadge status={c.status} />
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-2">
          <div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500">Visits</p>
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">{c.totalVisits}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500">Spent</p>
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">{c.totalSpent}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500">Last Order</p>
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">{c.lastOrder}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CustomersTable({ customers }: CustomersTableProps) {
  return (
    <>
      {/* ── Mobile card list (hidden on md+) ── */}
      <div className="md:hidden">
        {customers.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-400 dark:text-gray-600 text-sm">No customers found</p>
            <p className="text-gray-300 dark:text-gray-700 text-xs mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          customers.map((c) => <CustomerCard key={c.id} c={c} />)
        )}
      </div>

      {/* ── Desktop table (hidden below md) ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50 dark:border-gray-800">
              {COLUMNS.map((col) => (
                <th
                  key={col}
                  className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 px-4 py-3 uppercase tracking-wide whitespace-nowrap first:pl-5 last:pr-5"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <EmptyState />
            ) : (
              customers.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-gray-50 dark:border-gray-800/60 hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors"
                >
                  {/* Customer */}
                  <td className="px-4 py-3 first:pl-5">
                    <div className="flex items-center gap-2.5">
                      <CustomerAvatar initials={c.avatar} />
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight whitespace-nowrap">
                          {c.name}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{c.email}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{c.phone}</p>
                      </div>
                    </div>
                  </td>

                  {/* Loyalty Tier */}
                  <td className="px-4 py-3">
                    <LoyaltyBadge tier={c.loyaltyTier} />
                  </td>

                  {/* Total Visits */}
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {c.totalVisits}
                    </span>
                  </td>

                  {/* Total Spent */}
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {c.totalSpent}
                    </span>
                  </td>

                  {/* Last Order */}
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{c.lastOrder}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{c.lastOrderId}</p>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <CustomerStatusBadge status={c.status} />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 last:pr-5">
                    <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}