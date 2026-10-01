// components/AlertCard.tsx
import React, { useState } from 'react';
import {
  AlertTriangle, AlertCircle, Info,
  Building2, Clock, Trash2, CheckCheck,
  CheckCircle2, ChevronDown, ChevronUp,
  ShieldCheck, Tag, ExternalLink,
} from 'lucide-react';
import { Alert } from './index';
import { formatTimestamp, getTypeConfig, getStatusConfig, cx } from '../../utils/Alertutils';

interface AlertCardProps {
  alert: Alert;
  darkMode: boolean;
  onDismiss: (id: string) => void;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}

const TYPE_ICONS = {
  critical: AlertTriangle,
  warning: AlertCircle,
  info: Info,
};

const ENTITY_TYPE_ICONS = {
  restaurant: Building2,
  user: Building2,
  system: ShieldCheck,
  payment: Building2,
};

export default function AlertCard({ alert, darkMode, onDismiss, onAcknowledge, onResolve }: AlertCardProps) {
  const [expanded, setExpanded] = useState(false);
  const tc = getTypeConfig(alert.type);
  const sc = getStatusConfig(alert.status);
  const Icon = TYPE_ICONS[alert.type];
  const EntityIcon = alert.entityType ? ENTITY_TYPE_ICONS[alert.entityType] : Building2;

  const cardBase = darkMode ? tc.cardDark : tc.cardLight;
  const isResolved = alert.status === 'resolved';

  return (
    <div className={cx(
      'group relative rounded-2xl border transition-all duration-200',
      'hover:shadow-lg hover:-translate-y-0.5',
      cardBase,
      isResolved && 'opacity-60',
    )}>
      {/* Severity bar */}
      <div className={cx(
        'absolute left-0 top-4 bottom-4 w-[3px] rounded-full ml-3',
        tc.barColor
      )} />

      <div className="pl-7 pr-4 pt-4 pb-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5 flex-wrap min-w-0">
            <div className={cx(
              'w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
              darkMode ? tc.badgeDark.split(' ')[0] : tc.badgeLight.split(' ')[0]
            )}>
              <Icon className={cx('w-4 h-4', tc.iconColor)} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={cx(
                  'font-bold text-[15px] leading-tight',
                  darkMode ? 'text-slate-100' : 'text-slate-800'
                )}>
                  {alert.title}
                </h3>
                {alert.status === 'new' && (
                  <span className={cx(
                    'text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md',
                    darkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'
                  )}>
                    New
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Badges + actions */}
          <div className="flex items-center gap-2 shrink-0">
            <span className={cx(
              'hidden sm:inline-flex text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider',
              darkMode ? tc.badgeDark : tc.badgeLight
            )}>
              {tc.label}
            </span>

            <span className={cx(
              'hidden sm:inline-flex text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider',
              darkMode ? sc.dark : sc.light
            )}>
              {sc.label}
            </span>

            {/* Expand toggle */}
            <button
              onClick={() => setExpanded(!expanded)}
              title={expanded ? 'Collapse' : 'Expand'}
              className={cx(
                'p-1.5 rounded-lg transition-all',
                darkMode ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              )}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Dismiss */}
            <button
              onClick={() => onDismiss(alert.id)}
              title="Dismiss"
              className={cx(
                'p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100',
                darkMode ? 'text-slate-500 hover:text-red-400 hover:bg-red-950/30' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
              )}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Description */}
        <p className={cx(
          'text-sm leading-relaxed mb-3',
          darkMode ? 'text-slate-400' : 'text-gray-600',
          !expanded && 'line-clamp-2'
        )}>
          {alert.description}
        </p>

        {/* Expanded section */}
        {expanded && (
          <div className={cx(
            'mb-3 p-3 rounded-xl border text-xs leading-relaxed',
            darkMode ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-white/60 border-gray-100 text-gray-500'
          )}>
            <p className="font-semibold mb-1 text-xs uppercase tracking-wider opacity-60">Full details</p>
            <p>{alert.description}</p>
            {alert.resolvedAt && (
              <p className="mt-1.5 text-green-500 font-medium">
                ✓ Resolved at {formatTimestamp(alert.resolvedAt)}
              </p>
            )}
          </div>
        )}

        {/* Footer: meta + actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2">
            {alert.entity && (
              <div className={cx(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium',
                darkMode ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-white/80 border-gray-100 text-gray-500'
              )}>
                <EntityIcon className="w-3.5 h-3.5" />
                {alert.entity}
              </div>
            )}
            <div className={cx(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium',
              darkMode ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-white/80 border-gray-100 text-gray-500'
            )}>
              <Clock className="w-3.5 h-3.5" />
              {formatTimestamp(alert.timestamp)}
            </div>
            {alert.tags?.map(tag => (
              <div key={tag} className={cx(
                'flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider',
                darkMode ? 'bg-slate-800 text-slate-500' : 'bg-gray-100 text-gray-400'
              )}>
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </div>
            ))}
          </div>

          {/* Action buttons */}
          {!isResolved && (
            <div className="flex items-center gap-2">
              {alert.status !== 'acknowledged' && (
                <button
                  onClick={() => onAcknowledge(alert.id)}
                  className={cx(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                    darkMode
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Acknowledge
                </button>
              )}
              <button
                onClick={() => onResolve(alert.id)}
                className={cx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  darkMode
                    ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                )}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Resolve
              </button>
              {alert.actionLabel && (
                <button
                  className={cx(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                    'bg-[#ff5a1f] hover:bg-[#e04d1a] text-white shadow-sm shadow-orange-500/20'
                  )}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {alert.actionLabel}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Mobile badges row */}
        <div className="flex sm:hidden items-center gap-2 mt-2.5">
          <span className={cx(
            'text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider',
            darkMode ? tc.badgeDark : tc.badgeLight
          )}>
            {tc.label}
          </span>
          <span className={cx(
            'text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
            darkMode ? sc.dark : sc.light
          )}>
            {sc.label}
          </span>
        </div>
      </div>
    </div>
  );
}