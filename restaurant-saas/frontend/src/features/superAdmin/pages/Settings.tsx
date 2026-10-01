import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import SettingsHeader from "../components/Settings/Settingsheader";
import SettingsTabs, { SettingsTab } from "../components/Settings/Settingstabs";
import GeneralSettings from "../components/Settings/Generalsettings";
import NotificationSettings from "../components/Settings/Notificationsettings";
import SecuritySettings from "../components/Settings/Securitysettings";

// ─── Inline components used in the panels ───────────────────────────────────
import {
  Plug,
  Sun,
  Moon,
  Minus,
  AlignJustify,
  ExternalLink,
  Trash2,
  AlertOctagon,
  Download,
  RefreshCcw,
} from "lucide-react";
import { Card, CardTitle, ToggleRow, SaveBar, Divider } from "../components/Settings/Settingsui";

// ─── Appearance Panel ────────────────────────────────────────────────────────
function AppearanceSettings({
  darkMode,
  themePreference,
  setThemePreference,
}: {
  darkMode: boolean;
  themePreference: "dark" | "light" | "system";
  setThemePreference: (pref: "dark" | "light" | "system") => void;
}) {
  const [density, setDensity] = useState<"compact" | "comfortable" | "spacious">("comfortable");
  const [accent, setAccent] = useState<"orange" | "blue" | "violet" | "emerald">("orange");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const ACCENTS = [
    { id: "orange", label: "Orange", color: "bg-orange-500" },
    { id: "blue", label: "Blue", color: "bg-blue-500" },
    { id: "violet", label: "Violet", color: "bg-violet-500" },
    { id: "emerald", label: "Emerald", color: "bg-emerald-500" },
  ] as const;

  return (
    <div className="space-y-5">
      <Card darkMode={darkMode}>
        <CardTitle darkMode={darkMode}>Color Theme</CardTitle>
        <div className="grid grid-cols-3 gap-3">
          {(["dark", "light", "system"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setThemePreference(t)}
              className={`flex flex-col items-center gap-2 px-4 py-4 rounded-xl border text-xs font-semibold transition-all capitalize ${
                themePreference === t
                  ? "border-orange-500/60 bg-orange-500/10 text-orange-400"
                  : darkMode
                  ? "border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800"
              }`}
            >
              {t === "dark" ? <Moon size={18} /> : t === "light" ? <Sun size={18} /> : <Minus size={18} />}
              {t === "system" ? "System" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </Card>

      <Card darkMode={darkMode}>
        <CardTitle darkMode={darkMode}>Accent Color</CardTitle>
        <div className="flex flex-wrap gap-3">
          {ACCENTS.map(({ id, label, color }) => (
            <button
              key={id}
              onClick={() => setAccent(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                accent === id
                  ? darkMode
                    ? "border-slate-500 bg-slate-800 text-slate-100"
                    : "border-slate-400 bg-slate-100 text-slate-800"
                  : darkMode
                  ? "border-slate-800 text-slate-400 hover:border-slate-700"
                  : "border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              <span className={`w-3 h-3 rounded-full ${color}`} />
              {label}
            </button>
          ))}
        </div>
      </Card>

      <Card darkMode={darkMode}>
        <CardTitle darkMode={darkMode}>Layout & Density</CardTitle>
        <div className="grid grid-cols-3 gap-3">
          {(["compact", "comfortable", "spacious"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDensity(d)}
              className={`flex flex-col items-center gap-1.5 px-3 py-3.5 rounded-xl border text-xs font-semibold transition-all capitalize ${
                density === d
                  ? "border-orange-500/60 bg-orange-500/10 text-orange-400"
                  : darkMode
                  ? "border-slate-800 text-slate-400 hover:border-slate-700"
                  : "border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              <AlignJustify size={14} />
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
        <Divider darkMode={darkMode} />
        <div className="space-y-4">
          <ToggleRow
            darkMode={darkMode}
            label="Collapse Sidebar by Default"
            description="Start with a compact icon-only sidebar on every load."
            checked={sidebarCollapsed}
            onChange={setSidebarCollapsed}
          />
          <ToggleRow
            darkMode={darkMode}
            label="Enable UI Animations"
            description="Smooth transitions and micro-interactions across the interface."
            checked={animationsEnabled}
            onChange={setAnimationsEnabled}
          />
        </div>
        <SaveBar darkMode={darkMode} saved={saved} onSave={handleSave} />
      </Card>
    </div>
  );
}

// ─── Billing Panel ───────────────────────────────────────────────────────────
function BillingSettings({ darkMode }: { darkMode: boolean }) {
  const INVOICES = [
    { id: "INV-2026-06", date: "Jun 1, 2026", amount: "₹4,999", status: "Paid" },
    { id: "INV-2026-05", date: "May 1, 2026", amount: "₹4,999", status: "Paid" },
    { id: "INV-2026-04", date: "Apr 1, 2026", amount: "₹4,999", status: "Paid" },
    { id: "INV-2026-03", date: "Mar 1, 2026", amount: "₹2,499", status: "Paid" },
  ];

  return (
    <div className="space-y-5">
      <Card darkMode={darkMode}>
        <CardTitle darkMode={darkMode}>Current Plan</CardTitle>
        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl border ${darkMode ? "border-orange-500/20 bg-orange-500/5" : "border-orange-200 bg-orange-50"}`}>
          <div>
            <p className={`text-sm font-bold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>HQ Pro — Monthly</p>
            <p className={`text-xs mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Renews on Jul 1, 2026 · ₹4,999/month</p>
          </div>
          <div className="flex gap-2">
            <button className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${darkMode ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-300 text-slate-600 hover:bg-slate-100"}`}>
              Change Plan
            </button>
            <button className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-orange-600 to-amber-500 text-white hover:from-orange-500 hover:to-amber-400 shadow-md shadow-orange-500/20 transition-all">
              Upgrade
            </button>
          </div>
        </div>
      </Card>
      <Card darkMode={darkMode}>
        <CardTitle darkMode={darkMode}>Payment Method</CardTitle>
        <div className={`flex items-center justify-between p-4 rounded-xl border ${darkMode ? "border-slate-800 bg-slate-900/40" : "border-slate-200 bg-slate-50"}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-7 rounded-md flex items-center justify-center text-[10px] font-black ${darkMode ? "bg-slate-800 text-slate-300" : "bg-slate-200 text-slate-600"}`}>VISA</div>
            <div>
              <p className={`text-xs font-semibold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>Visa ending in 4242</p>
              <p className={`text-[11px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Expires 08/2028</p>
            </div>
          </div>
          <button className={`text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1`}>
            <ExternalLink size={11} /> Update
          </button>
        </div>
      </Card>
      <Card darkMode={darkMode}>
        <div className="flex items-center justify-between">
          <CardTitle darkMode={darkMode}>Invoice History</CardTitle>
          <button className={`text-[11px] font-semibold flex items-center gap-1 ${darkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-800"}`}>
            <Download size={11} /> Export All
          </button>
        </div>
        <div className="space-y-2">
          {INVOICES.map((inv) => (
            <div key={inv.id} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${darkMode ? "border-slate-800 bg-slate-900/40" : "border-slate-200 bg-slate-50"}`}>
              <div>
                <p className={`text-xs font-semibold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>{inv.id}</p>
                <p className={`text-[11px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>{inv.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>{inv.amount}</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  {inv.status}
                </span>
                <button className={`text-[11px] font-semibold flex items-center gap-1 ${darkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"}`}>
                  <Download size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Integrations Panel ──────────────────────────────────────────────────────
function IntegrationsSettings({ darkMode }: { darkMode: boolean }) {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  const INTEGRATIONS = [
    { name: "Razorpay", description: "Payment gateway for subscription billing.", connected: true, color: "text-blue-400" },
    { name: "Twilio", description: "SMS and WhatsApp OTP delivery.", connected: false, color: "text-red-400" },
    { name: "SendGrid", description: "Transactional email delivery.", connected: true, color: "text-teal-400" },
    { name: "Slack", description: "Real-time alerts to your Slack workspace.", connected: false, color: "text-yellow-400" },
  ];

  const copyApiKey = () => {
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <Card darkMode={darkMode}>
        <CardTitle darkMode={darkMode}>API Key</CardTitle>
        <div className={`flex items-center gap-2 p-3 rounded-xl border font-mono text-xs ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-slate-50"}`}>
          <span className={`flex-1 truncate ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            hq_live_sk_••••••••••••••••••••••••••••••••
          </span>
          <button
            onClick={copyApiKey}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
              apiKeyCopied
                ? "bg-emerald-500/10 text-emerald-400"
                : darkMode
                ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                : "bg-slate-200 text-slate-600 hover:bg-slate-300"
            }`}
          >
            {apiKeyCopied ? "Copied!" : "Copy"}
          </button>
          <button className={`shrink-0 p-1.5 rounded-lg transition-colors ${darkMode ? "text-slate-500 hover:text-slate-300 hover:bg-slate-800" : "text-slate-400 hover:text-slate-600 hover:bg-slate-200"}`} title="Regenerate">
            <RefreshCcw size={12} />
          </button>
        </div>
        <p className={`text-[11px] ${darkMode ? "text-slate-600" : "text-slate-400"}`}>
          Keep this key secret. Rotate it immediately if compromised.
        </p>
      </Card>
      <Card darkMode={darkMode}>
        <CardTitle darkMode={darkMode}>Connected Services</CardTitle>
        <div className="space-y-3">
          {INTEGRATIONS.map((svc) => (
            <div
              key={svc.name}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border ${darkMode ? "border-slate-800 bg-slate-900/40" : "border-slate-200 bg-slate-50"}`}
            >
              <div>
                <p className={`text-xs font-bold ${svc.color}`}>{svc.name}</p>
                <p className={`text-[11px] mt-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>{svc.description}</p>
              </div>
              <button
                className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                  svc.connected
                    ? darkMode
                      ? "border-slate-700 text-slate-400 hover:border-red-500/40 hover:text-red-400"
                      : "border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-500"
                    : "border-orange-500/40 text-orange-400 hover:bg-orange-500/10"
                }`}
              >
                {svc.connected ? "Disconnect" : "Connect"}
              </button>
            </div>
          ))}
        </div>
      </Card>
      <Card darkMode={darkMode}>
        <CardTitle darkMode={darkMode}>Webhook Endpoint</CardTitle>
        <div className="space-y-1.5">
          <label
            htmlFor="webhook-url"
            className={`text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
          >
            <Plug size={11} className="text-orange-400" /> Endpoint URL
          </label>
          <input
            id="webhook-url"
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://your-server.com/webhooks/hq"
            className={`w-full h-10 px-3.5 rounded-xl text-xs font-medium outline-none border transition-all duration-200 ${darkMode ? "bg-slate-900 border-slate-800 text-slate-100 focus:border-orange-500/60 placeholder:text-slate-600" : "bg-slate-50 border-slate-200 text-slate-800 focus:border-orange-400 focus:bg-white placeholder:text-slate-400"}`}
          />
          <p className={`text-[11px] ${darkMode ? "text-slate-600" : "text-slate-400"}`}>
            Receives POST events for restaurant lifecycle, payments, and system alerts.
          </p>
        </div>
        <SaveBar darkMode={darkMode} saved={false} onSave={() => {}} />
      </Card>
    </div>
  );
}

// ─── Danger Zone Panel ───────────────────────────────────────────────────────
function DangerZoneSettings({ darkMode }: { darkMode: boolean }) {
  const [confirmText, setConfirmText] = useState("");
  const CONFIRM_PHRASE = "DELETE PLATFORM";

  const ACTIONS = [
    { title: "Purge All Analytics Data", description: "Permanently removes all event tracking and analytics history.", label: "Purge Analytics", severity: "medium" },
    { title: "Reset All Restaurant Configurations", description: "Resets every restaurant's settings to factory defaults.", label: "Reset Configurations", severity: "medium" },
    { title: "Revoke All Active Sessions", description: "Signs out every admin and restaurant user across all devices.", label: "Revoke All Sessions", severity: "high" },
  ];

  return (
    <div className="space-y-5">
      <Card darkMode={darkMode}>
        <div className="flex items-center gap-2 mb-1">
          <CardTitle darkMode={darkMode}>Destructive Actions</CardTitle>
        </div>
        <div className="space-y-3">
          {ACTIONS.map((action) => (
            <div
              key={action.title}
              className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-4 rounded-xl border ${darkMode ? "border-red-500/15 bg-red-500/5" : "border-red-100 bg-red-50"}`}
            >
              <div>
                <p className={`text-xs font-bold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>{action.title}</p>
                <p className={`text-[11px] mt-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>{action.description}</p>
              </div>
              <button
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  darkMode
                    ? "border-red-500/30 text-red-400/80 hover:bg-red-500/15 hover:text-red-400"
                    : "border-red-200 text-red-500/70 hover:bg-red-100 hover:text-red-600"
                }`}
              >
                {action.label}
              </button>
            </div>
          ))}
        </div>
      </Card>
      <Card darkMode={darkMode} className={`border ${darkMode ? "!border-red-500/30" : "!border-red-200"}`}>
        <div className="flex items-center gap-2">
          <AlertOctagon size={14} className="text-red-400 shrink-0" />
          <CardTitle darkMode={darkMode}>Delete Platform</CardTitle>
        </div>
        <div className={`p-4 rounded-xl text-xs leading-relaxed ${darkMode ? "bg-red-500/5 text-red-300/70 border border-red-500/15" : "bg-red-50 text-red-600/70 border border-red-100"}`}>
          This will <strong>permanently destroy</strong> all data. This action cannot be reversed.
        </div>
        <div className="space-y-1.5">
          <p className={`text-[11px] font-semibold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            Type <span className={`font-mono font-bold ${darkMode ? "text-red-400" : "text-red-600"}`}>{CONFIRM_PHRASE}</span> to confirm
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={CONFIRM_PHRASE}
            className={`w-full h-10 px-3.5 rounded-xl text-xs font-mono outline-none border transition-all duration-200 ${darkMode ? "bg-slate-900 border-slate-800 text-red-300 focus:border-red-500/60 placeholder:text-slate-700" : "bg-white border-slate-200 text-red-600 focus:border-red-400 placeholder:text-slate-300"}`}
          />
        </div>
        <button
          disabled={confirmText !== CONFIRM_PHRASE}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all ${
            confirmText === CONFIRM_PHRASE
              ? "bg-red-600 text-white border-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20"
              : darkMode
              ? "border-slate-800 text-slate-700 cursor-not-allowed"
              : "border-slate-200 text-slate-300 cursor-not-allowed"
          }`}
        >
          <Trash2 size={13} />
          Permanently Delete Platform
        </button>
      </Card>
    </div>
  );
}

interface OutletContext {
  darkMode: boolean;
  themePreference: "dark" | "light" | "system";
  setThemePreference: (pref: "dark" | "light" | "system") => void;
}

export default function Settings() {
  const { darkMode, themePreference, setThemePreference } = useOutletContext<OutletContext>();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  const renderPanel = () => {
    switch (activeTab) {
      case "general":       return <GeneralSettings darkMode={darkMode} />;
      case "notifications": return <NotificationSettings darkMode={darkMode} />;
      case "security":      return <SecuritySettings darkMode={darkMode} />;
      case "appearance":    return <AppearanceSettings darkMode={darkMode} themePreference={themePreference} setThemePreference={setThemePreference} />;
      case "billing":       return <BillingSettings darkMode={darkMode} />;
      case "integrations":  return <IntegrationsSettings darkMode={darkMode} />;
      case "danger":        return <DangerZoneSettings darkMode={darkMode} />;
      default:              return null;
    }
  };

  return (
    <div className={`px-4 sm:px-6 lg:px-8 py-6 min-h-full ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
      <SettingsHeader darkMode={darkMode} activeTab={activeTab} />
      <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-start">
        <SettingsTabs darkMode={darkMode} active={activeTab} onChange={setActiveTab} />
        <div className="flex-1 min-w-0 w-full">
          {renderPanel()}
        </div>
      </div>
    </div>
  );
}