import React from 'react';
import { LIVE_ALERTS } from '../../store/kitchenData';

interface Props {
  sidebarCollapsed: boolean;
}

export default function LiveAlertsBar({ sidebarCollapsed }: Props) {
  return (
    <footer
      className={`hidden lg:flex fixed bottom-0 right-0 bg-white border-t border-slate-200 h-14 items-center px-8 z-50 overflow-hidden transition-all duration-300 ${
        sidebarCollapsed ? 'left-[72px]' : 'left-64'
      }`}
    >
      <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-widest mr-12 whitespace-nowrap font-sans">
        <span className="animate-pulse">📢</span>
        LIVE ALERTS
      </div>
      <div className="flex-1 flex gap-12 overflow-x-auto scrollbar-none items-center">
        {LIVE_ALERTS.map((alert) => (
          <div key={alert.id} className="flex items-center gap-3 whitespace-nowrap">
            <span className="text-lg">{alert.icon}</span>
            <span className="text-[11px] font-medium text-slate-700 font-sans">{alert.message}</span>
            <span className="text-[10px] text-slate-400 font-bold font-sans">{alert.time}</span>
          </div>
        ))}
      </div>
      <button className="ml-8 text-red-500 font-bold text-[11px] whitespace-nowrap hover:underline font-sans">
        View All Alerts
      </button>
    </footer>
  );
}
