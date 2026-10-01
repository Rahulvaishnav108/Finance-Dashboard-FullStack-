import type { OrderStatus } from '../../store/orders.store';

export const STATUS_TABS: (OrderStatus | 'All')[] = [
  'All', 'Pending', 'Preparing', 'Completed', 'Cancelled',
];

export const STATUS_STYLE: Record<OrderStatus, string> = {
  Pending:   'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800',
  Preparing: 'bg-blue-50  dark:bg-blue-900/30  text-blue-600  dark:text-blue-400  border border-blue-200  dark:border-blue-800',
  Completed: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800',
  Cancelled: 'bg-red-50   dark:bg-red-900/30   text-red-600   dark:text-red-400   border border-red-200   dark:border-red-800',
  Served:    'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800',
};

export const STATUS_DOT: Record<OrderStatus, string> = {
  Pending:   'bg-orange-500',
  Preparing: 'bg-blue-500',
  Completed: 'bg-green-500',
  Cancelled: 'bg-red-500',
  Served:    'bg-purple-500',
};

export const AVATAR_COLORS: Record<string, string> = {
  SJ: 'bg-blue-500',   SA: 'bg-purple-500', MB: 'bg-green-500',
  ED: 'bg-pink-500',   DW: 'bg-indigo-500', SM: 'bg-rose-500',
  JW: 'bg-cyan-500',   LM: 'bg-teal-500',   RT: 'bg-orange-500',
  AW: 'bg-yellow-500', JE: 'bg-violet-500', MI: 'bg-blue-600',
  DA: 'bg-green-600',
};