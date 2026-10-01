// src/features/superAdmin/components/Settings/SettingsUI.tsx
// ─── Shared primitives reused across all settings panels ────────────────────
import React from "react";

// ── Card wrapper ────────────────────────────────────────────────────────────
export function Card({
  darkMode,
  children,
  className = "",
}: {
  darkMode: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 space-y-5 ${
        darkMode ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ── Section title inside a card ─────────────────────────────────────────────
export function CardTitle({
  darkMode,
  children,
}: {
  darkMode: boolean;
  children: React.ReactNode;
}) {
  return (
    <p
      className={`text-xs font-bold uppercase tracking-wider ${
        darkMode ? "text-slate-400" : "text-slate-500"
      }`}
    >
      {children}
    </p>
  );
}

// ── Divider ─────────────────────────────────────────────────────────────────
export function Divider({ darkMode }: { darkMode: boolean }) {
  return (
    <hr className={`${darkMode ? "border-slate-800" : "border-slate-100"}`} />
  );
}

// ── Field wrapper with label ─────────────────────────────────────────────────
interface FieldProps {
  label: string;
  icon?: React.ElementType;
  darkMode: boolean;
  children: React.ReactNode;
  hint?: string;
}
export function Field({ label, icon: Icon, darkMode, children, hint }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <div
        className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider ${
          darkMode ? "text-slate-400" : "text-slate-500"
        }`}
      >
        {Icon && <Icon size={11} className="text-orange-400" />}
        {label}
      </div>
      {children}
      {hint && (
        <p className={`text-[11px] ${darkMode ? "text-slate-600" : "text-slate-400"}`}>
          {hint}
        </p>
      )}
    </div>
  );
}

// ── Text input ───────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  darkMode: boolean;
}
export function Input({ darkMode, className = "", ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`w-full h-10 px-3.5 rounded-xl text-xs font-medium outline-none border transition-all duration-200 ${
        darkMode
          ? "bg-slate-900 border-slate-800 text-slate-100 focus:border-orange-500/60 placeholder:text-slate-600"
          : "bg-slate-50 border-slate-200 text-slate-800 focus:border-orange-400 focus:bg-white placeholder:text-slate-400"
      } ${className}`}
    />
  );
}

// ── Select ───────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  darkMode: boolean;
}
export function Select({ darkMode, className = "", children, ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={`w-full h-10 px-3.5 rounded-xl text-xs font-medium outline-none border transition-all duration-200 appearance-none cursor-pointer ${
        darkMode
          ? "bg-slate-900 border-slate-800 text-slate-100 focus:border-orange-500/60"
          : "bg-slate-50 border-slate-200 text-slate-800 focus:border-orange-400 focus:bg-white"
      } ${className}`}
    >
      {children}
    </select>
  );
}

// ── Toggle switch ─────────────────────────────────────────────────────────────
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}
export function Toggle({ checked, onChange, disabled = false }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
      } ${checked ? "bg-orange-500" : "bg-slate-600"}`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// ── Row: label + description + toggle ────────────────────────────────────────
interface ToggleRowProps {
  darkMode: boolean;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}
export function ToggleRow({
  darkMode,
  label,
  description,
  checked,
  onChange,
  disabled,
}: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className={`text-xs font-semibold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
          {label}
        </p>
        {description && (
          <p className={`text-[11px] mt-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
            {description}
          </p>
        )}
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

// ── Save / cancel button row ──────────────────────────────────────────────────
import { Save, Check } from "lucide-react";

interface SaveBarProps {
  darkMode: boolean;
  saved: boolean;
  onSave: () => void;
  onCancel?: () => void;
}
export function SaveBar({ darkMode, saved, onSave, onCancel }: SaveBarProps) {
  return (
    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
            darkMode
              ? "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
              : "bg-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-200 border border-slate-200"
          }`}
        >
          Cancel
        </button>
      )}
      <button
        type="button"
        onClick={onSave}
        className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
          saved
            ? "bg-emerald-500 text-white"
            : "bg-gradient-to-r from-orange-600 to-amber-500 text-white hover:from-orange-500 hover:to-amber-400 shadow-md shadow-orange-500/20"
        }`}
      >
        {saved ? (
          <>
            <Check size={14} />
            Saved!
          </>
        ) : (
          <>
            <Save size={14} />
            Save Changes
          </>
        )}
      </button>
    </div>
  );
}