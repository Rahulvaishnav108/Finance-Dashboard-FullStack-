// src/features/superAdmin/components/Settings/NotificationSettings.tsx
import { useState } from "react";
import { Mail, Bell, Smartphone,} from "lucide-react";
import { Card, CardTitle, Field, Input, ToggleRow, SaveBar, Divider } from "./Settingsui";

interface NotificationSettingsProps {
  darkMode: boolean;
}

export default function NotificationSettings({ darkMode }: NotificationSettingsProps) {
  const [email, setEmail] = useState({
    address: "souvik@hq.io",
    newRestaurant: true,
    subscriptionChange: true,
    paymentFailed: true,
    alertEscalation: true,
    weeklyDigest: false,
    marketingUpdates: false,
  });

  const [push, setPush] = useState({
    enabled: true,
    criticalAlerts: true,
    restaurantUpdates: false,
    systemHealth: true,
  });

  const [inApp, setInApp] = useState({
    sound: true,
    badge: true,
    desktopPopup: false,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-5">
      {/* Email Notifications */}
      <Card darkMode={darkMode}>
        <CardTitle darkMode={darkMode}>Email Notifications</CardTitle>

        <Field label="Notification Email" icon={Mail} darkMode={darkMode} hint="All system emails are sent to this address.">
          <Input
            darkMode={darkMode}
            type="email"
            value={email.address}
            onChange={(e) => setEmail({ ...email, address: e.target.value })}
            placeholder="admin@example.com"
          />
        </Field>

        <Divider darkMode={darkMode} />

        <div className="space-y-4">
          <ToggleRow darkMode={darkMode} label="New Restaurant Onboarded" description="Notify when a restaurant successfully completes onboarding." checked={email.newRestaurant} onChange={(v) => setEmail({ ...email, newRestaurant: v })} />
          <ToggleRow darkMode={darkMode} label="Subscription Changes" description="Plan upgrades, downgrades, and cancellations." checked={email.subscriptionChange} onChange={(v) => setEmail({ ...email, subscriptionChange: v })} />
          <ToggleRow darkMode={darkMode} label="Payment Failures" description="Alert when a restaurant's payment fails or is disputed." checked={email.paymentFailed} onChange={(v) => setEmail({ ...email, paymentFailed: v })} />
          <ToggleRow darkMode={darkMode} label="Alert Escalations" description="System-generated critical alerts escalated to admin." checked={email.alertEscalation} onChange={(v) => setEmail({ ...email, alertEscalation: v })} />
          <ToggleRow darkMode={darkMode} label="Weekly Digest" description="A summary of platform activity every Monday at 9 AM." checked={email.weeklyDigest} onChange={(v) => setEmail({ ...email, weeklyDigest: v })} />
          <ToggleRow darkMode={darkMode} label="Marketing & Product Updates" description="Anthropic product updates and feature announcements." checked={email.marketingUpdates} onChange={(v) => setEmail({ ...email, marketingUpdates: v })} />
        </div>
      </Card>

      {/* Push Notifications */}
      <Card darkMode={darkMode}>
        <div className="flex items-center justify-between">
          <CardTitle darkMode={darkMode}>Push Notifications</CardTitle>
          <div className="flex items-center gap-2">
            <Smartphone size={13} className="text-orange-400" />
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
              Browser / Mobile
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <ToggleRow
            darkMode={darkMode}
            label="Enable Push Notifications"
            description="Master toggle for all browser and mobile push alerts."
            checked={push.enabled}
            onChange={(v) => setPush({ ...push, enabled: v })}
          />
          <ToggleRow
            darkMode={darkMode}
            label="Critical System Alerts"
            description="Downtime, security breaches, or critical failures."
            checked={push.criticalAlerts}
            onChange={(v) => setPush({ ...push, criticalAlerts: v })}
            disabled={!push.enabled}
          />
          <ToggleRow
            darkMode={darkMode}
            label="Restaurant Status Updates"
            description="When restaurants go live, pause, or get suspended."
            checked={push.restaurantUpdates}
            onChange={(v) => setPush({ ...push, restaurantUpdates: v })}
            disabled={!push.enabled}
          />
          <ToggleRow
            darkMode={darkMode}
            label="System Health Checks"
            description="Periodic platform health status notifications."
            checked={push.systemHealth}
            onChange={(v) => setPush({ ...push, systemHealth: v })}
            disabled={!push.enabled}
          />
        </div>
      </Card>

      {/* In-App Preferences */}
      <Card darkMode={darkMode}>
        <div className="flex items-center justify-between">
          <CardTitle darkMode={darkMode}>In-App Preferences</CardTitle>
          <Bell size={14} className="text-orange-400" />
        </div>

        <div className="space-y-4">
          <ToggleRow
            darkMode={darkMode}
            label="Sound Alerts"
            description="Play a sound when a new notification arrives."
            checked={inApp.sound}
            onChange={(v) => setInApp({ ...inApp, sound: v })}
          />
          <ToggleRow
            darkMode={darkMode}
            label="Badge Counter"
            description="Show unread count on the notification bell icon."
            checked={inApp.badge}
            onChange={(v) => setInApp({ ...inApp, badge: v })}
          />
          <ToggleRow
            darkMode={darkMode}
            label="Desktop Pop-ups"
            description="Show a pop-up in the bottom-right corner on new events."
            checked={inApp.desktopPopup}
            onChange={(v) => setInApp({ ...inApp, desktopPopup: v })}
          />
        </div>

        <SaveBar darkMode={darkMode} saved={saved} onSave={handleSave} />
      </Card>
    </div>
  );
}