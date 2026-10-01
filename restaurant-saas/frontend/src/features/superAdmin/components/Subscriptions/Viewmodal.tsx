// components/ViewModal.tsx

import { X, Mail, Phone, MapPin, GitBranch, Calendar, Clock, Crown, Zap, Package, Building2 } from "lucide-react";
import type { RestaurantNode } from "./Subcriptiontypes";
import { PLAN_COLORS } from "../../store/Subscriptions";

interface ViewModalProps {
  restaurant: RestaurantNode;
  darkMode: boolean;
  onClose: () => void;
  onEditClick: () => void;
}

const PLAN_ICONS: Record<string, React.ReactNode> = {
  Basic:      <Package size={13} />,
  Standard:   <Zap size={13} />,
  Premium:    <Crown size={13} />,
  Enterprise: <Building2 size={13} />,
};

const TAG_STYLES: Record<string, string> = {
  "Top Earner":   "bg-amber-500/10 text-amber-500 border-amber-500/20",
  "Enterprise":   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Multi-branch": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "New":          "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "Churned":      "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export default function ViewModal({ restaurant, darkMode, onClose, onEditClick }: ViewModalProps) {
  const planColors = PLAN_COLORS[restaurant.plan];

  const formatJoinedDate = (dateString: string): string => {
    const parsedDate = new Date(dateString);
    return isNaN(parsedDate.getTime())
      ? "N/A"
      : parsedDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm bg-black/60 outline-none"
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClose(); }}
      role="button"
      tabIndex={0}
      aria-label="Close modal backdrop"
    >
      <div
        className={`w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border shadow-2xl transition-all ${
          darkMode ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
        }`}
        onClick={(e) => e.stopPropagation()}
        role="presentation"
      >
        {/* Drag handle on mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className={`w-10 h-1 rounded-full ${darkMode ? "bg-slate-700" : "bg-slate-300"}`} />
        </div>

        {/* Header */}
        <div className={`flex items-start justify-between px-5 sm:p-5 py-4 border-b ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
          <div className="flex-1 min-w-0 pr-3">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
                {restaurant.id}
              </span>
              {(restaurant.tags ?? []).map((tag) => (
                <span key={tag} className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${TAG_STYLES[tag] ?? ""}`}>
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="text-lg font-extrabold tracking-tight truncate">{restaurant.name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors shrink-0 ${
              darkMode ? "hover:bg-slate-900 text-slate-400 hover:text-slate-200" : "hover:bg-slate-100 text-slate-500"
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 sm:p-5 py-4 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Owner + Status row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Owner</p>
              <p className="text-sm font-bold">{restaurant.owner}</p>
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Status</p>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                restaurant.status === "Active" ? "bg-emerald-500/10 text-emerald-500"
                  : restaurant.status === "Trial" ? "bg-amber-500/10 text-amber-500"
                  : "bg-slate-500/10 text-slate-400"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  restaurant.status === "Active" ? "bg-emerald-500 animate-pulse"
                    : restaurant.status === "Trial" ? "bg-amber-400" : "bg-slate-400"
                }`} />
                {restaurant.status}
              </span>
            </div>
          </div>

          <div className={`h-px ${darkMode ? "bg-slate-900" : "bg-slate-100"}`} />

          {/* Contact */}
          <div className="space-y-2">
            <p className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Contact</p>
            <a href={`mailto:${restaurant.email}`} className={`flex items-center gap-2 text-xs font-medium hover:text-orange-500 transition-colors ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
              <Mail size={13} className="text-slate-400 shrink-0" />
              <span className="truncate">{restaurant.email}</span>
            </a>
            <a href={`tel:${restaurant.phone}`} className={`flex items-center gap-2 text-xs font-medium hover:text-orange-500 transition-colors ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
              <Phone size={13} className="text-slate-400 shrink-0" />{restaurant.phone}
            </a>
          </div>

          <div className={`h-px ${darkMode ? "bg-slate-900" : "bg-slate-100"}`} />

          {/* Location */}
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Location</p>
            <div className={`flex items-start gap-1.5 text-xs font-medium ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
              <MapPin size={13} className="text-orange-500 shrink-0 mt-0.5" />{restaurant.location}
            </div>
          </div>

          <div className={`h-px ${darkMode ? "bg-slate-900" : "bg-slate-100"}`} />

          {/* Stats grid — 2×2 on mobile, 4-wide on sm+ */}
          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl ${darkMode ? "bg-slate-900/60 border border-slate-800" : "bg-white border border-slate-100"}`}>
            <div className="text-center">
              <p className={`text-[9px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Plan</p>
              <span className={`inline-flex items-center gap-1 mt-1 text-[11px] font-extrabold ${planColors.text}`}>
                {PLAN_ICONS[restaurant.plan]}{restaurant.plan}
              </span>
            </div>
            <div className={`text-center sm:border-l ${darkMode ? "sm:border-slate-800" : "sm:border-slate-200"}`}>
              <p className={`text-[9px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Revenue</p>
              <p className="text-[11px] font-extrabold text-blue-500 mt-1">{restaurant.revenue}</p>
            </div>
            <div className={`text-center border-t sm:border-t-0 sm:border-l pt-2 sm:pt-0 ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
              <p className={`text-[9px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Branches</p>
              <p className={`text-[11px] font-extrabold mt-1 flex items-center justify-center gap-0.5 ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
                <GitBranch size={10} className="text-slate-400" />{restaurant.branches}
              </p>
            </div>
            <div className={`text-center border-t sm:border-t-0 sm:border-l pt-2 sm:pt-0 ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
              <p className={`text-[9px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Joined</p>
              <p className={`text-[10px] font-semibold mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                {formatJoinedDate(restaurant.joinedDate)}
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <div className={`flex items-center gap-1.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
              <Calendar size={12} />
              <span>Joined: <span className={`font-semibold ${darkMode ? "text-slate-300" : "text-slate-600"}`}>{restaurant.joinedDate}</span></span>
            </div>
            <div className={`flex items-center gap-1.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
              <Clock size={12} />
              <span>Last active: <span className={`font-semibold ${darkMode ? "text-slate-300" : "text-slate-600"}`}>{restaurant.lastActive}</span></span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex gap-3 px-5 sm:px-5 py-4 border-t ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
          <button type="button" onClick={onClose}
            className={`flex-1 h-10 text-xs font-bold rounded-xl border transition-colors ${
              darkMode ? "border-slate-800 hover:bg-slate-900 text-slate-300" : "border-slate-200 hover:bg-slate-50 text-slate-600"
            }`}>
            Close
          </button>
          <button type="button" onClick={() => { onClose(); onEditClick(); }}
            className="flex-1 h-10 text-xs font-bold bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors">
            Edit Plan / Status
          </button>
        </div>
      </div>
    </div>
  );
}