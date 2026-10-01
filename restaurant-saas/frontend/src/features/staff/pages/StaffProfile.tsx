import React, { useEffect, useState } from 'react';
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChefHat,
  Circle,
  Clock3,
  Mail,
  MapPinned,
  Menu,
  Pencil,
  Phone,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { dispatchProfileSync } from '../../../shared/profile/profileSync';
import type { ProfileData } from '../api/profile.api';
import { NotificationWindow } from '../components/NotificationWindow';
import { useProfile } from '../hooks/useProfile';
import { useNotifications } from '../hooks/useNotifications';
import { useThemeMode } from '../../../shared/hooks/useThemeMode';
import { navbarDarkTheme, navbarLightTheme } from '../../../shared/theme';


type ToneKey = 'purple' | 'amber' | 'blue' | 'green';
type AreaToneKey = 'purple' | 'pink' | 'amber' | 'orange' | 'green';
type ActivityToneKey = 'slate' | 'teal' | 'red' | 'green';
type PerformanceToneKey = 'green' | 'amber' | 'red';
type NavItem = {
  label: string;
  Icon: typeof UserCog;
  to: string;
};

const cardShadow = (isDark: boolean) =>
  isDark ? '0 18px 45px rgba(0,0,0,0.12)' : '0 14px 35px rgba(15,23,42,0.06)';

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'JS';

const donutStyle = {
  width: '160px',
  height: '160px',
  borderRadius: '50%',
  background: 'conic-gradient(#22c55e 0deg 331.2deg, #fbbf24 331.2deg 352.8deg, #ef4444 352.8deg 360deg)',
  display: 'grid',
  placeItems: 'center',
  margin: '0 auto',
} as const;

const metricToneStyles: Record<ToneKey, { color: string; bg: string }> = {
  purple: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.14)' },
  amber: { color: '#f59e0b', bg: 'rgba(245,158,11,0.14)' },
  blue: { color: '#3b82f6', bg: 'rgba(59,130,246,0.14)' },
  green: { color: '#22c55e', bg: 'rgba(34,197,94,0.14)' },
};

const areaToneStyles: Record<AreaToneKey, { color: string; bg: string }> = {
  purple: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.14)' },
  pink: { color: '#fb7185', bg: 'rgba(251,113,133,0.14)' },
  amber: { color: '#f59e0b', bg: 'rgba(245,158,11,0.14)' },
  orange: { color: '#f97316', bg: 'rgba(249,115,22,0.14)' },
  green: { color: '#34d399', bg: 'rgba(52,211,153,0.14)' },
};

const activityToneStyles: Record<ActivityToneKey, { dotColor: string; badgeColor: string; badgeBg: string }> = {
  slate: { dotColor: '#94a3b8', badgeColor: '#cbd5e1', badgeBg: 'rgba(148,163,184,0.14)' },
  teal: { dotColor: '#34d399', badgeColor: '#2dd4bf', badgeBg: 'rgba(45,212,191,0.14)' },
  red: { dotColor: '#f97316', badgeColor: '#f87171', badgeBg: 'rgba(248,113,113,0.14)' },
  green: { dotColor: '#22c55e', badgeColor: '#22c55e', badgeBg: 'rgba(34,197,94,0.14)' },
};

const performanceToneColor: Record<PerformanceToneKey, string> = {
  green: '#22c55e',
  amber: '#fbbf24',
  red: '#ef4444',
};

const metricIcons = {
  'Orders Served': CheckCircle2,
  'Guest Rating': Star,
  'Avg Table Turnover': Clock3,
  'Shift Attendance': Users,
} as unknown as Record<string, typeof CheckCircle2>;

