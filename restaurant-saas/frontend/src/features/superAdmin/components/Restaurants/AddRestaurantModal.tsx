// components/AddRestaurantModal.tsx

import { X } from "lucide-react";
// Fixed relative import path to point to the local folder types directly
import type { NewRestaurantForm } from "./Restauranttypes";

interface AddRestaurantModalProps {
  darkMode: boolean;
  formData: NewRestaurantForm;
  onChange: (data: Partial<NewRestaurantForm>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function AddRestaurantModal({
  darkMode,
  formData,
  onChange,
  onSubmit,
  onClose,
}: AddRestaurantModalProps) {
  const inputClass = `w-full h-10 px-3 rounded-xl text-sm border outline-none transition-all ${
    darkMode
      ? "bg-slate-900/50 border-slate-800 text-white focus:border-orange-500 placeholder:text-slate-600"
      : "bg-slate-50 border-slate-200 focus:border-orange-500 placeholder:text-slate-400"
  }`;

  const labelClass = `block text-xs font-semibold uppercase mb-1.5 ${
    darkMode ? "text-slate-400" : "text-slate-500"
  }`;

  const selectClass = `w-full h-10 px-2 rounded-xl text-sm border outline-none transition-all ${
    darkMode
      ? "bg-slate-950 border-slate-800 text-white focus:border-orange-500 text-slate-100"
      : "bg-slate-50 border-slate-200 focus:border-orange-500 text-slate-800"
  }`;

  // Direct class for options to maintain dark mode background continuity inside dropdown menus
  const optionClass = darkMode ? "bg-slate-950 text-slate-100" : "bg-white text-slate-800";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40 animate-fade-in">
      {/* Click outside backdrop overlay listener to safely close modal configured cleanly as an accessible button */}
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
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold tracking-tight">Register New Restaurant</h3>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${darkMode ? "hover:bg-slate-900 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">

          <div>
            <label htmlFor="restaurant-name" className={labelClass}>Restaurant Name</label>
            <input
              id="restaurant-name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="e.g. Urban Bistro HQ"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="owner-name" className={labelClass}>Owner Full Name</label>
            <input
              id="owner-name"
              type="text"
              required
              value={formData.owner}
              onChange={(e) => onChange({ owner: e.target.value })}
              placeholder="e.g. John Doe"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="restaurant-email" className={labelClass}>Email</label>
              <input
                id="restaurant-email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => onChange({ email: e.target.value })}
                placeholder="contact@brand.com"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="restaurant-phone" className={labelClass}>Phone</label>
              <input
                id="restaurant-phone"
                type="text"
                required
                value={formData.phone}
                onChange={(e) => onChange({ phone: e.target.value })}
                placeholder="+1 (555) 019-2834"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="restaurant-location" className={labelClass}>Location Coordinates</label>
            <input
              id="restaurant-location"
              type="text"
              required
              value={formData.location}
              onChange={(e) => onChange({ location: e.target.value })}
              placeholder="e.g. Broadway, New York, NY"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="tier-bracket" className={labelClass}>Tier Bracket</label>
              <select
                id="tier-bracket"
                value={formData.plan}
                onChange={(e) => onChange({ plan: e.target.value as NewRestaurantForm["plan"] })}
                className={selectClass}
              >
                <option value="Basic" className={optionClass}>Basic Tier</option>
                <option value="Standard" className={optionClass}>Standard Tier</option>
                <option value="Premium" className={optionClass}>Premium Tier</option>
              </select>
            </div>
            <div>
              <label htmlFor="initial-status" className={labelClass}>Initial Status</label>
              <select
                id="initial-status"
                value={formData.status}
                onChange={(e) => onChange({ status: e.target.value as NewRestaurantForm["status"] })}
                className={selectClass}
              >
                <option value="Trial" className={optionClass}>Trial</option>
                <option value="Active" className={optionClass}>Active</option>
                <option value="Inactive" className={optionClass}>Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="est-revenue" className={labelClass}>Est. Revenue ($)</label>
              <input
                id="est-revenue"
                type="text"
                required
                value={formData.revenue}
                onChange={(e) => onChange({ revenue: e.target.value })}
                placeholder="e.g. $12,500"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="total-branches" className={labelClass}>Total Branches</label>
              <input
                id="total-branches"
                type="number"
                min="1"
                required
                value={formData.branches || 1}
                onChange={(e) => onChange({ branches: Number(e.target.value) || 1 })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 h-11 text-xs font-bold rounded-xl transition-colors border ${
                darkMode ? "border-slate-800 hover:bg-slate-900 text-slate-300" : "border-slate-200 hover:bg-slate-50 text-slate-600"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-11 text-xs font-bold bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/10"
            >
              Save Nodes
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}