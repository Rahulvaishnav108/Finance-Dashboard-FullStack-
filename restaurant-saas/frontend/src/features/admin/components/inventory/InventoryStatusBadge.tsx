import React from 'react';
import type { ItemStatus } from '../../store/inventory.store';

interface InventoryStatusBadgeProps {
  status: ItemStatus;
}

const STATUS_CONFIG: Record<ItemStatus, { bg: string; text: string; dot: string }> = {
  'In Stock':      { bg: 'bg-green-50  dark:bg-green-950/40',  text: 'text-green-600  dark:text-green-400',  dot: 'bg-green-500'  },
  'Low Stock':     { bg: 'bg-amber-50  dark:bg-amber-950/40',  text: 'text-amber-600  dark:text-amber-400',  dot: 'bg-amber-500'  },
  'Out of Stock':  { bg: 'bg-red-50    dark:bg-red-950/40',    text: 'text-red-600    dark:text-red-400',    dot: 'bg-red-500'    },
  'Expiring Soon': { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-500' },
};

export function InventoryStatusBadge({ status }: InventoryStatusBadgeProps) {
  const { bg, text, dot } = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${bg} ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}