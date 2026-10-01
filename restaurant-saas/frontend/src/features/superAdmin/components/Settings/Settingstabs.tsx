// src/features/superAdmin/components/Settings/SettingsTabs.tsx
import {
  Globe,
  Bell,
  ShieldCheck,
  Palette,
  CreditCard,
  Plug,
  TriangleAlert,
} from "lucide-react";

export type SettingsTab =
  | "general"
  | "notifications"
  | "security"
  | "appearance"
  | "billing"
  | "integrations"
  | "danger";

interface Tab {
  id: SettingsTab;
  label: string;
  icon: React.ElementType;
  danger?: boolean;
}

const TABS: Tab[] = [
  { id: "general", label: "General", icon: Globe },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "danger", label: "Danger Zone", icon: TriangleAlert, danger: true },
];

interface SettingsTabsProps {
  darkMode: boolean;
  active: SettingsTab;
  onChange: (tab: SettingsTab) => void;
}

export default function SettingsTabs({ darkMode, active, onChange }: SettingsTabsProps) {
  return (
    <nav
      className={`rounded-2xl border p-2 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible shrink-0 lg:w-52 ${
        darkMode ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"
      }`}
    >
      {TABS.map(({ id, label, icon: Icon, danger }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
              isActive
                ? danger
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : "bg-orange-600 text-white shadow-md shadow-orange-600/10"
                : danger
                ? darkMode
                  ? "text-red-400/70 hover:bg-red-500/10 hover:text-red-400"
                  : "text-red-500/70 hover:bg-red-50 hover:text-red-500"
                : darkMode
                ? "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Icon size={14} className="shrink-0" />
            <span className="hidden sm:inline lg:inline">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}