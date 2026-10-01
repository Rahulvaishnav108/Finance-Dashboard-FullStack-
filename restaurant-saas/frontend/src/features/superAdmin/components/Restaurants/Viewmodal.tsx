// components/ViewModal.tsx

import { X, Mail, Phone, MapPin, IndianRupee, Building2 } from "lucide-react";
import type { RestaurantsRow } from "./Restauranttypes";

interface ViewModalProps {
  restaurant: RestaurantsRow & { branches?: number };
  darkMode: boolean;
  onClose: () => void;
}

export default function ViewModal({ restaurant, darkMode, onClose }: ViewModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/50 animate-fade-in">
      {/* Backdrop overlay button listener to close when clicking outside */}
      <button
        type="button"
        className="fixed inset-0 -z-10 bg-transparent border-0 outline-none appearance-none cursor-default"
        onClick={onClose}
        aria-label="Close backdrop overlay"
      />

      <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all ${
        darkMode ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b pb-3 border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 bg-orange-500/10 text-orange-500 rounded font-bold">
              ID: {restaurant.id}
            </span>
            <h3 className="text-xl font-extrabold tracking-tight mt-1">{restaurant.name}</h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${darkMode ? "hover:bg-slate-900 text-slate-400 hover:text-slate-200" : "hover:bg-slate-100 text-slate-500"}`}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Owner</p>
              <p className="text-sm font-bold mt-0.5">{restaurant.owner}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">System Health</p>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold mt-1 ${
                restaurant.status === "Active"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : restaurant.status === "Trial"
                  ? "bg-orange-500/10 text-orange-400"
                  : "bg-slate-500/10 text-slate-400"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  restaurant.status === "Active" ? "bg-emerald-500" : restaurant.status === "Trial" ? "bg-orange-400" : "bg-slate-400"
                }`} />
                {restaurant.status}
              </span>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-900" />

          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Contact Operations</p>
            <div className="flex items-center gap-2 text-xs">
              <Mail size={14} className="text-slate-400" />
              <span className="font-medium">{restaurant.email}</span>
            </div>
            <div className="flex items-center gap-2 text-xs mt-1">
              <Phone size={14} className="text-slate-400" />
              <span className="font-medium">{restaurant.phone}</span>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-900" />

          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Geographic Coordinates</p>
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <MapPin size={14} className="text-orange-500 shrink-0" />
              <span>{restaurant.location}</span>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-900" />

          {/* Metrics Panel */}
          <div className="grid grid-cols-3 gap-2 bg-slate-500/5 p-3 rounded-xl border border-slate-500/10">
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Tier</p>
              <p className="text-xs font-extrabold text-orange-500 uppercase mt-0.5">{restaurant.plan}</p>
            </div>
            <div className="text-center border-x border-slate-200 dark:border-slate-800 px-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Gross ARR</p>
              <div className="flex items-baseline gap-0.5 mt-0.5">
                <IndianRupee size={11} className="-mr-0.5" />
                <span className="font-extrabold text-sm sm:text-base leading-none text-emerald-500">
                  {restaurant.revenue ? restaurant.revenue.replace("$", "").replace("₹", "") : "0"}
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Branches</p>
              <p className="text-xs font-extrabold mt-0.5 flex items-center justify-center gap-1">
                <Building2 size={11} className="text-slate-400" />
                {/* Fallback cleanly without explicit any type assertion casting */}
                {restaurant.branches || 1}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className={`w-full mt-6 h-10 text-xs font-bold rounded-xl border transition-colors ${
            darkMode ? "border-slate-800 hover:bg-slate-900 text-slate-300" : "border-slate-200 hover:bg-slate-50 text-slate-600"
          }`}
        >
          Close View Node
        </button>
      </div>
    </div>
  );
}