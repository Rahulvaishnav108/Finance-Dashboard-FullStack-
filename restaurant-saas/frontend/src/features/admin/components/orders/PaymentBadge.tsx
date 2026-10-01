import React from 'react';
import { BadgeCheck, Wifi, CreditCard, Banknote } from 'lucide-react';
import type { PaymentMethod } from '../../store/orders.store';

interface PaymentBadgeProps {
  method: PaymentMethod;
}

const config: Record<PaymentMethod, { icon: React.ElementType; label: string; color: string }> = {
  Paid:   { icon: BadgeCheck, label: 'Paid',   color: 'text-green-600  dark:text-green-400'  },
  Online: { icon: Wifi,       label: 'Online', color: 'text-blue-600   dark:text-blue-400'   },
  Card:   { icon: CreditCard, label: 'Card',   color: 'text-purple-600 dark:text-purple-400' },
  Cash:   { icon: Banknote,   label: 'Cash',   color: 'text-amber-600  dark:text-amber-400'  },
};

export function PaymentBadge({ method }: PaymentBadgeProps) {
  const { icon: Icon, label, color } = config[method];
  return (
    <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg px-2.5 py-1 w-fit">
      <Icon className={`w-3.5 h-3.5 ${color}`} />
      <span className={`text-xs font-medium ${color}`}>{label}</span>
    </div>
  );
}