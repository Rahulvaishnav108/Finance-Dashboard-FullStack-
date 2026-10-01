// src/features/superAdmin/components/Settings/SecuritySettings.tsx
import { useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  MonitorSmartphone,
  AlertCircle,
  Trash2,
  Clock,
  KeyRound,
} from "lucide-react";
import {
  Card,
  CardTitle,
  Field,
  Input,
  Select,
  SaveBar,
  ToggleRow,
  Divider,
} from "./Settingsui";

interface SecuritySettingsProps {
  darkMode: boolean;
}

const SESSIONS = [
  { id: 1, device: "Chrome on Windows", location: "Kolkata, IN", time: "Active now", current: true },
  { id: 2, device: "Safari on iPhone 15", location: "Kolkata, IN", time: "2 hours ago", current: false },
  { id: 3, device: "Firefox on macOS", location: "Mumbai, IN", time: "Yesterday, 3:14 PM", current: false },
];

export default function SecuritySettings({ darkMode }: SecuritySettingsProps) {
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);

  const [twoFA, setTwoFA] = useState({ enabled: false, method: "authenticator" });
  const [policy, setPolicy] = useState({
    minLength: "8",
    requireUppercase: true,
    requireNumbers: true,
    requireSymbols: false,
    sessionTimeout: "60",
    ipWhitelist: false,
    loginAttempts: "5",
  });

  const [policySaved, setPolicySaved] = useState(false);
  const [sessions, setSessions] = useState(SESSIONS);

  const handleChangePw = () => {
    setPwError("");
    if (!passwords.current) { setPwError("Enter your current password."); return; }
    if (passwords.next.length < 8) { setPwError("New password must be at least 8 characters."); return; }
    if (passwords.next !== passwords.confirm) { setPwError("Passwords don't match."); return; }
    setPwSaved(true);
    setPasswords({ current: "", next: "", confirm: "" });
    setTimeout(() => setPwSaved(false), 2500);
  };

  const handlePolicySave = () => {
    setPolicySaved(true);
    setTimeout(() => setPolicySaved(false), 2500);
  };

  const revokeSession = (id: number) =>
    setSessions((s) => s.filter((sess) => sess.id !== id));

  const pwStrength =
    passwords.next.length >= 12 ? 4
    : passwords.next.length >= 10 ? 3
    : passwords.next.length >= 8 ? 2
    : passwords.next.length > 0 ? 1 : 0;

  const strengthLabel = ["", "Too short", "Moderate", "Good", "Strong"][pwStrength];
  const strengthColor = ["", "text-red-400", "text-amber-400", "text-orange-400", "text-emerald-500"][pwStrength];
  const barColor = ["", "bg-red-400", "bg-amber-400", "bg-orange-400", "bg-emerald-500"][pwStrength];

  return (
    <div className="space-y-5">
      {/* Change Password */}
      <Card darkMode={darkMode}>
        <CardTitle darkMode={darkMode}>Change Password</CardTitle>

        <Field label="Current Password" icon={Lock} darkMode={darkMode}>
          <div className="relative">
            <Input darkMode={darkMode} type={showPw.current ? "text" : "password"} value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} placeholder="Enter current password" className="pr-10" />
            <button type="button" onClick={() => setShowPw((p) => ({ ...p, current: !p.current }))} className={`absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}>
              {showPw.current ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="New Password" icon={Lock} darkMode={darkMode}>
            <div className="relative">
              <Input darkMode={darkMode} type={showPw.next ? "text" : "password"} value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} placeholder="Min 8 characters" className="pr-10" />
              <button type="button" onClick={() => setShowPw((p) => ({ ...p, next: !p.next }))} className={`absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}>
                {showPw.next ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </Field>
          <Field label="Confirm Password" icon={Lock} darkMode={darkMode}>
            <div className="relative">
              <Input darkMode={darkMode} type={showPw.confirm ? "text" : "password"} value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} placeholder="Repeat new password" className="pr-10" onPaste={(e) => e.preventDefault()} onDrop={(e) => e.preventDefault()} autoComplete="new-password" />
              <button type="button" onClick={() => setShowPw((p) => ({ ...p, confirm: !p.confirm }))} className={`absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}>
                {showPw.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <p className={`text-[10px] mt-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Please re-enter your password manually.</p>
          </Field>
        </div>

        {passwords.next && (
          <div className="space-y-1.5">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div key={level} className={`h-1 flex-1 rounded-full transition-colors ${level <= pwStrength ? barColor : darkMode ? "bg-slate-800" : "bg-slate-200"}`} />
              ))}
            </div>
            <p className={`text-[10px] font-medium ${strengthColor}`}>{strengthLabel}</p>
          </div>
        )}

        {pwError && (
          <div className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertCircle size={13} className="shrink-0" />
            {pwError}
          </div>
        )}

        <SaveBar darkMode={darkMode} saved={pwSaved} onSave={handleChangePw} />
      </Card>

      {/* Two-Factor Authentication */}
      <Card darkMode={darkMode}>
        <div className="flex items-center justify-between mb-1">
          <CardTitle darkMode={darkMode}>Two-Factor Authentication</CardTitle>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${twoFA.enabled ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : darkMode ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400"}`}>
            {twoFA.enabled ? "Enabled" : "Disabled"}
          </span>
        </div>

        <ToggleRow
          darkMode={darkMode}
          label="Enable 2FA"
          description="Add a second layer of security to your admin account."
          checked={twoFA.enabled}
          onChange={(v) => setTwoFA({ ...twoFA, enabled: v })}
        />

        {twoFA.enabled && (
          <Field label="2FA Method" icon={ShieldCheck} darkMode={darkMode}>
            <Select
              darkMode={darkMode}
              value={twoFA.method}
              onChange={(e) => setTwoFA({ ...twoFA, method: e.target.value })}
            >
              <option value="authenticator">Authenticator App (TOTP)</option>
              <option value="sms">SMS Code</option>
              <option value="email">Email OTP</option>
            </Select>
          </Field>
        )}

        {twoFA.enabled && (
          <div className={`rounded-xl p-3.5 text-xs flex items-start gap-2.5 ${darkMode ? "bg-slate-900 text-slate-400 border border-slate-800" : "bg-slate-50 text-slate-500 border border-slate-200"}`}>
            <KeyRound size={13} className="text-orange-400 mt-0.5 shrink-0" />
            <span>Scan the QR code in your authenticator app to complete setup. Recovery codes will be shown once.</span>
          </div>
        )}
      </Card>

      {/* Password Policy */}
      <Card darkMode={darkMode}>
        <CardTitle darkMode={darkMode}>Password Policy</CardTitle>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Minimum Length" icon={Lock} darkMode={darkMode}>
            <Select darkMode={darkMode} value={policy.minLength} onChange={(e) => setPolicy({ ...policy, minLength: e.target.value })}>
              <option value="6">6 characters</option>
              <option value="8">8 characters (recommended)</option>
              <option value="10">10 characters</option>
              <option value="12">12 characters</option>
            </Select>
          </Field>
          <Field label="Max Login Attempts" icon={AlertCircle} darkMode={darkMode}>
            <Select darkMode={darkMode} value={policy.loginAttempts} onChange={(e) => setPolicy({ ...policy, loginAttempts: e.target.value })}>
              <option value="3">3 attempts</option>
              <option value="5">5 attempts</option>
              <option value="10">10 attempts</option>
            </Select>
          </Field>
          <Field label="Session Timeout" icon={Clock} darkMode={darkMode} hint="Idle sessions are ended after this duration.">
            <Select darkMode={darkMode} value={policy.sessionTimeout} onChange={(e) => setPolicy({ ...policy, sessionTimeout: e.target.value })}>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="240">4 hours</option>
              <option value="480">8 hours</option>
            </Select>
          </Field>
        </div>

        <Divider darkMode={darkMode} />

        <div className="space-y-3">
          <ToggleRow darkMode={darkMode} label="Require Uppercase Letters" description="Passwords must contain at least one uppercase character." checked={policy.requireUppercase} onChange={(v) => setPolicy({ ...policy, requireUppercase: v })} />
          <ToggleRow darkMode={darkMode} label="Require Numbers" description="Passwords must contain at least one numeric digit." checked={policy.requireNumbers} onChange={(v) => setPolicy({ ...policy, requireNumbers: v })} />
          <ToggleRow darkMode={darkMode} label="Require Special Characters" description="Passwords must include symbols like !, @, #, $." checked={policy.requireSymbols} onChange={(v) => setPolicy({ ...policy, requireSymbols: v })} />
          <ToggleRow darkMode={darkMode} label="IP Whitelist Mode" description="Only allow logins from pre-approved IP addresses." checked={policy.ipWhitelist} onChange={(v) => setPolicy({ ...policy, ipWhitelist: v })} />
        </div>

        <SaveBar darkMode={darkMode} saved={policySaved} onSave={handlePolicySave} />
      </Card>

      {/* Active Sessions */}
      <Card darkMode={darkMode}>
        <div className="flex items-center justify-between">
          <CardTitle darkMode={darkMode}>Active Sessions</CardTitle>
          <MonitorSmartphone size={14} className="text-orange-400" />
        </div>

        <div className="space-y-3">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className={`flex items-center justify-between rounded-xl px-4 py-3 border ${
                sess.current
                  ? darkMode ? "border-orange-500/20 bg-orange-500/5" : "border-orange-200 bg-orange-50"
                  : darkMode ? "border-slate-800 bg-slate-900/40" : "border-slate-200 bg-slate-50"
              }`}
            >
              <div>
                <p className={`text-xs font-semibold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                  {sess.device}
                  {sess.current && (
                    <span className="ml-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">This Device</span>
                  )}
                </p>
                <p className={`text-[11px] mt-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                  {sess.location} · {sess.time}
                </p>
              </div>
              {!sess.current && (
                <button
                  onClick={() => revokeSession(sess.id)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    darkMode
                      ? "text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                      : "text-red-400 hover:text-red-600 hover:bg-red-50"
                  }`}
                  title="Revoke session"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>

        {sessions.filter((s) => !s.current).length > 0 && (
          <button
            onClick={() => setSessions((s) => s.filter((sess) => sess.current))}
            className={`w-full mt-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              darkMode
                ? "border-red-500/20 text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
                : "border-red-200 text-red-400 hover:text-red-600 hover:bg-red-50"
            }`}
          >
            Revoke All Other Sessions
          </button>
        )}
      </Card>
    </div>
  );
}