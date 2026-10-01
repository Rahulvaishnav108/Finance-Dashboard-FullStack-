// src/features/superAdmin/components/Settings/SettingsHeader.tsx
import { Settings } from "lucide-react";

interface SettingsHeaderProps {
  darkMode: boolean;
  activeTab: string;
}

const TAB_SUBTITLES: Record<string, string> = {
  general: "Platform name, timezone, language, and regional defaults.",
  notifications: "Control where and how you receive system alerts.",
  security: "Password policy, two-factor auth, and session controls.",
  appearance: "Theme, density, and accent color preferences.",
  billing: "Subscription plan, payment method, and invoice history.",
  integrations: "Connected services, API keys, and webhook endpoints.",
  danger: "Irreversible actions — handle with care.",
};

export default function SettingsHeader({ darkMode, activeTab }: SettingsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
              darkMode
                ? "text-orange-400 bg-orange-500/10 border-orange-500/20"
                : "text-orange-600 bg-orange-50 border-orange-200"
            }`}
          >
            <Settings size={9} />
            Settings
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight capitalize">
          {activeTab === "danger" ? "Danger Zone" : activeTab}
        </h2>
        <p
          className={`mt-1 text-xs sm:text-sm ${
            darkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {TAB_SUBTITLES[activeTab] ?? "Manage your platform settings."}
        </p>
      </div>
    </div>
  );
}