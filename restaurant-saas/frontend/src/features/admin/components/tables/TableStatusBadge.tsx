import React from 'react';

// Define the type locally or ensure it matches the store's export if it's used for typing the 'configs' object
import type { TableStatus } from '../../store/tables.store';

const configs: Record<TableStatus, { label: string; classes: string; dot: string }> = {
  Available: {
    label:   'Available',
    classes: 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800',
    dot:     'bg-green-500',
  },
  Occupied: {
    label:   'Occupied',
    classes: 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800',
    dot:     'bg-orange-500',
  },
  Reserved: {
    label:   'Reserved',
    classes: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
    dot:     'bg-blue-500',
  },
  Cleaning: {
    label:   'Cleaning',
    classes: 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800',
    dot:     'bg-yellow-500',
  },
  Blocked: {
    label:   'Blocked',
    classes: 'bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700',
    dot:     'bg-gray-400',
  },
};

interface Props {
  status: TableStatus;
  size?: 'sm' | 'md';
}

export function TableStatusBadge({ status, size = 'md' }: Props): JSX.Element {
  const cfg = configs[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${cfg.classes} ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'}`}>
      <span className={`rounded-full flex-shrink-0 ${cfg.dot} ${size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'}`} />
      {cfg.label}
    </span>
  );
}