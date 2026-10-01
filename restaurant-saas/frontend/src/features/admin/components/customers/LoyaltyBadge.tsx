import React from 'react';
import type { LoyaltyTier } from '../../store/customers.store';

interface LoyaltyBadgeProps {
  tier: LoyaltyTier;
}

const TIER_CONFIG: Record<LoyaltyTier, { bg: string; text: string; icon: string }> = {
  Gold:   { bg: 'bg-amber-50 dark:bg-amber-950/40',   text: 'text-amber-600 dark:text-amber-400',  icon: '⭐' },
  Silver: { bg: 'bg-slate-50 dark:bg-slate-800/60',   text: 'text-slate-500 dark:text-slate-300',  icon: '✦'  },
  Bronze: { bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-500 dark:text-orange-400', icon: '★'  },
};

export function LoyaltyBadge({ tier }: LoyaltyBadgeProps) {
  const { bg, text, icon } = TIER_CONFIG[tier];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${bg} ${text}`}
    >
      <span className="text-[10px]">{icon}</span>
      {tier}
    </span>
  );
}