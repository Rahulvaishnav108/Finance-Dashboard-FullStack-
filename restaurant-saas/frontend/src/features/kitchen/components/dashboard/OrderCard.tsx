import React from 'react';
import type { KitchenOrder } from '../../store/kitchenData';

interface Props {
  order: KitchenOrder;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onMarkReady?: (id: string) => void;
  onDelay?: (id: string) => void;
  onRush?: (id: string) => void;
  onPickup?: (id: string) => void;
}

const STATUS_COLORS = {
  new: { border: 'border-l-blue-500', text: 'text-blue-600', bg: 'bg-blue-100', btnPrimary: 'bg-blue-600 hover:bg-blue-700 shadow-blue-100', btnSecondary: 'border-red-200 text-red-500 hover:bg-red-50' },
  preparing: { border: 'border-l-orange-500', text: 'text-orange-600', bg: 'bg-orange-100', btnPrimary: 'bg-orange-600 hover:bg-orange-700 shadow-orange-100', btnSecondary: 'border-orange-200 text-orange-500 hover:bg-orange-50' },
  ready: { border: 'border-l-green-500', text: 'text-green-600', bg: 'bg-green-100', btnPrimary: 'bg-green-600 hover:bg-green-700 shadow-green-100', btnSecondary: '' },
  delayed: { border: 'border-l-red-500', text: 'text-red-600', bg: 'bg-red-100', btnPrimary: 'border-red-200 text-red-500 hover:bg-red-50', btnSecondary: 'border-slate-200 text-slate-500 hover:bg-slate-50' },
  completed: { border: 'border-l-slate-300', text: 'text-slate-500', bg: 'bg-slate-100', btnPrimary: '', btnSecondary: '' },
  cancelled: { border: 'border-l-slate-300', text: 'text-slate-400', bg: 'bg-slate-50', btnPrimary: '', btnSecondary: '' },
};

export default function OrderCard({ order, onAccept, onReject, onMarkReady, onDelay, onRush, onPickup }: Props) {
  const colors = STATUS_COLORS[order.status];

  return (
    <div className={`bg-white border-l-4 ${colors.border} rounded-xl shadow-sm p-4 border border-slate-100`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-bold text-base font-sans text-slate-800">#{order.id}</h4>
        <span className="text-[10px] text-slate-400 font-medium font-sans">{order.timeAgo || order.time}</span>
      </div>

      {/* Items */}
      <div className="space-y-1.5 text-sm text-slate-700 mb-3 font-sans">
        {order.items.map((item, i) => (
          <p key={i}>{item.qty} × {item.name}</p>
        ))}
      </div>

      {/* Progress Bar (Preparing) */}
      {order.status === 'preparing' && order.progress !== undefined && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="bg-orange-500 h-full rounded-full transition-all" style={{ width: `${order.progress}%` }} />
            </div>
            <span className="text-[10px] font-bold text-slate-500 ml-3 font-sans">{order.progress}%</span>
          </div>
        </div>
      )}

      {/* Delay Info (Delayed) */}
      {order.status === 'delayed' && order.delayMins && (
        <div className="mb-3">
          <p className="text-[11px] font-bold text-red-600 font-sans">{order.delayMins} mins delay</p>
        </div>
      )}

      {/* Table & Type */}
      <div className="flex items-center gap-2 text-[10px] mb-4 font-sans">
        <span className={`font-bold ${colors.text}`}>Table {order.table}</span>
        <span className="text-slate-300">•</span>
        <span className="text-slate-400 capitalize">{order.type.replace('-', ' ')}</span>
        {order.chef && (
          <>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400">{order.chef}</span>
          </>
        )}
      </div>

      {/* Action Buttons */}
      {order.status === 'new' && (
        <div className="flex flex-col min-[380px]:flex-row lg:flex-col xl:flex-col min-[1400px]:flex-row gap-2">
          <button onClick={() => onReject?.(order.id)} className={`flex-1 py-1.5 border rounded-lg text-xs font-bold font-sans ${colors.btnSecondary}`}>Reject</button>
          <button onClick={() => onAccept?.(order.id)} className={`flex-1 py-1.5 text-white rounded-lg text-xs font-bold shadow-md font-sans ${colors.btnPrimary}`}>Accept</button>
        </div>
      )}
      {order.status === 'preparing' && (
        <div className="flex flex-col min-[380px]:flex-row lg:flex-col xl:flex-col min-[1400px]:flex-row gap-2">
          <button onClick={() => onDelay?.(order.id)} className={`flex-1 py-1.5 border rounded-lg text-xs font-bold font-sans flex items-center justify-center gap-1 ${colors.btnSecondary}`}>
            <span className="material-symbols-outlined text-[14px]">schedule</span> Delay
          </button>
          <button onClick={() => onMarkReady?.(order.id)} className={`flex-1 py-1.5 text-white rounded-lg text-xs font-bold shadow-md font-sans ${colors.btnPrimary}`}>Mark Ready</button>
        </div>
      )}
      {order.status === 'ready' && (
        <button onClick={() => onPickup?.(order.id)} className={`w-full py-2 text-white rounded-lg text-xs font-bold font-sans ${colors.btnPrimary}`}>Ready for Pickup</button>
      )}
      {order.status === 'delayed' && (
        <div className="flex flex-col min-[380px]:flex-row lg:flex-col xl:flex-col min-[1400px]:flex-row gap-2">
          <button onClick={() => onRush?.(order.id)} className="flex-1 py-1.5 border border-red-200 text-red-500 rounded-lg text-xs font-bold font-sans flex items-center justify-center gap-1">⚡ Rush</button>
          <button className="flex-1 py-1.5 border border-slate-200 text-slate-500 rounded-lg text-xs font-bold font-sans">Delay Info</button>
        </div>
      )}
    </div>
  );
}
