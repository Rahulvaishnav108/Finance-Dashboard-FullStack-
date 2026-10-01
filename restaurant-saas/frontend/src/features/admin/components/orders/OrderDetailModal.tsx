import React from 'react';
import { X, Clock, User, MapPin, CreditCard, ChefHat, FileText, CheckCircle } from 'lucide-react';
import type { Order } from '../../store/orders.store';
import { OrderStatusBadge } from './OrderStatusBadge';
import { PaymentBadge } from './PaymentBadge';
import { AVATAR_COLORS } from './orders.constants';

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
}

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  const customerBg = AVATAR_COLORS[order.customerAvatar] ?? 'bg-gray-400';
  const staffBg    = AVATAR_COLORS[order.staffAvatar]    ?? 'bg-gray-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm w-full h-full cursor-default"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">{order.id}</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{order.time} · {order.date}</p>
          </div>
          <div className="flex items-center gap-3">
            <OrderStatusBadge status={order.status} />
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Customer + Staff */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                <User className="w-3 h-3" /> Customer
              </p>
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-full ${customerBg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {order.customerAvatar}
                </div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{order.customer}</p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                <ChefHat className="w-3 h-3" /> Staff
              </p>
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-full ${staffBg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {order.staffAvatar}
                </div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{order.assignedStaff}</p>
              </div>
            </div>
          </div>

          {/* Table + Payment */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> Table
              </p>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{order.table}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <CreditCard className="w-3 h-3" /> Payment
              </p>
              <PaymentBadge method={order.payment} />
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <ChefHat className="w-3 h-3" /> Order Items ({order.items})
            </p>
            <div className="space-y-2">
              {(order.itemNames ?? []).map((name, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2.5 px-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-md bg-orange-100 dark:bg-orange-900/40 text-orange-500 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{name}</span>
                  </div>
                  <CheckCircle className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3 h-3" /> Notes
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">{order.notes}</p>
            </div>
          )}

          {/* Total */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{order.time}</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Total</p>
              <p className="text-xl font-black text-gray-900 dark:text-white">{order.amount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}