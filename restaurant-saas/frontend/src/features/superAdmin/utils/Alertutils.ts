// utils.ts
import { AlertType, AlertStatus } from '../components/Alerts/index';

export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function getTypeConfig(type: AlertType) {
  return {
    critical: {
      label: 'Critical',
      iconColor: 'text-red-500',
      badgeDark: 'bg-red-900/40 text-red-400',
      badgeLight: 'bg-red-100 text-red-700',
      cardDark: 'bg-red-950/10 border-red-900/30 hover:border-red-800/50',
      cardLight: 'bg-red-50/50 border-red-100 hover:border-red-200',
      barColor: 'bg-red-500',
      dotColor: 'bg-red-500',
      ringColor: 'ring-red-500/20',
    },
    warning: {
      label: 'Warning',
      iconColor: 'text-amber-500',
      badgeDark: 'bg-amber-900/40 text-amber-400',
      badgeLight: 'bg-amber-100 text-amber-700',
      cardDark: 'bg-amber-950/10 border-amber-900/30 hover:border-amber-800/50',
      cardLight: 'bg-amber-50/50 border-amber-100 hover:border-amber-200',
      barColor: 'bg-amber-500',
      dotColor: 'bg-amber-500',
      ringColor: 'ring-amber-500/20',
    },
    info: {
      label: 'Info',
      iconColor: 'text-blue-500',
      badgeDark: 'bg-blue-900/40 text-blue-400',
      badgeLight: 'bg-blue-100 text-blue-700',
      cardDark: 'bg-blue-950/10 border-blue-900/30 hover:border-blue-800/50',
      cardLight: 'bg-blue-50/50 border-blue-100 hover:border-blue-200',
      barColor: 'bg-blue-500',
      dotColor: 'bg-blue-500',
      ringColor: 'ring-blue-500/20',
    },
  }[type];
}

export function getStatusConfig(status: AlertStatus) {
  return {
    new: { label: 'New', dark: 'bg-orange-500/20 text-orange-400', light: 'bg-orange-100 text-orange-600' },
    read: { label: 'Read', dark: 'bg-slate-700/60 text-slate-400', light: 'bg-gray-100 text-gray-500' },
    acknowledged: { label: 'Acknowledged', dark: 'bg-purple-900/30 text-purple-400', light: 'bg-purple-100 text-purple-600' },
    resolved: { label: 'Resolved', dark: 'bg-green-900/30 text-green-400', light: 'bg-green-100 text-green-600' },
  }[status];
}

export function cx(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}