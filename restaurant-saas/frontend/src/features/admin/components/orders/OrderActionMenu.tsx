import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Eye, Edit, Clock, CheckCircle, Trash2, Utensils } from 'lucide-react';
import { useOrdersStore, type Order, type OrderStatus } from '../../store/orders.store';
import { OrderDetailModal } from './OrderDetailModal';
import { EditOrderModal } from './EditOrderModal';

interface OrderActionMenuProps {
  order: Order;
}

export function OrderActionMenu({ order }: OrderActionMenuProps) {
  const [open,       setOpen]       = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit,   setShowEdit]   = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { updateOrderStatus } = useOrdersStore();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const statusActions: {
    label: string;
    icon: React.ElementType;
    status?: OrderStatus;
    danger?: boolean;
    disabled?: boolean;
  }[] = [
    { label: 'Mark Preparing',  icon: Clock,        status: 'Preparing', disabled: order.status === 'Preparing' },
    { label: 'Mark Served',     icon: Utensils,     status: 'Served',    disabled: order.status === 'Served'    },
    { label: 'Mark Completed',  icon: CheckCircle,  status: 'Completed', disabled: order.status === 'Completed' },
    { label: 'Cancel Order',    icon: Trash2,       status: 'Cancelled', danger: true, disabled: order.status === 'Cancelled' },
  ];

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {open && (
          <div className="absolute right-0 top-8 z-50 w-52 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg py-1 overflow-hidden">

            {/* Primary actions */}
            <button
              onClick={() => { setShowDetail(true); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
            >
              <Eye className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
              View Details
            </button>

            <button
              onClick={() => { setShowEdit(true); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
            >
              <Edit className="w-3.5 h-3.5 flex-shrink-0 text-orange-500" />
              Edit Order
            </button>

            {/* Divider */}
            <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

            {/* Status change actions */}
            {statusActions.map(({ label, icon: Icon, status, danger, disabled }) => (
              <button
                key={label}
                disabled={disabled}
                onClick={() => {
                  if (status) updateOrderStatus(order.id, status);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors text-left ${
                  disabled
                    ? 'opacity-40 cursor-not-allowed text-gray-400 dark:text-gray-600'
                    : danger
                      ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {showDetail && <OrderDetailModal order={order} onClose={() => setShowDetail(false)} />}
      {showEdit   && <EditOrderModal   order={order} onClose={() => setShowEdit(false)}   />}
    </>
  );
}
