import React from 'react';
import { useStaffSearch } from '../components/dashboard/StaffSearchContext';
import { useStaffDashboard } from '../hooks/useStaffDashboard';
import type { AlertItem } from '../store/staff.store';

type Alert = AlertItem;

export default function StaffAlertsPage() {
  const { query } = useStaffSearch();
  const { alerts, setAlerts } = useStaffDashboard();

  const dismissAlert = (id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const clearAll = () => {
    setAlerts([]);
  };

  const filteredAlerts = alerts.filter(a =>
    a.message.toLowerCase().includes(query.toLowerCase()) ||
    a.severity.toLowerCase().includes(query.toLowerCase()) ||
    a.type.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-sans tracking-tight">Alerts Center</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Real-time alerts, delays, and shift updates.</p>
        </div>
        {alerts.length > 0 && (
          <button
            onClick={clearAll}
            className="border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-500 font-bold text-xs py-2 px-4 rounded-xl transition-all"
          >
            Clear All Notifications
          </button>
        )}
      </div>

      {/* Feed list */}
      <div className="space-y-4 max-w-4xl">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`bg-white border border-slate-105 rounded-2xl p-5 shadow-sm hover:shadow-soft transition-all flex items-start justify-between gap-4 ${
                alert.severity === 'Critical' ? 'border-l-4 border-l-red-500 dark:hover:border-red-900/40' :
                alert.severity === 'Warning' ? 'border-l-4 border-l-orange-500' :
                'border-l-4 border-l-blue-500'
              }`}
            >
              <div className="flex gap-4">
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  alert.severity === 'Critical' ? 'bg-red-50 text-red-655 dark:bg-red-950/40 dark:text-red-400' :
                  alert.severity === 'Warning' ? 'bg-orange-50 text-dine-orange dark:bg-orange-950/40' :
                  'bg-blue-50 text-blue-655 dark:bg-blue-950/40 dark:text-blue-400'
                }`}>
                  <span className="material-symbols-outlined text-[20px]">
                    {alert.severity === 'Critical' ? 'error' :
                     alert.severity === 'Warning' ? 'warning' : 'info'}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200 font-sans">
                      {alert.type} Alert
                    </span>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                      alert.severity === 'Critical' ? 'bg-red-105 text-red-655 dark:bg-red-950/40 dark:text-red-450' :
                      alert.severity === 'Warning' ? 'bg-orange-100 text-dine-orange dark:bg-orange-950/40 dark:text-orange-400' :
                      'bg-blue-100 text-blue-655 dark:bg-blue-950/40 dark:text-blue-455'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-[10px] text-slate-400 font-sans">{alert.time}</span>
                  </div>
                  <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-sans mt-2">
                    {alert.message}
                  </p>
                </div>
              </div>

              <button
                onClick={() => dismissAlert(alert.id)}
                className="text-slate-450 hover:text-slate-650 dark:hover:text-slate-250 p-1 transition-all rounded-full shrink-0 flex items-center justify-center"
                title="Dismiss Alert"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          ))
        ) : (
          <div className="py-12 text-center bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
            <span className="material-symbols-outlined text-[40px] text-slate-300">notifications_off</span>
            <p className="text-sm font-bold text-slate-500 mt-2 font-sans">All clear!</p>
            <p className="text-xs text-slate-400 font-sans mt-0.5">No new alerts or pending shift notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
}
