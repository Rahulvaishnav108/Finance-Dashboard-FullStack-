// components/AddRestaurantModal.tsx

import { X } from "lucide-react";
import type { NewRestaurantForm, PlanType, StatusType } from "./Subcriptiontypes";

interface AddRestaurantModalProps {
  darkMode: boolean;
  formData: NewRestaurantForm;
  onChange: (data: Partial<NewRestaurantForm>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function AddRestaurantModal({
  darkMode, formData, onChange, onSubmit, onClose,
}: AddRestaurantModalProps) {
  const inputClass = `w-full h-10 px-3 rounded-xl text-sm border outline-none transition-all focus:ring-2 focus:ring-orange-500/20 ${
    darkMode
      ? "bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-600 focus:border-orange-500/60"
      : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-orange-500/60"
  }`;

  const labelClass = `block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
    darkMode ? "text-slate-400" : "text-slate-500"
  }`;

  const selectClass = `w-full h-10 px-2.5 rounded-xl text-sm border outline-none transition-all cursor-pointer ${
    darkMode
      ? "bg-slate-900/80 border-slate-800 text-white focus:border-orange-500/60"
      : "bg-slate-50 border-slate-200 text-slate-800 focus:border-orange-500/60"
  }`;

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
        className={`w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border shadow-2xl overflow-hidden ${
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
        <div className={`flex items-center justify-between px-5 sm:px-6 py-4 border-b ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
          <div>
            <h3 className="text-base font-extrabold tracking-tight">Add Restaurant</h3>
            <p className={`text-xs mt-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
              New account will appear in the subscriptions list immediately.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${darkMode ? "hover:bg-slate-900 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="px-5 sm:px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

          <div>
            <label htmlFor="modal-name" className={labelClass}>Restaurant Name *</label>
            <input id="modal-name" type="text" required value={formData.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="e.g. The Coastal Table" className={inputClass} />
          </div>

          <div>
            <label htmlFor="modal-owner" className={labelClass}>Owner Name *</label>
            <input id="modal-owner" type="text" required value={formData.owner}
              onChange={(e) => onChange({ owner: e.target.value })}
              placeholder="e.g. Anjali Mehta" className={inputClass} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="modal-email" className={labelClass}>Email</label>
              <input id="modal-email" type="email" value={formData.email}
                onChange={(e) => onChange({ email: e.target.value })}
                placeholder="owner@restaurant.com" className={inputClass} />
            </div>
            <div>
              <label htmlFor="modal-phone" className={labelClass}>Phone</label>
              <input id="modal-phone" type="text" value={formData.phone}
                onChange={(e) => onChange({ phone: e.target.value })}
                placeholder="+91 98765 43210" className={inputClass} />
            </div>
          </div>

          <div>
            <label htmlFor="modal-location" className={labelClass}>Location</label>
            <input id="modal-location" type="text" value={formData.location}
              onChange={(e) => onChange({ location: e.target.value })}
              placeholder="e.g. Bandra West, Mumbai, MH" className={inputClass} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="modal-plan" className={labelClass}>Plan</label>
              <select id="modal-plan" value={formData.plan}
                onChange={(e) => onChange({ plan: e.target.value as PlanType })}
                className={selectClass}>
                <option value="Basic">Basic — $299/mo</option>
                <option value="Standard">Standard — $599/mo</option>
                <option value="Premium">Premium — $999/mo</option>
                <option value="Enterprise">Enterprise — $1,999/mo</option>
              </select>
            </div>
            <div>
              <label htmlFor="modal-status" className={labelClass}>Status</label>
              <select id="modal-status" value={formData.status}
                onChange={(e) => onChange({ status: e.target.value as StatusType })}
                className={selectClass}>
                <option value="Trial">Trial</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="modal-revenue" className={labelClass}>Est. Revenue</label>
              <input id="modal-revenue" type="text" value={formData.revenue}
                onChange={(e) => onChange({ revenue: e.target.value })}
                placeholder="e.g. $5,000" className={inputClass} />
            </div>
            <div>
              <label htmlFor="modal-branches" className={labelClass}>Branches</label>
              <input id="modal-branches" type="number" min="1" value={formData.branches}
                onChange={(e) => onChange({ branches: Number(e.target.value) })}
                className={inputClass} />
            </div>
          </div>

          <div>
            <label htmlFor="modal-tags" className={labelClass}>Tags (comma separated)</label>
            <input id="modal-tags" type="text" value={formData.tags}
              onChange={(e) => onChange({ tags: e.target.value })}
              placeholder="e.g. New, Multi-branch, Top Earner" className={inputClass} />
          </div>

          <div className={`flex gap-3 pt-2 border-t ${darkMode ? "border-slate-900" : "border-slate-100"}`}>
            <button type="button" onClick={onClose}
              className={`flex-1 h-11 text-xs font-bold rounded-xl border transition-colors ${
                darkMode ? "border-slate-800 hover:bg-slate-900 text-slate-300" : "border-slate-200 hover:bg-slate-50 text-slate-600"
              }`}>
              Cancel
            </button>
            <button type="submit"
              className="flex-1 h-11 text-xs font-bold bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/20">
              Add Restaurant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}