import React from 'react';
import { useStaffSearch } from '../components/dashboard/StaffSearchContext';
import { useStaffDashboard } from '../hooks/useStaffDashboard';
import type { RequestItem } from '../store/staff.store';

type Request = RequestItem;

export default function StaffRequestsPage() {
  const { query } = useStaffSearch();
  const { requests, setRequests } = useStaffDashboard();

  const updateRequestStatus = (id: number, status: Request['status']) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const filteredRequests = requests.filter(r =>
    r.status !== 'Resolved' && (
      r.table.toLowerCase().includes(query.toLowerCase()) ||
      r.type.toLowerCase().includes(query.toLowerCase()) ||
      r.status.toLowerCase().includes(query.toLowerCase())
    )
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-sans tracking-tight">Customer Requests</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Respond to guest calls and service requests.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-red-50 text-red-650 dark:bg-red-950/40 dark:text-red-400 font-bold px-3 py-1.5 rounded-xl border border-red-100 dark:border-red-900/30 font-sans">
            {requests.filter(r => r.status === 'Pending').length} Pending Requests
          </span>
        </div>
      </div>

      {/* Requests Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRequests.length > 0 ? (
          filteredRequests.map(req => (
            <div
              key={req.id}
              className={`bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-soft transition-all flex flex-col justify-between ${
                req.severity === 'high' ? 'border-l-4 border-l-red-500' :
                req.severity === 'medium' ? 'border-l-4 border-l-orange-500' :
                'border-l-4 border-l-slate-300'
              }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 font-sans">{req.table}</h2>
                    <p className="text-[10px] text-slate-400 font-sans mt-0.5">{req.time}</p>
                  </div>
                  <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${
                    req.status === 'Pending' ? 'bg-red-150 text-red-600 dark:bg-red-950/40 dark:text-red-400 animate-pulse' :
                    'bg-orange-50 text-dine-orange dark:bg-orange-950/40 dark:text-orange-400'
                  }`}>
                    {req.status === 'Pending' ? 'New Call' : 'In Progress'}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-dine-orange shrink-0">
                    <span className="material-symbols-outlined text-[20px]">
                      {req.type === 'Call Waiter' ? 'person' :
                       req.type === 'Water Bottle' ? 'local_cafe' :
                       req.type === 'Extra Napkins' ? 'layers' :
                       req.type === 'Clean Table' ? 'cleaning_services' : 'restaurant'}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-750 dark:text-slate-200 font-sans">{req.type}</p>
                    <p className="text-[10px] text-slate-400 font-sans">Wait Time: {req.elapsedMinutes} mins</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex gap-2">
                {req.status === 'Pending' ? (
                  <button
                    onClick={() => updateRequestStatus(req.id, 'InProgress')}
                    className="flex-1 bg-dine-orange hover:bg-dine-orange/90 text-white font-bold text-xs py-2 px-3 rounded-lg transition-all"
                  >
                    Accept
                  </button>
                ) : (
                  <button
                    onClick={() => updateRequestStatus(req.id, 'Resolved')}
                    className="flex-1 bg-green-500 hover:bg-green-650 text-white font-bold text-xs py-2 px-3 rounded-lg transition-all"
                  >
                    Resolve
                  </button>
                )}
                <button
                  onClick={() => updateRequestStatus(req.id, 'Resolved')}
                  className="border border-slate-100 text-slate-500 hover:text-red-500 font-bold text-xs px-3 py-2 rounded-lg transition-all"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
            <span className="material-symbols-outlined text-[40px] text-slate-300">notifications_off</span>
            <p className="text-sm font-bold text-slate-500 mt-2 font-sans">No pending requests!</p>
            <p className="text-xs text-slate-400 font-sans mt-0.5">Guests are currently comfortable and happy.</p>
          </div>
        )}
      </div>
    </div>
  );
}
