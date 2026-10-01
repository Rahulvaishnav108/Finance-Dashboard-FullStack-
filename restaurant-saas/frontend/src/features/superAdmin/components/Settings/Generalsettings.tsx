// src/features/superAdmin/components/Settings/GeneralSettings.tsx
import { useState } from "react";
import { Globe, Building2, Clock, Languages, CalendarDays } from "lucide-react";
import { Card, CardTitle, Field, Input, Select, SaveBar, ToggleRow } from "./Settingsui";

interface GeneralSettingsProps {
  darkMode: boolean;
}

export default function GeneralSettings({ darkMode }: GeneralSettingsProps) {
  const [form, setForm] = useState({
    platformName: "HQ Terminal",
    supportEmail: "support@hqterminal.io",
    timezone: "Asia/Kolkata",
    language: "en",
    dateFormat: "DD/MM/YYYY",
    currency: "INR",
    maintenanceMode: false,
    allowRegistration: true,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const set = (key: keyof typeof form, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="space-y-5">
      {/* Platform Identity */}
      <Card darkMode={darkMode}>
        <CardTitle darkMode={darkMode}>Platform Identity</CardTitle>

        <Field label="Platform Name" icon={Building2} darkMode={darkMode} hint="Shown in the browser tab, emails, and notifications.">
          <Input
            darkMode={darkMode}
            value={form.platformName}
            onChange={(e) => set("platformName", e.target.value)}
            placeholder="e.g. HQ Terminal"
          />
        </Field>

        <Field label="Support Email" icon={Globe} darkMode={darkMode} hint="Customers receive automated emails from this address.">
          <Input
            darkMode={darkMode}
            type="email"
            value={form.supportEmail}
            onChange={(e) => set("supportEmail", e.target.value)}
            placeholder="support@yourplatform.io"
          />
        </Field>
      </Card>

      {/* Regional Settings */}
      <Card darkMode={darkMode}>
        <CardTitle darkMode={darkMode}>Regional Settings</CardTitle>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Timezone" icon={Clock} darkMode={darkMode}>
            <Select
              darkMode={darkMode}
              value={form.timezone}
              onChange={(e) => set("timezone", e.target.value)}
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST, UTC+5:30)</option>
              <option value="Asia/Dhaka">Asia/Dhaka (BDT, UTC+6)</option>
              <option value="America/New_York">America/New_York (ET, UTC-5)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (PT, UTC-8)</option>
              <option value="Europe/London">Europe/London (GMT, UTC+0)</option>
              <option value="Europe/Paris">Europe/Paris (CET, UTC+1)</option>
              <option value="Asia/Singapore">Asia/Singapore (SGT, UTC+8)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (JST, UTC+9)</option>
              <option value="Australia/Sydney">Australia/Sydney (AEDT, UTC+11)</option>
            </Select>
          </Field>

          <Field label="Language" icon={Languages} darkMode={darkMode}>
            <Select
              darkMode={darkMode}
              value={form.language}
              onChange={(e) => set("language", e.target.value)}
            >
              <option value="en">English</option>
              <option value="bn">Bengali</option>
              <option value="hi">Hindi</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="es">Spanish</option>
              <option value="ja">Japanese</option>
            </Select>
          </Field>

          <Field label="Date Format" icon={CalendarDays} darkMode={darkMode}>
            <Select
              darkMode={darkMode}
              value={form.dateFormat}
              onChange={(e) => set("dateFormat", e.target.value)}
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</option>
              <option value="D MMM YYYY">D MMM YYYY (e.g. 15 Jun 2026)</option>
            </Select>
          </Field>

          <Field label="Default Currency" icon={Globe} darkMode={darkMode}>
            <Select
              darkMode={darkMode}
              value={form.currency}
              onChange={(e) => set("currency", e.target.value)}
            >
              <option value="INR">INR — Indian Rupee (₹)</option>
              <option value="USD">USD — US Dollar ($)</option>
              <option value="EUR">EUR — Euro (€)</option>
              <option value="GBP">GBP — British Pound (£)</option>
              <option value="BDT">BDT — Bangladeshi Taka (৳)</option>
              <option value="SGD">SGD — Singapore Dollar (S$)</option>
            </Select>
          </Field>
        </div>
      </Card>

      {/* Platform Controls */}
      <Card darkMode={darkMode}>
        <CardTitle darkMode={darkMode}>Platform Controls</CardTitle>

        <div className="space-y-4">
          <ToggleRow
            darkMode={darkMode}
            label="Maintenance Mode"
            description="Temporarily disables public access. Only admins can log in."
            checked={form.maintenanceMode}
            onChange={(v) => set("maintenanceMode", v)}
          />
          <ToggleRow
            darkMode={darkMode}
            label="Allow New Registrations"
            description="When off, no new restaurant accounts can be created."
            checked={form.allowRegistration}
            onChange={(v) => set("allowRegistration", v)}
          />
        </div>

        <SaveBar darkMode={darkMode} saved={saved} onSave={handleSave} />
      </Card>
    </div>
  );
}