import React, { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useSettingsStore } from '../../store/settings.store';

export function ProfileCard(): JSX.Element {
  const { profile, editingProfile, setEditingProfile, updateProfile } = useSettingsStore();
  const [draft, setDraft] = useState({ ...profile });

  function handleSave() {
    updateProfile(draft);
    setEditingProfile(false);
  }

  function handleCancel() {
    setDraft({ ...profile });
    setEditingProfile(false);
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
      <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-5">Profile Settings</h3>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.avatarSeed}`}
            alt={profile.fullName}
            className="w-20 h-20 rounded-2xl bg-orange-50 dark:bg-orange-950 object-cover border-2 border-orange-100 dark:border-orange-900"
          />
          <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow border-2 border-white dark:border-gray-900">
            <Pencil className="w-3 h-3 text-white" />
          </button>
        </div>

        {/* Fields */}
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <Field label="Full Name">
            {editingProfile
              ? <input className={inputCls} value={draft.fullName} onChange={e => setDraft(d => ({ ...d, fullName: e.target.value }))} />
              : <Value>{profile.fullName}</Value>}
          </Field>
          <Field label="Email Address">
            {editingProfile
              ? <input className={inputCls} value={draft.email} onChange={e => setDraft(d => ({ ...d, email: e.target.value }))} />
              : <Value>{profile.email}</Value>}
          </Field>
          <Field label="Phone Number">
            {editingProfile
              ? <input className={inputCls} value={draft.phone} onChange={e => setDraft(d => ({ ...d, phone: e.target.value }))} />
              : <Value>{profile.phone}</Value>}
          </Field>
          <Field label="Role">
            <Value>{profile.role}</Value>
          </Field>
        </div>
      </div>

      <div className="mt-5 flex flex-col sm:flex-row justify-end gap-2">
        {editingProfile ? (
          <>
            <button onClick={handleCancel} className={secondaryBtn}>Cancel</button>
            <button onClick={handleSave} className={primaryBtn}>Save Changes</button>
          </>
        ) : (
          <button onClick={() => setEditingProfile(true)} className={primaryBtn}>Edit Profile</button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{label}</p>
      {children}
    </div>
  );
}

function Value({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{children}</p>;
}

const inputCls =
  'w-full text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-800 focus:border-orange-300 dark:focus:border-orange-600 transition-all';

const primaryBtn =
  'px-4 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors';

const secondaryBtn =
  'px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors';