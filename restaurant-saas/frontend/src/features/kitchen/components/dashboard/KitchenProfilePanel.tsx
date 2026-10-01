import React, { useState, useEffect, useRef } from 'react';
import { useKitchenStore, KitchenProfile } from '../../store/kitchen.store';
import ImageCropperModal from '../../../customer/components/dashboard/ImageCropperModal';
import { useAuth } from '../../../../auth/AuthProvider';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_OPTIONS: { value: KitchenProfile['status']; label: string; color: string }[] = [
  { value: 'on-duty', label: 'On Duty', color: 'bg-green-500' },
  { value: 'on-break', label: 'On Break', color: 'bg-yellow-500' },
  { value: 'off-duty', label: 'Off Duty', color: 'bg-slate-400' },
];

const ROLE_OPTIONS = [
  'Executive Chef',
  'Sous Chef',
  'Senior Chef',
  'Line Cook',
  'Pastry Chef',
  'Prep Cook',
  'Kitchen Assistant',
];

const STATION_OPTIONS = [
  'Grill Station',
  'Curry Station',
  'Fry Station',
  'Biryani Station',
  'Dessert Counter',
  'Beverage Station',
  'Prep Station',
  'Tandoor Station',
  '-',
];

export default function KitchenProfilePanel({ isOpen, onClose }: Props) {
  const { signOut } = useAuth();
  const { profile, updateProfile } = useKitchenStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state for forms
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<KitchenProfile['status']>('on-duty');
  const [station, setStation] = useState('');
  const [shift, setShift] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');

  // Cropper states
  const [cropperOpen, setCropperOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState('');
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);

  // Notification Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Sync form states with store when drawer opens or store updates
  useEffect(() => {
    if (isOpen && profile) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setName(profile.name || '');
      setRole(profile.role || '');
      setStatus(profile.status || 'on-duty');
      setStation(profile.station || '');
      setShift(profile.shift || '');
      setPhone(profile.phone || '');
      setEmail(profile.email || '');
      setAvatar(profile.avatar || '');
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [isOpen, profile]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImageSrc(reader.result as string);
        setCropperOpen(true);
        setAvatarMenuOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropConfirm = (croppedBase64: string) => {
    setAvatar(croppedBase64);
    setCropperOpen(false);
    setTempImageSrc('');
    showToast('Profile photo cropped successfully!');
  };

  const handleResetAvatar = () => {
    setAvatar('');
    setAvatarMenuOpen(false);
    showToast('Reset to default initials.');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Name is required', 'error');
      return;
    }

    // Basic Validation
    if (phone.trim() && phone.trim().length < 8) {
      showToast('Please enter a valid phone number', 'error');
      return;
    }

    if (email.trim() && !/\S+@\S+\.\S+/.test(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    updateProfile({
      name,
      role,
      status,
      station,
      shift,
      phone,
      email,
      avatar,
    });

    showToast('Profile updated successfully!');
    setTimeout(() => {
      onClose();
    }, 500);
  };

  // Helper for rendering dynamic initials avatar
  const getInitials = (fullName: string) => {
    if (!fullName) return 'CH';
    return fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div className={`fixed inset-0 z-[100] overflow-hidden transition-all ${isOpen ? 'visible' : 'invisible'}`}>
        {/* Backdrop overlay */}
        <button
          type="button"
          aria-label="Close profile panel"
          className={`absolute inset-0 bg-slate-950/40 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300 w-full h-full border-none outline-none cursor-default ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onClose}
        />

        {/* Slide-over panel */}
        <div
          className={`absolute inset-y-0 right-0 pl-10 max-w-full flex transform transition-transform duration-300 ease-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white font-sans">Staff Profile</h3>
                  <p className="text-[11px] text-slate-400 font-sans">Manage your personal and duty details</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-700 transition-colors"
                title="Close"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Profile Avatar Center Area */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-950 dark:to-orange-900/50 overflow-hidden flex items-center justify-center ring-4 ring-orange-500/20 dark:ring-orange-500/10 shadow-md">
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-extrabold text-2xl text-orange-700 dark:text-orange-400 font-sans">
                        {getInitials(name)}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-white dark:bg-slate-800 shadow-md rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                    title="Change Profile Photo"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>

                  {/* Avatar upload/clear dropdown */}
                  {avatarMenuOpen && (
                    <>
                      <button
                        type="button"
                        aria-label="Close avatar menu"
                        className="fixed inset-0 z-40 bg-transparent border-none outline-none cursor-default"
                        onClick={() => setAvatarMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 py-1.5 animate-fadeIn">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleAvatarFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full px-4 py-2 text-left text-xs font-semibold font-sans text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[16px] text-slate-400">upload</span>
                          Upload Custom Photo
                        </button>
                        {avatar && (
                          <button
                            type="button"
                            onClick={handleResetAvatar}
                            className="w-full px-4 py-2 text-left text-xs font-semibold font-sans text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700 mt-1"
                          >
                            <span className="material-symbols-outlined text-[16px] text-red-400">delete</span>
                            Reset to Default
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-slate-800 dark:text-white font-sans">{name || 'Chef Staff'}</h4>
                  <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase font-sans mt-0.5">
                    {role || 'Staff Member'}
                  </p>
                </div>
              </div>

              {/* Input Fields */}
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="chef-name" className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                    Full Name
                  </label>
                  <input
                    id="chef-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Chef Arjun"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:text-white font-sans text-sm"
                    required
                  />
                </div>

                {/* Role & Status Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Role */}
                  <div>
                    <label htmlFor="chef-role" className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                      Role
                    </label>
                    <select
                      id="chef-role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:text-white font-sans text-sm"
                    >
                      {ROLE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label htmlFor="chef-status" className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                      Duty Status
                    </label>
                    <select
                      id="chef-status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as KitchenProfile['status'])}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:text-white font-sans text-sm"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Shift & Station Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Shift */}
                  <div>
                    <label htmlFor="chef-shift" className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                      Shift Hours
                    </label>
                    <input
                      id="chef-shift"
                      type="text"
                      value={shift}
                      onChange={(e) => setShift(e.target.value)}
                      placeholder="e.g. 6:00 AM - 2:00 PM"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:text-white font-sans text-sm"
                    />
                  </div>

                  {/* Station */}
                  <div>
                    <label htmlFor="chef-station" className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                      Assigned Station
                    </label>
                    <select
                      id="chef-station"
                      value={station}
                      onChange={(e) => setStation(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:text-white font-sans text-sm"
                    >
                      {STATION_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="chef-phone" className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                    Contact Phone
                  </label>
                  <input
                    id="chef-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:text-white font-sans text-sm"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="chef-email" className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                    Email Address
                  </label>
                  <input
                    id="chef-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. arjun.chef@flavoroast.com"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:text-white font-sans text-sm"
                  />
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  signOut();
                  onClose();
                }}
                className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:hover:bg-red-900/30 dark:text-red-400 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                Logout
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold font-sans transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all font-sans flex items-center gap-1.5 shadow-sm shadow-orange-500/20"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  Save Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Cropper Modal */}
      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={tempImageSrc}
        onClose={() => setCropperOpen(false)}
        onConfirm={handleCropConfirm}
      />

      {/* Floating Success/Error Feedback Toast */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-xl z-[200] flex items-center gap-2 border text-sm font-semibold font-sans animate-fadeIn ${
            toast.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-900 dark:text-green-300'
              : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950 dark:border-red-900 dark:text-red-300'
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {toast.message}
        </div>
      )}
    </>
  );
}
