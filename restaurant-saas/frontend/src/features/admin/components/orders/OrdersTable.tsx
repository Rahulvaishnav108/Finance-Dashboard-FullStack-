import React from 'react';
import type { Order } from '../../store/orders.store';
import { PaymentBadge } from './PaymentBadge';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderActionMenu } from './OrderActionMenu';
import { AVATAR_COLORS } from './orders.constants';

interface OrdersTableProps {
  orders: Order[];
}

function CustomerCell({ order }: { order: Order }) {
  const bg = AVATAR_COLORS[order.customerAvatar] ?? 'bg-gray-400';
  return (
    <div className="flex items-center gap-2">
      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${bg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
        {order.customerAvatar}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight truncate max-w-[90px] sm:max-w-[140px]">{order.customer}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{order.items} Items</p>
      </div>
    </div>
  );
}

function StaffCell({ order }: { order: Order }) {
  const bg = AVATAR_COLORS[order.staffAvatar] ?? 'bg-gray-400';
  return (
    <div className="flex items-center gap-2">
      <div className={`w-6 h-6 rounded-full ${bg} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
        {order.staffAvatar}
      </div>
      <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{order.assignedStaff}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <tr>
      <td colSpan={9} className="py-16 text-center">
        <p className="text-gray-400 dark:text-gray-600 text-sm">No orders found</p>
        <p className="text-gray-300 dark:text-gray-700 text-xs mt-1">Try adjusting your search or filter</p>
      </td>
    </tr>
  );
}

export function OrdersTable({ orders }: OrdersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px]">
        <thead>
          <tr className="border-b border-gray-50 dark:border-gray-800">
            {/* Order ID */}
            <th className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 px-2 sm:px-4 py-3 pl-3 sm:pl-5 uppercase tracking-wide whitespace-nowrap">
              Order ID
            </th>
            {/* Customer */}
            <th className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 px-2 sm:px-4 py-3 uppercase tracking-wide whitespace-nowrap">
              Customer
            </th>
            {/* Table */}
            <th className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 px-2 sm:px-4 py-3 uppercase tracking-wide whitespace-nowrap hidden sm:table-cell">
              Table
            </th>
            {/* Amount */}
            <th className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 px-2 sm:px-4 py-3 uppercase tracking-wide whitespace-nowrap">
              Amount
            </th>
            {/* Payment */}
            <th className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 px-2 sm:px-4 py-3 uppercase tracking-wide whitespace-nowrap hidden md:table-cell">
              Payment
            </th>
            {/* Status */}
            <th className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 px-2 sm:px-4 py-3 uppercase tracking-wide whitespace-nowrap">
              Status
            </th>
            {/* Staff */}
            <th className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 px-2 sm:px-4 py-3 uppercase tracking-wide whitespace-nowrap hidden lg:table-cell">
              Assigned Staff
            </th>
            {/* Time */}
            <th className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 px-2 sm:px-4 py-3 uppercase tracking-wide whitespace-nowrap hidden md:table-cell">
              Time
            </th>
            {/* Actions */}
            <th className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 px-2 sm:px-4 py-3 pr-3 sm:pr-5 uppercase tracking-wide whitespace-nowrap">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <EmptyState />
          ) : (
            orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-gray-50 dark:border-gray-800/60 hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors last:border-b-0"
              >
                <td className="px-2 sm:px-4 py-3 pl-3 sm:pl-5">
                  <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap">{order.id}</span>
                </td>
                <td className="px-2 sm:px-4 py-3">
                  <CustomerCell order={order} />
                </td>
                <td className="px-2 sm:px-4 py-3 hidden sm:table-cell">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{order.table}</span>
                </td>
                <td className="px-2 sm:px-4 py-3">
                  <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap">{order.amount}</span>
                </td>
                <td className="px-2 sm:px-4 py-3 hidden md:table-cell">
                  <PaymentBadge method={order.payment} />
                </td>
                <td className="px-2 sm:px-4 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-2 sm:px-4 py-3 hidden lg:table-cell">
                  <StaffCell order={order} />
                </td>
                <td className="px-2 sm:px-4 py-3 hidden md:table-cell">
                  <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{order.time}</span>
                </td>
                <td className="px-2 sm:px-4 py-3 pr-3 sm:pr-5">
                  <OrderActionMenu order={order} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}