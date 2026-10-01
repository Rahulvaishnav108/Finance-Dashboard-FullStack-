// components/EmptyState.tsx
import React from 'react';
import { CheckCircle2, Inbox, Search } from 'lucide-react';
import { cx } from '../../utils/Alertutils';

interface EmptyStateProps {
  type: 'all-clear' | 'filtered-empty' | 'no-results';
  darkMode: boolean;
  onReset?: () => void;
}

const CONFIG = {
  'all-clear': {
    Icon: CheckCircle2,
    iconBg: (dark: boolean) => dark ? 'bg-green-500/10' : 'bg-green-50',
    iconColor: 'text-green-500',
    title: 'All clear!',
    body: 'No active alerts. Your system is running smoothly.',
    cta: null,
  },
  'filtered-empty': {
    Icon: Inbox,
    iconBg: (dark: boolean) => dark ? 'bg-slate-800' : 'bg-gray-50',
    iconColor: (dark: boolean) => dark ? 'text-slate-500' : 'text-gray-400',
    title: 'Nothing here',
    body: 'No alerts match the current filter.',
    cta: 'Show all alerts',
  },
  'no-results': {
    Icon: Search,
    iconBg: (dark: boolean) => dark ? 'bg-slate-800' : 'bg-gray-50',
    iconColor: (dark: boolean) => dark ? 'text-slate-500' : 'text-gray-400',
    title: 'No results',
    body: 'No alerts match your search. Try a different query.',
    cta: 'Clear search',
  },
};

export default function EmptyState({ type, darkMode, onReset }: EmptyStateProps) {
  const c = CONFIG[type];
  const Icon = c.Icon;
  const iconColor = typeof c.iconColor === 'function' ? c.iconColor(darkMode) : c.iconColor;
  const iconBg = c.iconBg(darkMode);

  return (
    <div className={cx(
      'flex flex-col items-center justify-center py-20 px-4 rounded-2xl border border-dashed transition-colors',
      darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-gray-50/40 border-gray-100'
    )}>
      <div className={cx('w-16 h-16 rounded-2xl flex items-center justify-center mb-4', iconBg)}>
        <Icon className={cx('w-7 h-7', iconColor)} />
      </div>
      <h3 className={cx(
        'text-lg font-bold mb-1.5',
        darkMode ? 'text-slate-200' : 'text-slate-700'
      )}>
        {c.title}
      </h3>
      <p className={cx(
        'text-sm text-center max-w-xs',
        darkMode ? 'text-slate-500' : 'text-gray-400'
      )}>
        {c.body}
      </p>
      {c.cta && onReset && (
        <button
          onClick={onReset}
          className="mt-5 px-4 py-2 rounded-xl text-sm font-semibold text-[#ff5a1f] hover:text-[#e04d1a] transition-colors"
        >
          {c.cta}
        </button>
      )}
    </div>
  );
}