// Fallback star icon for rating metric
function Star({ size, color }: { size: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

const staffNavItems: NavItem[] = [
  { label: 'Staff Management', Icon: Users, to: '/staff' },
  { label: 'Notifications', Icon: Bell, to: '/staff/notifications' },
  { label: 'Profile', Icon: UserCog, to: '/staff/profile' },
  { label: 'Settings', Icon: Settings, to: '/staff/settings' },
];

const StaffProfile = () => {
  const { user } = useAuth();
  const { profile, loading, error, saveProfile } = useProfile();
  const { unreadCount } = useNotifications();
  const { isDark, toggleThemeMode } = useThemeMode();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNotificationWindowOpen, setIsNotificationWindowOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formJoinDate, setFormJoinDate] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAvatarUrl, setFormAvatarUrl] = useState<string | null>(null);

  const theme = isDark ? navbarDarkTheme : navbarLightTheme;

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    html.style.margin = '0';
    html.style.padding = '0';
    html.style.height = '100%';
    html.style.overflow = 'hidden';
    body.style.margin = '0';
    body.style.padding = '0';
    body.style.height = '100%';
    body.style.overflow = 'hidden';
    body.style.background = theme.pageBg;

    return () => {
      html.style.cssText = '';
      body.style.cssText = '';
    };
  }, [theme.pageBg]);

  useEffect(() => {
    if (!profile) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing form fields from profile data
    setFormName(profile.name);
    setFormJoinDate(profile.joinDate || '');
    setFormRole(profile.role);
    setFormPhone(profile.phone);
    setFormAvatarUrl(profile.avatarUrl ?? null);
  }, [profile]);

  if (!profile) {
    return null;
  }

  const roleOptions = ['Manager', 'Server', 'Chef', 'Bartender'];

  const identity = {
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    role: profile.role,
    department: profile.department,
    joinDate: profile.joinDate || 'Not added yet',
    employeeId: profile.employeeId || 'STF-1001',
  };

  const openEditModal = () => {
    setFormName(profile.name);
    setFormJoinDate(profile.joinDate || '');
    setFormRole(profile.role);
    setFormPhone(profile.phone);
    setFormAvatarUrl(profile.avatarUrl ?? null);
    setIsEditOpen(true);
  };

  const closeEditModal = () => setIsEditOpen(false);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    const updates: Partial<ProfileData> = {
      name: formName.trim() || profile.name,
      joinDate: formJoinDate,
      role: formRole,
      phone: formPhone.trim() || profile.phone,
      avatarUrl: formAvatarUrl,
    };

    await saveProfile(updates);
    const syncedProfile: ProfileData = {
      ...profile,
      ...updates,
      name: updates.name || profile.name,
      role: updates.role || profile.role,
      phone: updates.phone || profile.phone,
      joinDate: updates.joinDate || profile.joinDate,
      avatarUrl: updates.avatarUrl ?? profile.avatarUrl ?? null,
    };

    dispatchProfileSync({
      previousName: profile.name,
      roleContext: 'staff',
      profile: syncedProfile,
    });

    closeEditModal();
  };

  return (
    <div
      style={{
        display: 'flex',
        position: 'fixed',
        inset: 0,
        background: theme.pageBg,
        color: theme.textPrimary,
        fontFamily: theme.font,
        overflow: 'hidden',
      }}
    >
      {isMobile && sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            zIndex: 40,
          }}
        />
      )}

      <aside
        style={{
          width: isMobile ? '240px' : '220px',
          flexShrink: 0,
          background: theme.sidebarBg,
          borderRight: `1px solid ${theme.sidebarBorder}`,
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 12px',
          gap: '4px',
          overflowY: 'auto',
          ...(isMobile
            ? {
                position: 'fixed',
                top: 0,
                left: 0,
                height: '100%',
                zIndex: 50,
                transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 0.25s ease',
              }
            : {}),
        }}
      >
        {isMobile && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', background: '#f97316', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChefHat size={15} color="#fff" />
              </div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: theme.textPrimary, margin: 0 }}>Smart Dining</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textSecondary, padding: '4px' }}>
              <X size={18} />
            </button>
          </div>
        )}

        {!isMobile && (
          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', padding: '0 6px' }}>
            <div style={{ width: '32px', height: '32px', background: '#f97316', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ChefHat size={17} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: theme.textPrimary, margin: 0 }}>Smart Dining</p>
              <p style={{ fontSize: '10px', color: theme.textMuted, margin: 0 }}>Service Staff</p>
            </div>
          </div>
        )}

        {staffNavItems.map(({ label, Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            onClick={(event) => {
              if (label === 'Notifications') {
                event.preventDefault();
                setIsNotificationWindowOpen(true);
              }
              if (isMobile) setSidebarOpen(false);
            }}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: isActive ? 600 : 400,
              background: isActive ? '#f97316' : 'transparent',
              color: isActive ? '#fff' : theme.navInactive,
              width: '100%',
              textAlign: 'left',
              transition: 'all 0.15s',
              textDecoration: 'none',
              fontFamily: theme.font,
              boxSizing: 'border-box',
              position: 'relative',
            })}
          >
            <Icon size={15} />
            <span style={{ flex: 1 }}>{label}</span>
            {label === 'Notifications' && unreadCount > 0 && (
              <span style={{
                background: '#ef4444',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 700,
                borderRadius: '999px',
                padding: '2px 6px',
                minWidth: '16px',
                textAlign: 'center',
                display: 'inline-block',
                lineHeight: 1,
              }}>
                {unreadCount}
              </span>
            )}
          </NavLink>
        ))}

        <div style={{ flex: 1 }} />

        <div style={{ background: theme.miniCardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: '10px', padding: '10px', marginTop: '8px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
            <Bell size={14} color="#f97316" />
            <p style={{ fontSize: '12px', fontWeight: 600, color: theme.textPrimary, margin: 0 }}>Need help?</p>
          </div>
          <p style={{ fontSize: '10px', color: theme.textMuted, margin: '0 0 8px 0' }}>Visit our help center or contact support.</p>
          <button style={{ width: '100%', padding: '6px', borderRadius: '7px', background: 'transparent', border: `1px solid ${theme.cardBorder}`, color: theme.textSecondary, fontSize: '11px', cursor: 'pointer', fontFamily: theme.font }}>
            Go to Help Center →
          </button>
        </div>

        <div style={{ background: theme.miniCardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: '10px', padding: '10px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
          <div style={{ width: '28px', height: '28px', background: '#f97316', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff', fontSize: '10px', fontWeight: 700, overflow: 'hidden' }}>
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={identity.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              getInitials(identity.name)
            )}
          </div>
          <div>
            <p style={{ fontSize: '12px', fontWeight: 600, color: theme.textPrimary, margin: 0 }}>{identity.name}</p>
            <p style={{ fontSize: '10px', color: theme.textMuted, margin: 0 }}>{identity.role}</p>
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: isMobile ? '8px 12px' : '11px 20px',
            background: theme.sidebarBg,
            borderBottom: `1px solid ${theme.sidebarBorder}`,
            flexShrink: 0,
          }}
        >
          {isMobile && (
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textSecondary, padding: '4px', display: 'flex', alignItems: 'center' }}>
              <Menu size={20} />
            </button>
          )}
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: theme.textPrimary, margin: 0 }}>Profile Overview</p>
            <p style={{ fontSize: '10px', color: theme.textMuted, margin: 0 }}>
              {user?.restaurantName || 'Smart Dining'} · Staff Operations
            </p>
          </div>
        </div>

        <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: isMobile ? '18px' : '24px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gap: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: theme.textPrimary, margin: 0 }}>Profile</h1>
                <p style={{ fontSize: '14px', color: theme.textMuted, marginTop: '6px', marginBottom: 0 }}>
                  View and manage your service captain details
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={toggleThemeMode}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    border: `1px solid ${theme.cardBorder}`,
                    background: theme.cardBg,
                    color: theme.textSecondary,
                    fontSize: '12px',
                    fontWeight: 500,
                    fontFamily: theme.font,
                  }}
                >
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>
                <button
                  type="button"
                  onClick={openEditModal}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    border: `1px solid ${theme.cardBorder}`,
                    background: theme.cardBg,
                    color: theme.textPrimary,
                    fontSize: '12px',
                    fontWeight: 600,
                    fontFamily: theme.font,
                  }}
                >
                  <Pencil size={14} />
                  Edit Profile
                </button>
              </div>
            </div>

            <section
              style={{
                background: theme.cardBg,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: '16px',
                padding: isMobile ? '18px' : '20px',
                boxShadow: cardShadow(isDark),
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div
                    style={{
                      width: '76px',
                      height: '76px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #f97316 0%, #fb7185 100%)',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#fff',
                      fontSize: '24px',
                      fontWeight: 700,
                      flexShrink: 0,
                      overflow: 'hidden',
                    }}
                  >
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt={identity.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      getInitials(identity.name)
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <p style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: theme.textPrimary }}>{identity.name}</p>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '10px',
                          fontWeight: 600,
                          color: '#f59e0b',
                          background: 'rgba(245,158,11,0.14)',
                        }}
                      >
                        {identity.role}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gap: '8px', marginTop: '10px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: theme.textSecondary }}>
                        <Mail size={14} /> {identity.email}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: theme.textSecondary }}>
                        <Phone size={14} /> {identity.phone}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: theme.textSecondary }}>
                        <CalendarDays size={14} /> Joined: {identity.joinDate}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: theme.textSecondary }}>
                        <ShieldCheck size={14} /> Employee ID: {identity.employeeId}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ alignSelf: 'stretch', display: 'flex', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      background: theme.miniCardBg,
                      border: `1px solid ${theme.cardBorder}`,
                      borderRadius: '14px',
                      padding: '12px 14px',
                      minWidth: isMobile ? '100%' : '180px',
                    }}
                  >
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: theme.textPrimary }}>{identity.department}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: theme.textMuted }}>Shared across service captain dashboard views</p>
                  </div>
                </div>
              </div>
            </section>

            <section style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, minmax(0, 1fr))', gap: '16px' }}>
              {(profile.metrics ?? []).map(({ label, value, delta, tone }) => {
                const palette = metricToneStyles[(tone ?? 'purple') as ToneKey];
                const Icon = metricIcons[label] ?? BriefcaseBusiness;

                return (
                  <div
                    key={label}
                    style={{
                      background: theme.cardBg,
                      border: `1px solid ${theme.cardBorder}`,
                      borderRadius: '16px',
                      padding: '18px',
                      boxShadow: cardShadow(isDark),
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '12px',
                        display: 'grid',
                        placeItems: 'center',
                        background: palette.bg,
                        marginBottom: '16px',
                      }}
                    >
                      <Icon size={18} color={palette.color} />
                    </div>
                    <p style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: theme.textPrimary }}>{value}</p>
                    <p style={{ margin: '8px 0 0', fontSize: '12px', color: theme.textSecondary }}>{label}</p>
                    <p style={{ margin: '10px 0 0', fontSize: '11px', color: '#22c55e', fontWeight: 600 }}>{delta}</p>
                  </div>
                );
              })}
            </section>

            <section style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.15fr 1.15fr 0.9fr', gap: '16px' }}>
              <div
                style={{
                  background: theme.cardBg,
                  border: `1px solid ${theme.cardBorder}`,
                  borderRadius: '16px',
                  padding: '18px',
                  boxShadow: cardShadow(isDark),
                }}
              >
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: theme.textPrimary }}>Areas Under Supervision</p>
                <div style={{ display: 'grid', gap: '12px', marginTop: '18px' }}>
                  {(profile.areas ?? []).map(({ label, tone }) => {
                    const palette = areaToneStyles[(tone ?? 'purple') as AreaToneKey];

                    return (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '8px',
                              display: 'grid',
                              placeItems: 'center',
                              background: palette.bg,
                            }}
                          >
                            <MapPinned size={13} color={palette.color} />
                          </div>
                          <span style={{ fontSize: '12px', color: theme.textSecondary }}>{label}</span>
                        </div>
                        <CheckCircle2 size={15} color="#22c55e" />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div
                style={{
                  background: theme.cardBg,
                  border: `1px solid ${theme.cardBorder}`,
                  borderRadius: '16px',
                  padding: '18px',
                  boxShadow: cardShadow(isDark),
                }}
              >
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: theme.textPrimary }}>Current Shift</p>
                <div style={{ display: 'grid', gap: '14px', marginTop: '18px' }}>
                  {(profile.shift ?? []).map(({ label, value, tone }) => (
                    <div
                      key={label}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '120px 1fr',
                        gap: '8px',
                        alignItems: 'center',
                        paddingBottom: '12px',
                        borderBottom: `1px solid ${theme.cardBorder}`,
                      }}
                    >
                      <span style={{ fontSize: '12px', color: theme.textMuted }}>{label}</span>
                      {tone === 'success' ? (
                        <span
                          style={{
                            width: 'fit-content',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '999px',
                            background: 'rgba(34,197,94,0.14)',
                            color: '#22c55e',
                            fontSize: '11px',
                            fontWeight: 700,
                          }}
                        >
                          <Check size={12} />
                          {value}
                        </span>
                      ) : (
                        <span style={{ fontSize: '12px', color: theme.textPrimary, fontWeight: 500 }}>{value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  background: theme.cardBg,
                  border: `1px solid ${theme.cardBorder}`,
                  borderRadius: '16px',
                  padding: '18px',
                  boxShadow: cardShadow(isDark),
                }}
              >
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: theme.textPrimary }}>Monthly Performance</p>
                <div style={{ marginTop: '18px' }}>
                  <div style={donutStyle}>
                     <div
                      style={{
                        width: '104px',
                        height: '104px',
                        borderRadius: '50%',
                        background: theme.cardBg,
                        border: `1px solid ${theme.cardBorder}`,
                        display: 'grid',
                        placeItems: 'center',
                        textAlign: 'center',
                      }}
                    >
                      <div>
                        <p style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: theme.textPrimary }}>{profile.performance?.[0]?.value ?? '92%'}</p>
                        <p style={{ margin: '4px 0 0', fontSize: '10px', color: theme.textMuted }}>Completion Rate</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '10px', marginTop: '18px' }}>
                    {(profile.performance ?? []).map((item) => {
                      const color = performanceToneColor[(item.tone ?? 'green') as PerformanceToneKey];
                      return (
                        <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Circle size={10} fill={color} color={color} />
                            <span style={{ fontSize: '12px', color: theme.textSecondary }}>{item.label}</span>
                          </div>
                          <span style={{ fontSize: '12px', color: theme.textPrimary, fontWeight: 600 }}>{item.value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            <section
              style={{
                background: theme.cardBg,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: '16px',
                padding: '18px',
                boxShadow: cardShadow(isDark),
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: theme.textPrimary }}>Recent Activity</p>
                  <p style={{ margin: '6px 0 0', fontSize: '12px', color: theme.textSecondary }}>
                    {loading ? 'Refreshing profile information...' : 'Latest service operations updates'}
                  </p>
                </div>
                <button
                  type="button"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#f59e0b',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 700,
                    fontFamily: theme.font,
                    padding: 0,
                  }}
                >
                  View All
                </button>
              </div>

              <div style={{ display: 'grid', gap: '14px', marginTop: '18px' }}>
                {(profile.activity ?? []).map((item) => {
                  const palette = activityToneStyles[(item.tone ?? 'slate') as ActivityToneKey];
                  return (
                    <div
                      key={`${item.time}-${item.action}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '88px 1fr auto',
                        gap: '14px',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: theme.textMuted, fontSize: '12px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: palette.dotColor, display: 'inline-block' }} />
                        {item.time}
                      </div>
                      <div style={{ fontSize: '12px', color: theme.textSecondary, lineHeight: 1.5 }}>{item.action}</div>
                      <span
                        style={{
                          justifySelf: isMobile ? 'start' : 'end',
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '6px 10px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: palette.badgeBg,
                          color: palette.badgeColor,
                        }}
                      >
                        {item.badge}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: '16px', fontSize: '12px', color: error ? '#ef4444' : theme.textMuted }}>
                {error ? error : 'Profile hooks and API types now support dashboard data blocks, with fallback mock data until backend fields are added.'}
              </div>
            </section>
          </div>
        </main>
      </div>

      {isEditOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(8, 12, 20, 0.82)', backdropFilter: 'blur(8px)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '520px', background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: '22px', boxShadow: '0 30px 80px rgba(0,0,0,0.18)', padding: '24px', position: 'relative' }}>
            <button onClick={closeEditModal} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: theme.textSecondary, cursor: 'pointer', fontSize: '16px' }}>×</button>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: theme.textPrimary, margin: 0, marginBottom: '10px' }}>Edit Profile</h2>
            <p style={{ fontSize: '12px', color: theme.textMuted, margin: '0 0 18px 0' }}>Update your shared profile details for the profile page and connected dashboard views.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: theme.textSecondary, fontSize: '12px' }}>
                Profile Picture
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', background: formAvatarUrl ? 'transparent' : 'linear-gradient(135deg, #f97316 0%, #fb7185 100%)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: '20px', fontWeight: 700 }}>
                    {formAvatarUrl ? <img src={formAvatarUrl} alt={formName || 'Profile'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getInitials(formName || profile.name)}
                  </div>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ color: theme.textSecondary, fontSize: '12px', fontFamily: theme.font }} />
                </div>
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: theme.textSecondary, fontSize: '12px' }}>
                Name
                <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Full name" style={{ border: `1px solid ${theme.cardBorder}`, borderRadius: '12px', padding: '10px 12px', background: theme.inputBg, color: theme.textPrimary, fontSize: '13px', fontFamily: theme.font }} />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: theme.textSecondary, fontSize: '12px' }}>
                Date of Joining
                <input type="date" value={formJoinDate} onChange={(e) => setFormJoinDate(e.target.value)} style={{ border: `1px solid ${theme.cardBorder}`, borderRadius: '12px', padding: '10px 12px', background: theme.inputBg, color: theme.textPrimary, fontSize: '13px', fontFamily: theme.font }} />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: theme.textSecondary, fontSize: '12px' }}>
                Role
                <select value={formRole} onChange={(e) => setFormRole(e.target.value)} style={{ border: `1px solid ${theme.cardBorder}`, borderRadius: '12px', padding: '10px 12px', background: theme.inputBg, color: theme.textPrimary, fontSize: '13px', fontFamily: theme.font }}>
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: theme.textSecondary, fontSize: '12px' }}>
                Phone Number
                <input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="+1 (555) 123-4567" style={{ border: `1px solid ${theme.cardBorder}`, borderRadius: '12px', padding: '10px 12px', background: theme.inputBg, color: theme.textPrimary, fontSize: '13px', fontFamily: theme.font }} />
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
              <button onClick={closeEditModal} style={{ background: theme.miniCardBg, color: theme.textPrimary, border: `1px solid ${theme.cardBorder}`, borderRadius: '12px', padding: '10px 18px', cursor: 'pointer', fontSize: '12px', fontFamily: theme.font }}>Cancel</button>
              <button onClick={handleSaveProfile} style={{ background: '#f97316', color: '#fff', border: 'none', borderRadius: '12px', padding: '10px 18px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, fontFamily: theme.font }}>
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      )}

      <NotificationWindow
        open={isNotificationWindowOpen}
        onClose={() => setIsNotificationWindowOpen(false)}
        theme={theme}
      />

      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${theme.cardBorder}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${theme.textMuted}; }
      `}</style>
    </div>
  );
};

export default StaffProfile;
