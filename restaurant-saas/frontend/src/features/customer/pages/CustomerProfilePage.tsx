import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { useCustomerStore } from '../store/customer.store';
import ImageCropperModal from '../components/dashboard/ImageCropperModal';
import { apiClient } from '../../../shared/services/apiClient';
import { useAuth } from '../../../auth/AuthProvider';

const STATS_CONFIG = [
  { icon: 'event_available', key: 'reservations', label: 'Reservations', color: 'bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400' },
  { icon: 'shopping_bag', key: 'orders', label: 'Orders', color: 'bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400' },
  { icon: 'stars', key: 'points', label: 'Reward Points', color: 'bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400' },
  { icon: 'sell', key: 'offers', label: 'Offers', color: 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' },
];

const MENU_ITEMS = [
  { icon: 'person_outline', label: 'Personal Information', desc: 'Update your name and phone', color: 'bg-orange-50 text-orange-500 dark:bg-orange-950/20 dark:text-orange-400', key: 'profile' },
  { icon: 'star_outline', label: 'Reward Points', desc: 'View your reward points and history', color: 'bg-purple-50 text-purple-500 dark:bg-purple-950/20 dark:text-purple-400', key: 'loyalty', badge: '450 Pts' },
  { icon: 'confirmation_number', label: 'Offers & Coupons', desc: 'View available restaurant offers', color: 'bg-red-50 text-red-500 dark:bg-red-950/20 dark:text-red-400', key: 'offers', badge: '5 Available' },
  { icon: 'notifications_active', label: 'Notifications', desc: 'Manage your alert preferences', color: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950/20 dark:text-yellow-400', key: 'notifications' },
];

const AVATAR_OPTIONS = [
  { icon: 'person', label: 'Default' },
];

export default function CustomerProfilePage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [themeExpanded, setThemeExpanded] = useState(false);
  const [activeModal, setActiveModal] = useState<'profile' | 'loyalty' | 'offers' | 'notifications' | null>(null);

  // Zustand state and actions
  const {
    loyaltyPoints,
    loyaltyHistory,
    offers,
    notificationPreferences,
    orders,
    claimOffer,
    updateNotificationPreferences,
    updateProfile,
    clearDiningSession,
  } = useCustomerStore();

  const { signOut } = useAuth();

  // Local feedback toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form & Backend User states
  const [userData, setUserData] = useState<{ name: string; mobile: string; avatar?: string; role?: string } | null>(() => {
    const stored = localStorage.getItem('ra/customer/user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        return {
          name: u.name || '',
          mobile: u.mobile || u.phone || '',
          avatar: u.avatar || 'person',
          role: u.role || 'customer',
        };
      } catch (e) {
        // Ignore parsing error
      }
    }
    return null;
  });

  const [editName, setEditName] = useState(() => userData?.name || '');
  const [countryCode, setCountryCode] = useState(() => {
    const mob = userData?.mobile || '';
    if (mob.startsWith('+')) {
      const match = mob.match(/^(\+\d{1,4})(.*)$/);
      if (match) return match[1];
    }
    return '+91';
  });
  const [localPhone, setLocalPhone] = useState(() => {
    const mob = userData?.mobile || '';
    if (mob.startsWith('+')) {
      const match = mob.match(/^(\+\d{1,4})(.*)$/);
      if (match) return match[2];
    }
    return mob;
  });
  const [selectedAvatar, setSelectedAvatar] = useState(() => userData?.avatar || 'person');
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  const [cropperOpen, setCropperOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState('');

  // Fetch profile details from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/users/me');
        const user = response.data.data.user;
        setUserData(user);
        setEditName(user.name);

        let parsedLocal = user.mobile || '';
        let parsedCode = '+91';
        if (parsedLocal.startsWith('+')) {
          const match = parsedLocal.match(/^(\+\d{1,4})(.*)$/);
          if (match) {
            parsedCode = match[1];
            parsedLocal = match[2];
          }
        }
        setCountryCode(parsedCode);
        setLocalPhone(parsedLocal);
        setSelectedAvatar(user.avatar || 'person');

        updateProfile({
          name: user.name,
          phone: user.mobile,
          avatar: user.avatar || 'person',
        });
      } catch (err) {
        console.error('Failed to fetch user profile', err);
      }
    };
    fetchProfile();
  }, [updateProfile]);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result as string;
        setTempImageSrc(base64Url);
        setCropperOpen(true);
        setAvatarMenuOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropConfirm = async (croppedBase64: string) => {
    try {
      const response = await apiClient.patch('/users/me', {
        avatar: croppedBase64,
      });
      const updatedUser = response.data.data.user;
      setUserData(updatedUser);
      setSelectedAvatar(croppedBase64);
      updateProfile({ avatar: croppedBase64 });
      setCropperOpen(false);
      setTempImageSrc('');
      showToast('Custom photo uploaded and cropped successfully!');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update photo', 'error');
    }
  };

  // Local notification preference state for form toggles
  const [prefEmail, setPrefEmail] = useState(notificationPreferences.email);
  const [prefSms, setPrefSms] = useState(notificationPreferences.sms);
  const [prefWhatsapp, setPrefWhatsapp] = useState(notificationPreferences.whatsapp);
  const [prefPush, setPrefPush] = useState(notificationPreferences.push);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Helper: check loyalty level
  let currentTier = 'Bronze';
  let nextTier = 'Silver';
  let pointsToNext = 500 - loyaltyPoints;
  let progressPercentage = Math.min(100, (loyaltyPoints / 500) * 100);

  if (loyaltyPoints >= 2500) {
    currentTier = 'Platinum';
    nextTier = 'Top Tier';
    pointsToNext = 0;
    progressPercentage = 100;
  } else if (loyaltyPoints >= 1000) {
    currentTier = 'Gold';
    nextTier = 'Platinum';
    pointsToNext = 2500 - loyaltyPoints;
    progressPercentage = Math.min(100, ((loyaltyPoints - 1000) / 1500) * 100);
  } else if (loyaltyPoints >= 500) {
    currentTier = 'Silver';
    nextTier = 'Gold';
    pointsToNext = 1000 - loyaltyPoints;
    progressPercentage = Math.min(100, ((loyaltyPoints - 500) / 500) * 100);
  }

  // Handle Save Profile Info to Backend
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast('Name is required', 'error');
      return;
    }
    const cleanLocal = localPhone.trim().replace(/\D/g, '');
    if (cleanLocal.length !== 10) {
      showToast('Please enter a valid 10-digit phone number', 'error');
      return;
    }

    const fullMobile = countryCode + cleanLocal;

    try {
      const response = await apiClient.patch('/users/me', {
        name: editName,
        mobile: fullMobile,
      });
      const updatedUser = response.data.data.user;
      setUserData(updatedUser);
      updateProfile({
        name: updatedUser.name,
        phone: updatedUser.mobile,
      });

      // Update local storage user details too
      const stored = localStorage.getItem('ra/customer/user');
      if (stored) {
        try {
          const u = JSON.parse(stored);
          u.name = updatedUser.name;
          u.mobile = updatedUser.mobile;
          localStorage.setItem('ra/customer/user', JSON.stringify(u));
        } catch (e) {
          // Ignore parsing error
        }
      }

      setActiveModal(null);
      showToast('Personal information updated successfully!');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    }
  };

  // Handle Save Notification preferences
  const handleSavePreferences = () => {
    updateNotificationPreferences({
      email: prefEmail,
      sms: prefSms,
      whatsapp: prefWhatsapp,
      push: prefPush,
    });
    setActiveModal(null);
    showToast('Alert preferences saved!');
  };

  // Handle Copy Coupon Code
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(`Code "${code}" copied to clipboard!`);
  };

  // Handle Redeem Coupon Points
  const handleRedeemCoupon = (offerId: string, title: string) => {
    const success = claimOffer(offerId);
    if (success) {
      showToast(`Successfully unlocked "${title}"!`);
    } else {
      showToast('Failed to redeem. Insufficient points.', 'error');
    }
  };

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto h-full sd-custom-scrollbar">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-xl z-[150] flex items-center gap-2 border text-sm font-semibold font-sans animate-fadeIn ${
          toast.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-900 dark:text-green-300'
            : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950 dark:border-red-900 dark:text-red-300'
        }`}>
          <span className="material-symbols-outlined text-lg">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {toast.message}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-sd-on-surface font-sans">Profile</h2>
        <p className="text-sm text-sd-on-surface-variant font-sans">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl p-5 border border-sd-surface-variant sd-food-card-shadow flex flex-col sm:flex-row gap-5 items-start">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sd-primary-container/30 to-sd-primary-fixed-dim overflow-hidden flex items-center justify-center ring-4 ring-sd-primary-fixed shadow-md">
                {selectedAvatar.startsWith('data:image') || selectedAvatar.startsWith('http') ? (
                  <img src={selectedAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-4xl text-sd-primary/60" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {selectedAvatar}
                  </span>
                )}
              </div>
              <button
                onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-white dark:bg-sd-surface shadow-md rounded-full flex items-center justify-center border border-sd-surface-variant text-sd-on-surface-variant hover:text-sd-primary transition-colors"
                title="Change Avatar"
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>
              </button>

              {/* Avatar Selector Dropdown */}
              {avatarMenuOpen && (
                <>
                  {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
                  <div className="fixed inset-0 z-40" onClick={() => setAvatarMenuOpen(false)} />
                  <div className="absolute left-0 mt-2 p-2 bg-white dark:bg-sd-surface-container border border-sd-surface-variant rounded-xl shadow-lg z-50 flex gap-2 items-center">
                    {AVATAR_OPTIONS.map((opt) => {
                      const isSelected = selectedAvatar === opt.icon;
                      return (
                        <button
                          key={opt.icon}
                          type="button"
                          onClick={async () => {
                            try {
                              const response = await apiClient.patch('/users/me', { avatar: opt.icon });
                              const updatedUser = response.data.data.user;
                              setUserData(updatedUser);
                              setSelectedAvatar(opt.icon);
                              setAvatarMenuOpen(false);
                              showToast(`Avatar changed to ${opt.label}!`);
                            } catch (err: any) {
                              showToast('Failed to change avatar', 'error');
                            }
                          }}
                          className={`w-9 h-9 rounded-full flex items-center justify-center border hover:border-sd-primary transition-all ${
                            isSelected ? 'border-sd-primary bg-sd-primary/10 text-sd-primary' : 'border-sd-surface-variant text-sd-on-surface-variant'
                          }`}
                          title={opt.label}
                        >
                          <span className="material-symbols-outlined text-xl">{opt.icon}</span>
                        </button>
                      );
                    })}

                    {/* File Upload Input */}
                    <input
                      type="file"
                      ref={avatarFileInputRef}
                      onChange={handleAvatarFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => avatarFileInputRef.current?.click()}
                      className="w-9 h-9 rounded-full flex items-center justify-center border border-dashed border-sd-primary text-sd-primary hover:bg-sd-primary/5 transition-all"
                      title="Upload Custom Photo"
                    >
                      <span className="material-symbols-outlined text-xl">add_a_photo</span>
                    </button>
                  </div>
                </>
              )}
            </div>
            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-sd-on-surface font-sans">{userData?.name || 'Customer'}</h3>
                    <button
                        onClick={() => {
                          setEditName(userData?.name || '');
                          const mob = userData?.mobile || '';
                          let parsedLocal = mob;
                          let parsedCode = '+91';
                          if (mob.startsWith('+')) {
                            const match = mob.match(/^(\+\d{1,4})(.*)$/);
                            if (match) {
                              parsedCode = match[1];
                              parsedLocal = match[2];
                            }
                          }
                          setCountryCode(parsedCode);
                          setLocalPhone(parsedLocal);
                          setActiveModal('profile');
                        }}
                      className="p-1.5 text-sd-on-surface-variant hover:text-sd-primary hover:bg-sd-surface-container rounded-full transition-colors flex items-center justify-center"
                      title="Edit Profile"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sd-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px]">call</span>
                    <span className="text-sm font-semibold font-sans">{userData?.mobile || ''}</span>
                  </div>
                </div>
                <div className="bg-sd-primary-fixed/30 text-sd-primary px-3 py-1 rounded-full flex items-center gap-1 self-start shrink-0">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                  <span className="text-xs font-bold font-sans">
                    {userData?.role === 'customer' ? 'Smart Member' : 'Regular Guest'}
                  </span>
                </div>
              </div>
              <div className="mt-3 p-3 bg-sd-surface-container-low rounded-xl flex items-center justify-between group cursor-pointer border border-transparent hover:border-sd-primary/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-sd-primary-container/10 rounded-full flex items-center justify-center text-sd-primary-container">
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>crown</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold font-sans">You&apos;re a Valued Member!</p>
                    <p className="text-[11px] text-sd-on-surface-variant font-sans">Enjoy exclusive benefits and priority service.</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveModal('loyalty')}
                  className="text-sd-primary font-bold text-xs group-hover:translate-x-1 transition-transform font-sans"
                >
                  View →
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
            {STATS_CONFIG.map(({ icon, key, label, color }) => {
              let value = '0';
              if (key === 'reservations') value = '12';
              if (key === 'orders') value = String(orders.length);
              if (key === 'points') value = String(loyaltyPoints);
              if (key === 'offers') value = String(offers.filter(o => !o.claimed).length);

              return (
                <div key={label} className="bg-white p-2 sm:p-3.5 rounded-xl border border-sd-surface-variant text-center hover:shadow-md transition-all sd-food-card-shadow">
                  <div className={`w-7 h-7 sm:w-9 sm:h-9 mx-auto rounded-full ${color} flex items-center justify-center mb-1 sm:mb-2`}>
                    <span className="material-symbols-outlined text-[14px] sm:text-[18px]">{icon}</span>
                  </div>
                  <p className="text-sm sm:text-base font-bold font-sans">{value}</p>
                  <p className="text-[9px] sm:text-[11px] text-sd-on-surface-variant font-sans truncate">{label}</p>
                </div>
              );
            })}
          </div>

          {/* Menu Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MENU_ITEMS.map(({ icon, label, desc, color, key, badge }) => {
              let displayBadge = badge;
              if (key === 'loyalty') displayBadge = `${loyaltyPoints} Pts`;
              if (key === 'offers') {
                const count = offers.filter(o => !o.claimed).length;
                displayBadge = count > 0 ? `${count} Available` : undefined;
              }

              return (
                <button
                  key={label}
                  onClick={() => {
                    if (key === 'profile') {
                      setEditName(userData?.name || '');
                      const mob = userData?.mobile || '';
                      let parsedLocal = mob;
                      let parsedCode = '+91';
                      if (mob.startsWith('+')) {
                        const match = mob.match(/^(\+\d{1,4})(.*)$/);
                        if (match) {
                          parsedCode = match[1];
                          parsedLocal = match[2];
                        }
                      }
                      setCountryCode(parsedCode);
                      setLocalPhone(parsedLocal);
                      setActiveModal('profile');
                    } else if (key === 'loyalty') {
                      setActiveModal('loyalty');
                    } else if (key === 'offers') {
                      setActiveModal('offers');
                    } else if (key === 'notifications') {
                      setPrefEmail(notificationPreferences.email);
                      setPrefSms(notificationPreferences.sms);
                      setPrefWhatsapp(notificationPreferences.whatsapp);
                      setPrefPush(notificationPreferences.push);
                      setActiveModal('notifications');
                    }
                  }}
                  className="flex items-center gap-3 p-4 bg-white rounded-xl border border-sd-surface-variant hover:bg-sd-surface-container-low transition-colors group text-left"
                >
                  <div className={`w-9 h-9 ${color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shrink-0`}>
                    <span className="material-symbols-outlined text-[18px]">{icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold font-sans truncate">{label}</p>
                      {displayBadge && (
                        <span className="bg-sd-secondary/10 text-sd-secondary px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 font-sans">{displayBadge}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-sd-on-surface-variant font-sans truncate">{desc}</p>
                  </div>
                  <span className="material-symbols-outlined text-sd-surface-variant group-hover:text-sd-primary transition-colors text-[18px] shrink-0">chevron_right</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Preferences */}
          <div className="bg-white rounded-xl border border-sd-surface-variant sd-food-card-shadow overflow-hidden">
            <div className="px-4 py-3 bg-sd-surface-container-low border-b border-sd-surface-variant">
              <p className="text-sm font-bold font-sans">Preferences</p>
            </div>
            <div className="divide-y divide-sd-surface-variant">
              {/* Theme Preferences */}
              <div className="flex flex-col">
                <button
                  onClick={() => setThemeExpanded(!themeExpanded)}
                  className="w-full flex items-center justify-between p-4 hover:bg-sd-surface-container-low transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-purple-600 text-[20px]">palette</span>
                    <span className="text-sm font-bold font-sans">Theme</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-sd-primary font-bold font-sans capitalize">{theme}</span>
                    <span className={`material-symbols-outlined text-sd-surface-variant group-hover:text-sd-primary transition-all text-[18px] ${themeExpanded ? 'rotate-90' : ''}`}>
                      chevron_right
                    </span>
                  </div>
                </button>
                {themeExpanded && (
                  <div className="px-4 pb-4 pt-1 bg-sd-surface-container-low/50 flex flex-col gap-2 border-t border-sd-surface-variant/40">
                    <p className="text-[11px] text-sd-on-surface-variant font-bold mb-1">Select Appearance</p>
                    <div className="flex gap-2">
                      {(['light', 'dark', 'system'] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setTheme(mode)}
                          className={`flex-1 py-2 border rounded-xl text-center capitalize text-xs font-bold font-sans transition-all ${
                            theme === mode
                              ? 'bg-sd-primary-container/10 border-sd-primary-container text-sd-primary'
                              : 'bg-white border-sd-outline-variant text-sd-on-surface-variant hover:bg-sd-surface-container-low'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Other Preferences */}
              <button
                onClick={() => showToast('Help Desk is open! Calling line +91 98765 43210.')}
                className="w-full flex items-center justify-between p-4 hover:bg-sd-surface-container-low transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-blue-600 text-[20px]">support_agent</span>
                  <span className="text-sm font-bold font-sans">Help & Support</span>
                </div>
                <span className="material-symbols-outlined text-sd-surface-variant group-hover:text-sd-primary transition-all text-[18px] group-hover:translate-x-1">chevron_right</span>
              </button>

              <button
                onClick={() => showToast('Privacy Policy is standard GDPR & CCPA compliant.')}
                className="w-full flex items-center justify-between p-4 hover:bg-sd-surface-container-low transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-green-600 text-[20px]">verified_user</span>
                  <span className="text-sm font-bold font-sans">Privacy Policy</span>
                </div>
                <span className="material-symbols-outlined text-sd-surface-variant group-hover:text-sd-primary transition-all text-[18px] group-hover:translate-x-1">chevron_right</span>
              </button>

              <button
                onClick={() => showToast('Standard Restaurant SaaS terms apply.')}
                className="w-full flex items-center justify-between p-4 hover:bg-sd-surface-container-low transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-orange-600 text-[20px]">description</span>
                  <span className="text-sm font-bold font-sans">Terms & Conditions</span>
                </div>
                <span className="material-symbols-outlined text-sd-surface-variant group-hover:text-sd-primary transition-all text-[18px] group-hover:translate-x-1">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <div className="bg-sd-primary-container/5 rounded-xl p-4 border border-sd-primary-container/10 flex items-center gap-3">
              <div className="w-9 h-9 bg-sd-primary-container text-white rounded-full flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">call</span>
              </div>
              <div>
                <p className="text-xs font-bold font-sans">Need Help?</p>
                <p className="text-[11px] text-sd-on-surface-variant font-sans">Call us at +91 98765 43210</p>
              </div>
            </div>
            <div className="bg-sd-tertiary-container/5 rounded-xl p-4 border border-sd-tertiary-container/10 flex items-center gap-3">
              <div className="w-9 h-9 bg-sd-tertiary-container text-white rounded-full flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">chat</span>
              </div>
              <div>
                <p className="text-xs font-bold font-sans">Live Chat</p>
                <p className="text-[11px] text-sd-on-surface-variant font-sans">Chat with our support team</p>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={async () => {
              await clearDiningSession();
              signOut();
              // Reset profile store
              updateProfile({
                name: '',
                phone: '',
                email: '',
                avatar: 'person',
              });
              navigate('/');
            }}
            className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 rounded-xl border border-red-100 dark:border-red-900/50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-[20px]">logout</span>
              <span className="text-sm font-bold text-red-600 dark:text-red-400 font-sans">Logout</span>
            </div>
            <span className="material-symbols-outlined text-red-300 dark:text-red-800 group-hover:text-red-600 dark:group-hover:text-red-400 transition-all text-[18px] group-hover:translate-x-1">chevron_right</span>
          </button>
          <p className="text-center text-[11px] text-sd-on-surface-variant font-sans">Smart Dining App v2.4.1</p>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* MODALS LAYOUT */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-sd-surface-container rounded-3xl border border-sd-surface-variant w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="px-6 py-4 bg-sd-surface-container-low border-b border-sd-surface-variant flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg font-sans text-sd-on-surface">
                {activeModal === 'profile' && 'Personal Information'}
                {activeModal === 'loyalty' && 'Reward Points & Loyalty'}
                {activeModal === 'offers' && 'Offers & Coupons'}
                {activeModal === 'notifications' && 'Notification Preferences'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-white dark:bg-sd-surface hover:bg-sd-surface-container text-sd-on-surface-variant hover:text-sd-on-surface flex items-center justify-center transition-colors border border-sd-surface-variant"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 sd-custom-scrollbar">

              {/* Profile Edit Modal Content */}
              {activeModal === 'profile' && (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label htmlFor="editName" className="block text-xs font-bold text-sd-on-surface-variant uppercase tracking-wider mb-1 font-sans">Full Name</label>
                    <input
                      id="editName"
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-sd-surface-variant focus:outline-none focus:ring-2 focus:ring-sd-primary focus:border-sd-primary font-sans text-sm"
                      placeholder="Rahul Sharma"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="editPhone" className="block text-xs font-bold text-sd-on-surface-variant uppercase tracking-wider mb-1 font-sans">Mobile Phone</label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="px-3 py-2.5 rounded-xl border border-sd-surface-variant bg-white dark:bg-sd-surface focus:outline-none focus:ring-2 focus:ring-sd-primary text-sm font-sans shrink-0"
                      >
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+65">🇸🇬 +65</option>
                        <option value="+61">🇦🇺 +61</option>
                      </select>
                      <input
                        id="editPhone"
                        type="tel"
                        value={localPhone}
                        onChange={(e) => setLocalPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-sd-surface-variant focus:outline-none focus:ring-2 focus:ring-sd-primary focus:border-sd-primary font-sans text-sm"
                        placeholder="98765 43210"
                        required
                      />
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-4 py-2.5 border border-sd-surface-variant hover:bg-sd-surface-container-low rounded-xl text-xs font-bold font-sans transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-sd-primary text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all font-sans"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              )}

              {/* Loyalty & Reward Points Modal Content */}
              {activeModal === 'loyalty' && (
                <div className="space-y-6">
                  {/* Points Dashboard card */}
                  <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-5 text-white shadow-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider opacity-75 font-sans">Point Balance</p>
                        <h4 className="text-3xl font-extrabold font-sans mt-1">{loyaltyPoints} PTS</h4>
                      </div>
                      <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest font-sans backdrop-blur-sm">
                        {currentTier} Tier
                      </span>
                    </div>

                    {/* Progress to next tier */}
                    {nextTier !== 'Top Tier' ? (
                      <div className="mt-5 space-y-1.5">
                        <div className="flex justify-between text-xs font-sans">
                          <span className="opacity-80">Progress to {nextTier}</span>
                          <span className="font-bold">{loyaltyPoints} / {currentTier === 'Bronze' ? '500' : currentTier === 'Silver' ? '1000' : '2500'} PTS</span>
                        </div>
                        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full bg-white transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                        </div>
                        <p className="text-[10px] opacity-75 font-sans mt-0.5 text-right">
                          Need {pointsToNext} more PTS for {nextTier} status
                        </p>
                      </div>
                    ) : (
                      <div className="mt-5 text-xs font-bold text-purple-100 font-sans">
                        🎉 Max Tier Unlocked! You have elite Platinum guest status.
                      </div>
                    )}
                  </div>

                  {/* History Section */}
                  <div>
                    <h4 className="font-bold text-sm text-sd-on-surface uppercase tracking-wider mb-3 font-sans">Point Transaction History</h4>
                    {loyaltyHistory.length === 0 ? (
                      <p className="text-xs text-sd-on-surface-variant font-sans text-center py-6">No point transactions yet.</p>
                    ) : (
                      <div className="divide-y divide-sd-surface-variant/50 max-h-56 overflow-y-auto sd-custom-scrollbar border border-sd-surface-variant rounded-2xl">
                        {loyaltyHistory.map((item) => (
                          <div key={item.id} className="p-3 flex justify-between items-center text-xs">
                            <div>
                              <p className="font-bold text-sd-on-surface font-sans">{item.description}</p>
                              <p className="text-[10px] text-sd-on-surface-variant/75 font-sans mt-0.5">{item.date}</p>
                            </div>
                            <span className={`font-bold px-2 py-0.5 rounded-full shrink-0 font-sans ${
                              item.type === 'earn'
                                ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                            }`}>
                              {item.type === 'earn' ? `+${item.points}` : `${item.points}`} PTS
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Offers & Coupons Modal Content */}
              {activeModal === 'offers' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-sd-surface-container-low p-3.5 rounded-2xl border border-sd-surface-variant/50">
                    <div>
                      <p className="text-[10px] font-bold text-sd-on-surface-variant uppercase tracking-wider font-sans">Your Balance</p>
                      <p className="text-base font-extrabold text-purple-600 font-sans">{loyaltyPoints} Reward Points</p>
                    </div>
                    <span className="material-symbols-outlined text-purple-400 text-2xl">stars</span>
                  </div>

                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 sd-custom-scrollbar">
                    {offers.map((offer) => (
                      <div
                        key={offer.id}
                        className={`border-2 border-dashed rounded-2xl p-4 flex flex-col justify-between transition-all ${
                          offer.claimed
                            ? 'border-green-300 bg-green-50/20 dark:border-green-900/50 dark:bg-green-950/5'
                            : 'border-sd-surface-variant hover:border-sd-primary'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-extrabold text-sm text-sd-on-surface font-sans">{offer.title}</h5>
                              {offer.claimed ? (
                                <span className="bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-sans">
                                  Unlocked
                                </span>
                              ) : (
                                <span className="bg-sd-surface-container-high text-sd-on-surface-variant text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-sans">
                                  {offer.requiredPoints} Pts Needed
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-sd-on-surface-variant font-sans mt-0.5">{offer.desc}</p>
                          </div>
                          <span className="material-symbols-outlined text-sd-on-surface-variant/30 text-xl">confirmation_number</span>
                        </div>

                        <div className="mt-4 pt-3 border-t border-dashed border-sd-surface-variant/60 flex items-center justify-between gap-4">
                          <p className="text-[10px] text-sd-on-surface-variant/60 font-sans">Expires: {offer.expiryDate}</p>

                          {offer.claimed ? (
                            <div className="flex items-center gap-1 bg-white dark:bg-sd-surface-container border border-green-200 dark:border-green-900 rounded-lg p-1">
                              <span className="text-[10px] font-mono font-bold px-2 text-green-700 dark:text-green-400 select-all">
                                {offer.code}
                              </span>
                              <button
                                onClick={() => handleCopyCode(offer.code)}
                                className="p-1 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-md transition-colors"
                                title="Copy Coupon Code"
                              >
                                <span className="material-symbols-outlined text-[14px]">content_copy</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleRedeemCoupon(offer.id, offer.title)}
                              disabled={loyaltyPoints < offer.requiredPoints}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition-all flex items-center gap-1 ${
                                loyaltyPoints >= offer.requiredPoints
                                  ? 'bg-sd-primary text-white hover:opacity-90 active:scale-95'
                                  : 'bg-sd-surface-container-high text-sd-on-surface-variant/40 cursor-not-allowed'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[14px]">lock_open</span>
                              Unlock ({offer.requiredPoints} Pts)
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notification Toggles Modal Content */}
              {activeModal === 'notifications' && (
                <div className="space-y-5">
                  <p className="text-xs text-sd-on-surface-variant font-sans">
                    Choose which channels you want to receive alerts and notifications on.
                  </p>

                  <div className="space-y-3">
                    {/* Toggle row: Email */}
                    <div className="flex items-center justify-between p-3.5 bg-sd-surface-container-low rounded-xl border border-sd-surface-variant/50">
                      <div>
                        <p className="text-sm font-bold text-sd-on-surface font-sans">Email Notifications</p>
                        <p className="text-[10px] text-sd-on-surface-variant font-sans">Receive order receipts and promotions.</p>
                      </div>
                      <button
                        onClick={() => setPrefEmail(!prefEmail)}
                        className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none shrink-0 ${
                          prefEmail ? 'bg-sd-primary' : 'bg-sd-outline-variant dark:bg-sd-surface-variant'
                        }`}
                        type="button"
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                            prefEmail ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Toggle row: SMS */}
                    <div className="flex items-center justify-between p-3.5 bg-sd-surface-container-low rounded-xl border border-sd-surface-variant/50">
                      <div>
                        <p className="text-sm font-bold text-sd-on-surface font-sans">SMS Notifications</p>
                        <p className="text-[10px] text-sd-on-surface-variant font-sans">Get text alerts when your food is ready.</p>
                      </div>
                      <button
                        onClick={() => setPrefSms(!prefSms)}
                        className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none shrink-0 ${
                          prefSms ? 'bg-sd-primary' : 'bg-sd-outline-variant dark:bg-sd-surface-variant'
                        }`}
                        type="button"
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                            prefSms ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Toggle row: WhatsApp */}
                    <div className="flex items-center justify-between p-3.5 bg-sd-surface-container-low rounded-xl border border-sd-surface-variant/50">
                      <div>
                        <p className="text-sm font-bold text-sd-on-surface font-sans">WhatsApp Alerts</p>
                        <p className="text-[10px] text-sd-on-surface-variant font-sans">Get receipt updates instantly on WhatsApp.</p>
                      </div>
                      <button
                        onClick={() => setPrefWhatsapp(!prefWhatsapp)}
                        className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none shrink-0 ${
                          prefWhatsapp ? 'bg-sd-primary' : 'bg-sd-outline-variant dark:bg-sd-surface-variant'
                        }`}
                        type="button"
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                            prefWhatsapp ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Toggle row: Push */}
                    <div className="flex items-center justify-between p-3.5 bg-sd-surface-container-low rounded-xl border border-sd-surface-variant/50">
                      <div>
                        <p className="text-sm font-bold text-sd-on-surface font-sans">Push Notifications</p>
                        <p className="text-[10px] text-sd-on-surface-variant font-sans">Get real-time browser alerts from the chef.</p>
                      </div>
                      <button
                        onClick={() => setPrefPush(!prefPush)}
                        className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none shrink-0 ${
                          prefPush ? 'bg-sd-primary' : 'bg-sd-outline-variant dark:bg-sd-surface-variant'
                        }`}
                        type="button"
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                            prefPush ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-4 py-2.5 border border-sd-surface-variant hover:bg-sd-surface-container-low rounded-xl text-xs font-bold font-sans transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSavePreferences}
                      className="px-5 py-2.5 bg-sd-primary text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all font-sans"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={tempImageSrc}
        onClose={() => {
          setCropperOpen(false);
          setTempImageSrc('');
        }}
        onConfirm={handleCropConfirm}
      />
    </div>
  );
}
