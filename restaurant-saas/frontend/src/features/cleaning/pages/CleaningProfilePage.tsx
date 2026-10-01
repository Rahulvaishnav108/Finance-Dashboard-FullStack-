import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCleaning } from '../hooks/usecleaning';
import ImageCropperModal from '../../customer/components/dashboard/ImageCropperModal';
import { useAuth } from '../../../auth/AuthProvider';
import { useToast } from '../components/dashboard/Toast';
import { cleaningStore } from '../store/cleaning.store';

interface ActivityItem {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  timestamp: string;
  subtitle: string;
}

interface PreferenceItem {
  icon: string;
  label: string;
  value: string;
}

interface BadgeItem {
  title: string;
  desc: string;
  earned: string;
  icon: string;
  bgClass: string;
  shadowClass: string;
}

interface TableTask {
  id: string;
  rawId?: string;
  rawStatus?: 'PENDING' | 'REQUESTED' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED';
  rawPriority?: 'High' | 'Medium' | 'Low';
  progress?: number;
  waiting?: string;
}

export default function CleaningProfilePage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔌 Connect with dynamic system telemetry layer
  const { urgentTasks, profile, updateProfile } = useCleaning();
  const { showToast } = useToast();
  const safeTasks: TableTask[] = (urgentTasks || []) as TableTask[];

  const [tableList, setTableList] = useState(cleaningStore.tables);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const unsubscribe = cleaningStore.subscribe(() => {
      setTableList([...cleaningStore.tables]);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const liveCleanedCount = tableList.filter(t => t.status === 'Available' || t.status === 'Done').length;
  const liveInProgressCount = tableList.filter(t => t.status === 'In Progress').length;

  // Edit Modals states
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showPrefsModal, setShowPrefsModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Cropper states
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState('');

  // Info Modal Form states
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Prefs Modal Form states
  const [editPreferredArea, setEditPreferredArea] = useState('');
  const [editPreferredShift, setEditPreferredShift] = useState('');
  const [editDaysAvailable, setEditDaysAvailable] = useState('');
  const [editBreakPreference, setEditBreakPreference] = useState('');
  const [editPreferredTaskTypes, setEditPreferredTaskTypes] = useState('');

  // Password Modal states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const openInfoModal = () => {
    setEditName(profile.name);
    setEditEmail(profile.email);
    setEditPhone(profile.phone);
    setShowInfoModal(true);
  };

  const openPrefsModal = () => {
    setEditPreferredArea(profile.preferredArea);
    setEditPreferredShift(profile.preferredShift);
    setEditDaysAvailable(profile.daysAvailable);
    setEditBreakPreference(profile.breakPreference);
    setEditPreferredTaskTypes(profile.preferredTaskTypes);
    setShowPrefsModal(true);
  };

  const openPasswordModal = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setShowPasswordModal(true);
  };

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: editName,
      email: editEmail,
      phone: editPhone
    });
    setShowInfoModal(false);
  };

  const handleSavePrefs = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      preferredArea: editPreferredArea,
      preferredShift: editPreferredShift,
      daysAvailable: editDaysAvailable,
      breakPreference: editBreakPreference,
      preferredTaskTypes: editPreferredTaskTypes
    });
    setShowPrefsModal(false);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match!");
      return;
    }
    setPasswordError('');
    showToast("Password updated successfully!", "success");
    setShowPasswordModal(false);
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCropImageSrc(reader.result);
          setShowCropModal(true);
        }
        e.target.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropConfirm = (croppedBase64: string) => {
    updateProfile({ avatar: croppedBase64 });
    setShowCropModal(false);
  };

  const activities: ActivityItem[] = [
    {
      icon: 'check_circle',
      iconBg: 'bg-green-100 dark:bg-green-950/30',
      iconColor: 'text-green-600 dark:text-green-400',
      title: 'Completed table T01',
      timestamp: 'Jun 16, 2026',
      subtitle: 'Dining Area A • 10:30 AM',
    },
    {
      icon: 'timer',
      iconBg: 'bg-orange-100 dark:bg-orange-950/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      title: 'Started cleaning table T12',
      timestamp: 'Jun 16, 2026',
      subtitle: 'Dining Area A • 10:18 AM',
    },
    {
      icon: 'assignment',
      iconBg: 'bg-orange-100 dark:bg-orange-950/30',
      iconColor: 'text-orange-500 dark:text-orange-400',
      title: 'Completed task',
      timestamp: 'Jun 16, 2026',
      subtitle: 'Restroom Sanitization • 09:15 AM',
    },
    {
      icon: 'verified',
      iconBg: 'bg-purple-100 dark:bg-purple-950/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      title: 'Hygiene score updated',
      timestamp: 'Jun 15, 2026',
      subtitle: 'Score: 98% (Excellent)',
    },
    {
      icon: 'check_circle',
      iconBg: 'bg-green-100 dark:bg-green-950/30',
      iconColor: 'text-green-600 dark:text-green-400',
      title: 'Completed table T05',
      timestamp: 'Jun 15, 2026',
      subtitle: 'Dining Area B • 03:45 PM',
    },
    {
      icon: 'timer',
      iconBg: 'bg-orange-100 dark:bg-orange-950/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      title: 'Started cleaning table T08',
      timestamp: 'Jun 15, 2026',
      subtitle: 'Dining Area A • 02:30 PM',
    },
  ];

  const preferences: PreferenceItem[] = [
    { icon: 'location_on', label: 'Preferred Area', value: profile.preferredArea },
    { icon: 'light_mode', label: 'Preferred Shift', value: profile.preferredShift },
    { icon: 'calendar_month', label: 'Days Available', value: profile.daysAvailable },
    { icon: 'coffee', label: 'Break Preference', value: profile.breakPreference },
    { icon: 'fact_check', label: 'Preferred Task Types', value: profile.preferredTaskTypes },
  ];

  const badges: BadgeItem[] = [
    {
      title: 'Consistency Star',
      desc: 'Completed 20 tasks in a row',
      earned: 'Earned on Jun 10, 2026',
      icon: 'star',
      bgClass: 'bg-green-500',
      shadowClass: 'shadow-green-250 dark:shadow-none',
    },
    {
      title: 'Hygiene Hero',
      desc: 'Maintained 95%+ hygiene score for a week',
      earned: 'Earned on Jun 5, 2026',
      icon: 'shield',
      bgClass: 'bg-blue-500',
      shadowClass: 'shadow-blue-250 dark:shadow-none',
    },
    {
      title: 'Time Keeper',
      desc: 'Completed tasks on time for 10 days',
      earned: 'Earned on May 28, 2026',
      icon: 'schedule',
      bgClass: 'bg-purple-500',
      shadowClass: 'shadow-purple-250 dark:shadow-none',
    },
    {
      title: 'Clean Sweep',
      desc: 'No pending tasks for a full day',
      earned: 'Earned on May 20, 2026',
      icon: 'cleaning_services',
      bgClass: 'bg-orange-500',
      shadowClass: 'shadow-orange-250 dark:shadow-none',
    },
    {
      title: 'Rising Star',
      desc: 'Top performer of the month',
      earned: 'Earned on May 1, 2026',
      icon: 'workspace_premium',
      bgClass: 'bg-teal-500',
      shadowClass: 'shadow-teal-250 dark:shadow-none',
    },
  ];

  return (
    <>
      <div className="space-y-6 lg:space-y-8 animate-fadeIn cleaning-panel">
        {/* Profile and Performance grid */}
        <div className="grid grid-cols-12 gap-6 lg:gap-8">
          {/* Profile Overview */}
          <section className="col-span-12 lg:col-span-7 bg-white dark:bg-sd-surface-container rounded-2xl border border-slate-155 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 font-sans">Profile Overview</h3>
              <button
                onClick={openInfoModal}
                className="text-slate-400 hover:text-orange-500 transition-colors flex items-center gap-1 text-[11px] font-bold font-sans cursor-pointer focus:outline-none"
                title="Edit Profile Information"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                Edit Info
              </button>
            </div>
            <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
              <div className="flex flex-col items-center gap-3 shrink-0">
                <div className="relative shrink-0">
                  {profile.avatar ? (
                    <img
                      alt={profile.name}
                      className="w-28 h-28 rounded-full object-cover border-4 border-slate-100 dark:border-slate-800 shadow-md"
                      src={profile.avatar}
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full border-4 border-slate-100 dark:border-slate-800 shadow-md bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold text-3xl">
                      {profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </div>
                  )}
                  <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-sd-surface-container rounded-full" />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={handlePhotoClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-orange-500 text-orange-500 dark:text-white dark:border-slate-700 rounded-lg text-[10px] font-bold hover:bg-orange-500/10 transition-all active:scale-95 font-sans cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                  Change Photo
                </button>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-650 dark:bg-red-950/20 dark:hover:bg-red-900/30 dark:text-red-400 border border-transparent rounded-lg text-[10px] font-bold transition-all active:scale-95 font-sans cursor-pointer w-full justify-center mt-2"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  Logout
                </button>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-y-4 gap-x-6 lg:gap-x-8 font-sans text-xs">
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Full Name</p>
                  <p className="font-extrabold text-slate-800 dark:text-slate-200">{profile.name}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Staff ID</p>
                  <p className="font-extrabold text-slate-800 dark:text-slate-200">{profile.id}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email</p>
                  <p className="font-extrabold text-slate-800 dark:text-slate-200 truncate">{profile.email}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Phone</p>
                  <p className="font-extrabold text-slate-800 dark:text-slate-200">{profile.phone}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Role</p>
                  <p className="font-extrabold text-slate-800 dark:text-slate-200">{profile.role}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Department</p>
                  <p className="font-extrabold text-slate-800 dark:text-slate-200">{profile.department}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Joined On</p>
                  <p className="font-extrabold text-slate-800 dark:text-slate-200">{profile.joinedOn}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status</p>
                  <span className="bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-455 px-2 py-0.5 rounded text-[10px] font-bold inline-block">{profile.status}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Performance Summary */}
          <section className="col-span-12 lg:col-span-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 font-sans">Performance Summary</h3>
              <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-[10px] font-bold font-sans focus:ring-1 focus:ring-orange-500 px-2.5 py-1 text-slate-700 dark:text-slate-350 outline-none accent-orange-500 cursor-pointer">
                <option>This Month</option>
                <option>Last Month</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-sd-surface-container p-4 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm">
                <div className="w-8 h-8 bg-green-50 dark:bg-green-950/30 rounded-full flex items-center justify-center mb-2 text-green-600">
                  <span className="material-symbols-outlined text-[20px]">done_all</span>
                </div>
                <h4 className="text-xl font-extrabold text-slate-855 dark:text-slate-100 leading-none">{12 + liveCleanedCount}</h4>
                <p className="text-[10px] text-slate-400 font-bold font-sans mt-0.5">Tables Cleaned</p>
                <div className="flex items-center gap-0.5 text-green-600 text-[9px] font-bold font-sans mt-2">
                  <span className="material-symbols-outlined text-[12px]">trending_up</span>
                  12% vs last month
                </div>
              </div>

              <div className="bg-white dark:bg-sd-surface-container p-4 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm">
                <div className="w-8 h-8 bg-orange-500/10 dark:bg-orange-950/30 rounded-full flex items-center justify-center mb-2 text-orange-500">
                  <span className="material-symbols-outlined text-[20px]">verified_user</span>
                </div>
                <h4 className="text-xl font-extrabold text-slate-855 dark:text-slate-100 leading-none">98%</h4>
                <p className="text-[10px] text-slate-400 font-bold font-sans mt-0.5">Hygiene Score</p>
                <div className="flex items-center gap-0.5 text-green-600 text-[9px] font-bold font-sans mt-2">
                  <span className="material-symbols-outlined text-[12px]">trending_up</span>
                  5% vs last month
                </div>
              </div>

              <div className="bg-white dark:bg-sd-surface-container p-4 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm">
                <div className="w-8 h-8 bg-orange-50 dark:bg-orange-950/30 rounded-full flex items-center justify-center mb-2 text-orange-600">
                  <span className="material-symbols-outlined text-[20px]">schedule</span>
                </div>
                <div className="flex items-baseline gap-0.5">
                  <h4 className="text-xl font-extrabold text-slate-855 dark:text-slate-100 leading-none">24h</h4>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">36m</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold font-sans mt-0.5">Total Work Time</p>
                <div className="flex items-center gap-0.5 text-green-600 text-[9px] font-bold font-sans mt-2">
                  <span className="material-symbols-outlined text-[12px]">trending_up</span>
                  8% vs last month
                </div>
              </div>

              <div className="bg-white dark:bg-sd-surface-container p-4 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm">
                <div className="w-8 h-8 bg-orange-500/10 dark:bg-orange-950/30 rounded-full flex items-center justify-center mb-2 text-orange-500">
                  <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
                </div>
                <h4 className="text-xl font-extrabold text-slate-855 dark:text-slate-100 leading-none">{22 + liveCleanedCount + liveInProgressCount}</h4>
                <p className="text-[10px] text-slate-400 font-bold font-sans mt-0.5">Tasks Completed</p>
                <div className="flex items-center gap-0.5 text-green-600 text-[9px] font-bold font-sans mt-2">
                  <span className="material-symbols-outlined text-[12px]">trending_up</span>
                  14% vs last month
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Account Settings, Activity, Work Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <section className="bg-white dark:bg-sd-surface-container rounded-2xl border border-slate-150 dark:border-slate-800 p-5 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-4 font-sans">Account Settings</h3>
            <div className="space-y-1.5">
              {[
                { label: 'Personal Information', desc: 'Update your personal details', icon: 'person', action: openInfoModal },
                { label: 'Change Password', desc: 'Update your account password', icon: 'lock', action: openPasswordModal },
                { label: 'Notification Preferences', desc: 'Manage your notification settings', icon: 'notifications_active', action: () => navigate('/cleaning/settings') },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group font-sans text-xs text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-orange-500 transition-colors text-[18px]">{item.icon}</span>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{item.label}</p>
                      <p className="text-[9px] text-slate-400 font-semibold">{item.desc}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-450 group-hover:translate-x-0.5 transition-transform text-sm">chevron_right</span>
                </button>
              ))}

              <button
                onClick={() => navigate('/cleaning/settings')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group font-sans text-xs text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-orange-500 transition-colors text-[18px]">language</span>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Language</p>
                    <p className="text-[9px] text-slate-400 font-semibold">Choose your preferred language</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-orange-500">English</span>
                  <span className="material-symbols-outlined text-slate-450 group-hover:translate-x-0.5 transition-transform text-sm">chevron_right</span>
                </div>
              </button>
              <button
                onClick={() => navigate('/cleaning/settings')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group font-sans text-xs text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-orange-500 transition-colors text-[18px]">dark_mode</span>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Theme</p>
                    <p className="text-[9px] text-slate-400 font-semibold">Choose your preferred theme</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-orange-500">Active</span>
                  <span className="material-symbols-outlined text-slate-450 group-hover:translate-x-0.5 transition-transform text-sm">chevron_right</span>
                </div>
              </button>
            </div>
          </section>

          {/* Recent Activity */}
          <section className="bg-white dark:bg-sd-surface-container rounded-2xl border border-slate-150 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-sans">Recent Activity</h3>
              <button type="button" onClick={() => setShowAllActivities(!showAllActivities)} className="text-[10px] font-bold text-orange-500 cursor-pointer hover:underline font-sans">
                {showAllActivities ? "Show Less" : "View All"}
              </button>
            </div>

            <div className="space-y-4 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2.5px] before:bg-slate-100 dark:before:bg-slate-800/80">
              {(showAllActivities ? activities : activities.slice(0, 3)).map((act, idx) => (
                <div key={idx} className="flex gap-3 relative z-10 font-sans text-xs bg-white dark:bg-sd-surface-container">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${act.iconBg}`}>
                    <span className={`material-symbols-outlined text-[16px] ${act.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>{act.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{act.title}</p>
                      <span className="text-[9px] text-slate-400 font-semibold shrink-0 ml-2">{act.timestamp}</span>
                    </div>
                    <p className="text-[10px] text-slate-455 dark:text-slate-400 font-semibold">{act.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Work Preferences */}
          <section className="bg-white dark:bg-sd-surface-container rounded-2xl border border-slate-150 dark:border-slate-800 p-5 shadow-sm md:col-span-2 lg:col-span-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-sans">Work Preferences</h3>
              <button type="button" onClick={openPrefsModal} className="text-[10px] font-bold text-orange-500 cursor-pointer hover:underline font-sans">Edit</button>
            </div>
            <div className="space-y-4 font-sans text-xs">
              {preferences.map((pref, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-orange-500 text-[16px]">{pref.icon}</span>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-455 font-bold uppercase tracking-wider leading-none mb-1">{pref.label}</p>
                    <p className="font-extrabold text-slate-800 dark:text-slate-200 leading-tight">{pref.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Badges & Achievements */}
        <section className="bg-white dark:bg-sd-surface-container rounded-2xl border border-slate-150 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 font-sans">Badges & Achievements</h3>
            <span className="text-xs font-bold text-orange-500 cursor-pointer hover:underline font-sans">View All</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {badges.map((badge, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center text-center p-4 rounded-2xl border border-transparent hover:border-slate-150 dark:hover:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-all group font-sans"
              >
                <div className={`w-14 h-14 ${badge.bgClass} rounded-2xl flex items-center justify-center mb-3.5 rotate-3 group-hover:rotate-0 transition-transform shadow-lg ${badge.shadowClass} shrink-0`}>
                  <span className="material-symbols-outlined text-white text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {badge.icon}
                  </span>
                </div>
                <p className="font-extrabold text-xs text-slate-850 dark:text-slate-250 mb-1 leading-snug">{badge.title}</p>
                <p className="text-[10px] text-slate-400 font-semibold mb-2 leading-relaxed">{badge.desc}</p>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{badge.earned}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Personal Information Edit Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-sd-surface-container rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl w-full max-w-sm">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 mb-1 font-sans">Edit Personal Information</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 mb-4 font-sans leading-relaxed">
              Update your contact details below.
            </p>
            <form onSubmit={handleSaveInfo} className="space-y-4 font-sans text-xs">
              <div>
                <label htmlFor="edit-name" className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">Full Name</label>
                <input
                  id="edit-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-email" className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">Email</label>
                <input
                  id="edit-email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-phone" className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">Phone</label>
                <input
                  id="edit-phone"
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInfoModal(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-640 dark:text-slate-400 rounded-xl font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-orange-505 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Work Preferences Edit Modal */}
      {showPrefsModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-sd-surface-container rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl w-full max-w-sm">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 mb-1 font-sans">Edit Work Preferences</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 mb-4 font-sans leading-relaxed">
              Update shift and assignment preferences.
            </p>
            <form onSubmit={handleSavePrefs} className="space-y-4 font-sans text-xs">
              <div>
                <label htmlFor="edit-area" className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">Preferred Area</label>
                <input
                  id="edit-area"
                  type="text"
                  value={editPreferredArea}
                  onChange={(e) => setEditPreferredArea(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-shift" className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">Preferred Shift</label>
                <input
                  id="edit-shift"
                  type="text"
                  value={editPreferredShift}
                  onChange={(e) => setEditPreferredShift(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-days" className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">Days Available</label>
                <input
                  id="edit-days"
                  type="text"
                  value={editDaysAvailable}
                  onChange={(e) => setEditDaysAvailable(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-break" className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">Break Preference</label>
                <input
                  id="edit-break"
                  type="text"
                  value={editBreakPreference}
                  onChange={(e) => setEditBreakPreference(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-tasks" className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">Preferred Task Types</label>
                <input
                  id="edit-tasks"
                  type="text"
                  value={editPreferredTaskTypes}
                  onChange={(e) => setEditPreferredTaskTypes(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPrefsModal(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-640 dark:text-slate-400 rounded-xl font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-sd-surface-container rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl w-full max-w-sm">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 mb-1 font-sans">Change Password</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 mb-4 font-sans leading-relaxed">
              Choose a strong and secure new password.
            </p>
            <form onSubmit={handleSavePassword} className="space-y-4 font-sans text-xs">
              {passwordError && (
                <div className="p-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 font-bold mb-2">
                  {passwordError}
                </div>
              )}
              <div>
                <label htmlFor="current-pw" className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">Current Password</label>
                <input
                  id="current-pw"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
              <div>
                <label htmlFor="new-pw" className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">New Password</label>
                <input
                  id="new-pw"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
              <div>
                <label htmlFor="confirm-pw" className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">Confirm New Password</label>
                <input
                  id="confirm-pw"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  required
                  onPaste={(e) => e.preventDefault()}
                  onDrop={(e) => e.preventDefault()}
                  autoComplete="new-password"
                />
                <p className="text-[10px] mt-1 text-slate-500 dark:text-slate-400">Please re-enter your password manually.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-640 dark:text-slate-400 rounded-xl font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all active:scale-95"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      <ImageCropperModal
        isOpen={showCropModal}
        imageSrc={cropImageSrc}
        onClose={() => setShowCropModal(false)}
        onConfirm={handleCropConfirm}
      />
    </>
  );
}