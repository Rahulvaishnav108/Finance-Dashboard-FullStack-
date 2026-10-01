import React from 'react';
import type { MenuItemStatus } from '../../store/menu.store';

interface Props {
  status: MenuItemStatus;
}

const config: Record<MenuItemStatus, { label: string; className: string }> = {
  Available:      { label: 'Available',    className: 'bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400' },
  Unavailable:    { label: 'Unavailable',  className: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
  'Low Stock':    { label: 'Low Stock',    className: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' },
  'Out of Stock': { label: 'Out of Stock', className: 'bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400' },
};

export function MenuStatusBadge({ status }: Props): JSX.Element {
  const { label, className } = config[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}