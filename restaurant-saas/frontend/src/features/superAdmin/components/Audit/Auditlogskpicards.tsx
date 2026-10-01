import React from 'react';
import { Shield, Building2, Cog, Flame } from 'lucide-react';
import { LogItem } from "../../store/AuditLogs";

interface AuditLogsKPICardsProps {
  darkMode: boolean;
  logs: LogItem[];
}

interface KPICardProps {
  darkMode: boolean;
  label: string;
  value: number | string;
  icon: React.ReactNode;
  iconBg: string;
  colSpan?: string;
}

function KPICard({ darkMode, label, value, icon, iconBg, colSpan = '' }: KPICardProps) {
  return (
    <div
      className={`${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'
      } p-4 rounded-2xl border flex items-center justify-between shadow-sm ${colSpan}`}
    >
      <div>
        <span className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wider block mb-0.5">
          {label}
        </span>
        <span className="text-2xl sm:text-3xl font-bold">{value}</span>
      </div>
      <div
        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${iconBg} flex items-center justify-center border shrink-0`}
      >
        {icon}
      </div>
    </div>
  );
}

export default function AuditLogsKPICards({ darkMode, logs }: AuditLogsKPICardsProps) {
  const adminCount = logs.filter((l) => l.type === 'Admin').length;
  const restaurantCount = logs.filter((l) => l.type === 'Restaurant').length;
  const subscriptionCount = logs.filter((l) => l.type === 'Subscription').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
      <KPICard
        darkMode={darkMode}
        label="Admin Actions"
        value={adminCount}
        iconBg={
          darkMode
            ? 'bg-red-950/50 text-red-400 border-red-900/40'
            : 'bg-red-50 text-red-600 border-red-100'
        }
        icon={<Shield className="w-4 h-4 sm:w-5 sm:h-5" />}
      />
      <KPICard
        darkMode={darkMode}
        label="Restaurant"
        value={restaurantCount}
        iconBg={
          darkMode
            ? 'bg-blue-950/50 text-blue-400 border-blue-900/40'
            : 'bg-blue-50 text-blue-600 border-blue-100'
        }
        icon={<Building2 className="w-4 h-4 sm:w-5 sm:h-5" />}
      />
      <KPICard
        darkMode={darkMode}
        label="Transactions"
        value={4}
        iconBg={
          darkMode
            ? 'bg-emerald-950/50 text-emerald-400 border-emerald-900/40'
            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
        }
        icon={<span className="font-bold text-base sm:text-lg">$</span>}
      />
      <KPICard
        darkMode={darkMode}
        label="Subscriptions"
        value={subscriptionCount}
        iconBg={
          darkMode
            ? 'bg-purple-950/50 text-purple-400 border-purple-900/40'
            : 'bg-purple-50 text-purple-600 border-purple-100'
        }
        icon={<Cog className="w-4 h-4 sm:w-5 sm:h-5" />}
      />
      <KPICard
        darkMode={darkMode}
        label="System"
        value={2}
        iconBg={
          darkMode
            ? 'bg-orange-950/50 text-orange-400 border-orange-900/40'
            : 'bg-orange-50 text-orange-600 border-orange-100'
        }
        icon={<Flame className="w-4 h-4 sm:w-5 sm:h-5" />}
        colSpan="col-span-2 md:col-span-1"
      />
    </div>
  );
}