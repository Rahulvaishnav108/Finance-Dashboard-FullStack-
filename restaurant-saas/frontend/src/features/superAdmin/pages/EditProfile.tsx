// src/features/superAdmin/pages/EditProfile.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  Save,
  Shield,
  Mail,
  Phone,
  MapPin,
  User,
  Lock,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
} from "lucide-react";

interface OutletContext {
  darkMode: boolean;
}

interface FieldProps {
  label: string;
  icon: React.ElementType;
  darkMode: boolean;
  children: React.ReactNode;
  hint?: string;
}

function Field({ label, icon: Icon, darkMode, children, hint }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <div
        className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider ${
          darkMode ? "text-slate-400" : "text-slate-500"
        }`}
      >
        <Icon size={11} className="text-orange-400" />
        {label}
      </div>
      {children}
      {hint && (
        <p
          className={`text-[11px] ${
            darkMode ? "text-slate-600" : "text-slate-400"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  darkMode: boolean;
}

function Input({ darkMode, className = "", ...props }: InputProps) {
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

export default function EditProfile() {
  const { darkMode } = useOutletContext<OutletContext>();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    firstName: "Souvik",
    lastName: "Dey",
    displayName: "Mr. Souvik",
    email: "souvik@hq.io",
    phone: "+91 98765 43210",
    location: "Kolkata, WB",
    bio: "Super Administrator managing the HQ Terminal platform.",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [showPw, setShowPw] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const [avatarUrl, setAvatarUrl] = useState(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80"
  );

  const [saved, setSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    return () => {
      if (avatarUrl.startsWith("blob:")) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [avatarUrl]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (avatarUrl.startsWith("blob:")) {
        URL.revokeObjectURL(avatarUrl);
      }
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (passwords.current || passwords.next || passwords.confirm) {
      if (!passwords.current) {
        setPwError("Enter your current password.");
        return;
      }
      if (passwords.next.length < 8) {
        setPwError("New password must be at least 8 characters.");
        return;
      }
      if (passwords.next !== passwords.confirm) {
        setPwError("Passwords don't match.");
        return;
      }
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const card = `rounded-2xl border p-5 sm:p-6 space-y-5 ${
    darkMode ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"
  }`;

  const sectionTitle = `text-xs font-bold uppercase tracking-wider mb-4 ${
    darkMode ? "text-slate-400" : "text-slate-500"
  }`;

  return (
    <div
      className={`min-h-full font-sans antialiased transition-colors duration-300 ${
        darkMode ? "text-slate-50" : "text-slate-900"
      }`}
    >
      <form
        onSubmit={handleSave}
        className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 max-w-4xl mx-auto"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              darkMode
                ? "bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                : "bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200"
            }`}
            aria-label="Go back"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Edit Profile
            </h2>
            <p
              className={`mt-0.5 text-xs sm:text-sm ${
                darkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Manage your personal information and account settings
            </p>
          </div>
        </div>

        <div className={card}>
          <p className={sectionTitle}>Profile Photo</p>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="relative shrink-0">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-orange-500/20"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-md transition-colors"
                aria-label="Change photo"
              >
                <Camera size={14} />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div className="text-center sm:text-left">
              <p className="font-bold text-base">
                {form.firstName} {form.lastName}
              </p>
              <div
                className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                  darkMode
                    ? "bg-orange-500/10 text-orange-400"
                    : "bg-orange-50 text-orange-600"
                }`}
              >
                <Shield size={10} />
                Global Admin · HQ Terminal
              </div>
              <p
                className={`mt-2 text-[11px] max-w-xs ${
                  darkMode ? "text-slate-500" : "text-slate-400"
                }`}
              >
                JPG, PNG or WEBP. Max size 2 MB. Square crop works best.
              </p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className={`mt-3 text-xs font-semibold px-4 py-2 rounded-xl transition-colors ${
                  darkMode
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Upload New Photo
              </button>
            </div>
          </div>
        </div>

        <div className={card}>
          <p className={sectionTitle}>Personal Information</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First Name" icon={User} darkMode={darkMode}>
              <Input
                darkMode={darkMode}
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                placeholder="First name"
              />
            </Field>
            <Field label="Last Name" icon={User} darkMode={darkMode}>
              <Input
                darkMode={darkMode}
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                placeholder="Last name"
              />
            </Field>
          </div>
          <Field
            label="Display Name"
            icon={User}
            darkMode={darkMode}
            hint="Shown in the navbar and profile card."
          >
            <Input
              darkMode={darkMode}
              value={form.displayName}
              onChange={(e) =>
                setForm({ ...form, displayName: e.target.value })
              }
              placeholder="e.g. Mr. Souvik"
            />
          </Field>
          <Field label="Bio" icon={User} darkMode={darkMode}>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              placeholder="A short description about yourself..."
              className={`w-full p-3.5 rounded-xl text-xs font-medium outline-none border transition-all duration-200 resize-none ${
                darkMode
                  ? "bg-slate-900 border-slate-800 text-slate-100 focus:border-orange-500/60 placeholder:text-slate-600"
                  : "bg-slate-50 border-slate-200 text-slate-800 focus:border-orange-400 focus:bg-white placeholder:text-slate-400"
              }`}
            />
          </Field>
        </div>

        <div className={card}>
          <p className={sectionTitle}>Contact Information</p>
          <Field
            label="Email Address"
            icon={Mail}
            darkMode={darkMode}
            hint="Used for system notifications and account recovery."
          >
            <Input
              darkMode={darkMode}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Phone Number" icon={Phone} darkMode={darkMode}>
              <Input
                darkMode={darkMode}
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 XXXXX XXXXX"
              />
            </Field>
            <Field label="Location" icon={MapPin} darkMode={darkMode}>
              <Input
                darkMode={darkMode}
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="City, State"
              />
            </Field>
          </div>
        </div>

        <div className={card}>
          <p className={sectionTitle}>Change Password</p>
          <p
            className={`text-[11px] -mt-3 ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            Leave these fields empty if you do not want to change your password.
          </p>
          <Field label="Current Password" icon={Lock} darkMode={darkMode}>
            <div className="relative">
              <Input
                darkMode={darkMode}
                type={showPw.current ? "text" : "password"}
                value={passwords.current}
                onChange={(e) =>
                  setPasswords({ ...passwords, current: e.target.value })
                }
                placeholder="Enter current password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPw((p) => ({ ...p, current: !p.current }))
                }
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                  darkMode
                    ? "text-slate-500 hover:text-slate-300"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {showPw.current ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="New Password" icon={Lock} darkMode={darkMode}>
              <div className="relative">
                <Input
                  darkMode={darkMode}
                  type={showPw.next ? "text" : "password"}
                  value={passwords.next}
                  onChange={(e) =>
                    setPasswords({ ...passwords, next: e.target.value })
                  }
                  placeholder="Min 8 characters"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => ({ ...p, next: !p.next }))}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                    darkMode
                      ? "text-slate-500 hover:text-slate-300"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {showPw.next ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </Field>
            <Field label="Confirm Password" icon={Lock} darkMode={darkMode}>
              <div className="relative">
                <Input
                  darkMode={darkMode}
                  type={showPw.confirm ? "text" : "password"}
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirm: e.target.value })
                  }
                  placeholder="Repeat new password"
                  className="pr-10"
                  onPaste={(e) => e.preventDefault()}
                  onDrop={(e) => e.preventDefault()}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPw((p) => ({ ...p, confirm: !p.confirm }))
                  }
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                    darkMode
                      ? "text-slate-500 hover:text-slate-300"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {showPw.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <p className={`text-[10px] mt-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Please re-enter your password manually.</p>
            </Field>
          </div>
          {passwords.next && (
            <div className="space-y-1.5">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level: number) => {
                  const strength =
                    passwords.next.length >= 12
                      ? 4
                      : passwords.next.length >= 10
                      ? 3
                      : passwords.next.length >= 8
                      ? 2
                      : 1;
                  return (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        level <= strength
                          ? strength === 4
                            ? "bg-emerald-500"
                            : strength === 3
                            ? "bg-orange-400"
                            : strength === 2
                            ? "bg-amber-400"
                            : "bg-red-400"
                          : darkMode
                          ? "bg-slate-800"
                          : "bg-slate-200"
                      }`}
                    />
                  );
                })}
              </div>
              <p
                className={`text-[10px] font-medium ${
                  passwords.next.length >= 12
                    ? "text-emerald-500"
                    : passwords.next.length >= 8
                    ? "text-amber-500"
                    : "text-red-400"
                }`}
              >
                {passwords.next.length >= 12
                  ? "Strong password"
                  : passwords.next.length >= 8
                  ? "Moderate — consider making it longer"
                  : "Too short"}
              </p>
            </div>
          )}
          {pwError && (
            <div className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertCircle size={13} className="shrink-0" />
              {pwError}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              darkMode
                ? "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
                : "bg-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-200 border border-slate-200"
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
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
      </form>
    </div>
  );
}