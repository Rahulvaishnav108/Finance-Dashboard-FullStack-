import React, { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ChefHat,
  Clock,
  Database,
  KeyRound,
  Languages,
  Lock,
  Mail,
  MapPin,
  Menu,
  Moon,
  Package,
  RotateCcw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { useThemeMode } from '../../../shared/hooks/useThemeMode';
import { NotificationWindow } from '../components/NotificationWindow';
import { useNotifications } from '../hooks/useNotifications';
import type { SettingsSection } from '../api/settings.api';

const darkTheme = {
  pageBg: '#0d0d0d',
  sidebarBg: '#141414',
  cardBg: '#1a1a1a',
  cardBorder: '#272727',
  inputBg: '#1a1a1a',
  miniCardBg: '#1f1f1f',
  textPrimary: '#f0f0f0',
  textSecondary: '#9a9a9a',
  textMuted: '#5a5a5a',
  sidebarBorder: '#242424',
  navInactive: '#7a7a7a',
  font: "'Plus Jakarta Sans', 'Inter', sans-serif",
  accent: '#f97316',
};

const lightTheme = {
  pageBg: '#f4f4f5',
  sidebarBg: '#ffffff',
  cardBg: '#ffffff',
  cardBorder: '#e8e8e8',
  inputBg: '#f0f0f0',
  miniCardBg: '#f8f8f8',
  textPrimary: '#111111',
  textSecondary: '#555555',
  textMuted: '#999999',
  sidebarBorder: '#eeeeee',
  navInactive: '#555555',
  font: "'Plus Jakarta Sans', 'Inter', sans-serif",
  accent: '#f97316',
};


const staffSidebarNav = [
  { label: 'Staff Management', Icon: Users, to: '/staff' },
  { label: 'Notifications', Icon: Bell, to: '/staff/notifications' },
  { label: 'Profile', Icon: UserCog, to: '/staff/profile' },
  { label: 'Settings', Icon: Settings, to: '/staff/settings' },
];

const settingSections: Array<{ id: SettingsSection; label: string; Icon: LucideIcon }> = [
  { id: 'general', label: 'General', Icon: Settings },
  { id: 'notifications', label: 'Notifications', Icon: Bell },
  { id: 'staffSettings', label: 'Staff Settings', Icon: Users },
  { id: 'security', label: 'Security', Icon: ShieldCheck },
  { id: 'integrations', label: 'Integrations', Icon: Database },
];

const notificationIcons: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  calendar: CalendarClock,
  alert: AlertTriangle,
  mail: Mail,
  package: Package,
  bell: Bell,
};

const staffOptions = ['30 min', '5 tasks', '8 hours', '4 staff', '45 min', '6 tasks', '10 hours', '5 staff'];

const Toggle = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) => (
  <button
    type="button"
    aria-label={label}
    aria-pressed={checked}
    onClick={onChange}
    style={{
      width: '34px',
      height: '18px',
      borderRadius: '999px',
      border: 'none',
      background: checked ? '#f97316' : '#3a3a3a',
      padding: '2px',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: checked ? 'flex-end' : 'flex-start',
      alignItems: 'center',
      flexShrink: 0,
    }}
  >
    <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#fff', display: 'block' }} />
  </button>
);

const StaffSettings = () => {
  const { unreadCount } = useNotifications();
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
  const [notice, setNotice] = useState('');
  const [isNotificationWindowOpen, setIsNotificationWindowOpen] = useState(false);
  const { isDark, toggleThemeMode } = useThemeMode();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const {
    settings,
    loading,
    saving,
    error,
    saveSettings,
    updateDraft,
    toggleNotification,
    updateStaffSetting,
    toggleIntegration,
    resetSettings,
  } = useSettings();

  const theme = isDark ? darkTheme : lightTheme;

  const sectionTitle = useMemo(
    () => settingSections.find((section) => section.id === activeSection)?.label ?? 'General',
    [activeSection]
  );

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

  const card = (extra?: React.CSSProperties): React.CSSProperties => ({
    background: theme.cardBg,
    border: `1px solid ${theme.cardBorder}`,
    borderRadius: '14px',
    padding: '16px',
    ...extra,
  });

  const labelStyle: React.CSSProperties = {
    display: 'grid',
    gap: '7px',
    color: theme.textSecondary,
    fontSize: '11px',
    fontWeight: 600,
  };

  const controlStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '36px',
    border: `1px solid ${theme.cardBorder}`,
    borderRadius: '8px',
    background: theme.inputBg,
    color: theme.textPrimary,
    padding: '9px 10px',
    fontSize: '12px',
    fontFamily: theme.font,
    outline: 'none',
  };

  const showSavedNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2200);
  };

  const handleSave = async () => {
    const saved = await saveSettings(settings);
    showSavedNotice(saved ? 'Settings saved locally for service staff dashboard.' : 'Unable to save settings.');
  };

  const handleReset = async () => {
    const reset = await resetSettings();
    showSavedNotice(reset ? 'Settings reset to defaults.' : 'Unable to reset settings.');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        position: 'fixed',
        inset: 0,
        background: theme.pageBg,
        color: theme.textPrimary,
        fontFamily: theme.font,
        overflow: isMobile ? 'auto' : 'hidden',
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
          gap: '3px',
          overflowY: 'auto',
          transition: 'transform 0.25s ease',
          ...(isMobile
            ? {
                position: 'fixed',
                top: 0,
                left: 0,
                height: '100%',
                zIndex: 50,
                transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
              }
            : {}),
        }}
      >
        <div style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', background: '#f97316', borderRadius: '8px', display: 'grid', placeItems: 'center' }}>
              <ChefHat size={17} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: theme.textPrimary, margin: 0 }}>Smart Dining</p>
              <p style={{ fontSize: '10px', color: theme.textMuted, margin: 0 }}>Service Staff</p>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textSecondary, padding: '4px' }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {staffSidebarNav.map(({ label, Icon, to }) => (
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
              fontSize: '12px',
              fontWeight: isActive ? 600 : 400,
              background: isActive ? '#f97316' : 'transparent',
              color: isActive ? '#fff' : theme.navInactive,
              textDecoration: 'none',
              width: '100%',
              boxSizing: 'border-box',
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

        <div style={{ ...card({ padding: '10px', display: 'flex', alignItems: 'center', gap: '8px' }), background: theme.miniCardBg }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f97316', color: '#fff', display: 'grid', placeItems: 'center', fontSize: '10px', fontWeight: 800 }}>JS</div>
          <div>
            <p style={{ margin: 0, color: theme.textPrimary, fontSize: '12px', fontWeight: 600 }}>John Smith</p>
            <p style={{ margin: 0, color: theme.textMuted, fontSize: '10px' }}>Manager</p>
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, overflowY: isMobile ? 'visible' : 'auto', padding: isMobile ? '12px' : '16px 18px 24px' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px', flexWrap: 'wrap' }}>
          {isMobile && (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textSecondary, padding: '4px', display: 'flex', alignItems: 'center' }}
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
          )}
          <div style={{ position: 'relative', width: isMobile ? '100%' : '310px', maxWidth: '100%' }}>
            <Search size={13} color={theme.textMuted} style={{ position: 'absolute', left: '11px', top: '10px' }} />
            <input
              placeholder="Search settings..."
              style={{ ...controlStyle, paddingLeft: '32px', minHeight: '34px' }}
            />
          </div>
          <div style={{ flex: 1 }} />
          <button
            type="button"
            onClick={toggleThemeMode}
            style={{ width: '32px', height: '32px', borderRadius: '50%', border: `1px solid ${theme.cardBorder}`, background: theme.cardBg, color: theme.textSecondary, display: 'grid', placeItems: 'center', cursor: 'pointer' }}
            aria-label={isDark ? 'Use light mode' : 'Use dark mode'}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#f97316', color: '#fff', display: 'grid', placeItems: 'center', fontSize: '10px', fontWeight: 800 }}>JS</div>
            {!isMobile && (
              <div>
                <p style={{ margin: 0, color: theme.textPrimary, fontSize: '12px', fontWeight: 700 }}>John Smith</p>
                <p style={{ margin: 0, color: theme.textMuted, fontSize: '10px' }}>Manager</p>
              </div>
            )}
          </div>
        </header>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-start', gap: '16px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: 0, color: theme.textPrimary, fontSize: '22px', fontWeight: 800 }}>Settings</h1>
            <p style={{ margin: '4px 0 0', color: theme.textMuted, fontSize: '12px' }}>Manage service captain preferences and configurations</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
            {notice && <span style={{ color: '#22c55e', fontSize: '11px', fontWeight: 600 }}>{notice}</span>}
            {error && <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: 600 }}>{error}</span>}
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', border: `1px solid ${theme.cardBorder}`, borderRadius: '8px', padding: '9px 12px', background: theme.cardBg, color: theme.textSecondary, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '11px', fontWeight: 700 }}
            >
              <RotateCcw size={13} />
              Reset
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', border: 'none', borderRadius: '8px', padding: '10px 13px', background: '#f97316', color: '#fff', cursor: saving || loading ? 'not-allowed' : 'pointer', fontSize: '11px', fontWeight: 800, opacity: saving || loading ? 0.75 : 1 }}
            >
              <Save size={13} />
              {saving ? 'Saving' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '210px minmax(0, 1fr)', gap: '16px', alignItems: 'start' }}>
          <nav
            style={{
              ...card({ padding: '8px', position: isMobile ? 'static' : 'sticky', top: 0 }),
              display: 'flex',
              flexDirection: isMobile ? 'row' : 'column',
              overflowX: isMobile ? 'auto' : 'visible',
              whiteSpace: isMobile ? 'nowrap' : 'normal',
              gap: isMobile ? '4px' : '2px',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {settingSections.map(({ id, label, Icon }) => {
              const isActive = activeSection === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveSection(id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px',
                    background: isActive ? 'rgba(249,115,22,0.16)' : 'transparent',
                    color: isActive ? '#f97316' : theme.textSecondary,
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: isActive ? 700 : 500,
                    textAlign: 'left',
                    fontFamily: theme.font,
                    flexShrink: isMobile ? 0 : undefined,
                  }}
                >
                  <Icon size={14} />
                  {label}
                </button>
              );
            })}
          </nav>

          <div style={{ display: 'grid', gap: '12px' }}>
            <section style={card()}>
              <div style={{ marginBottom: '14px' }}>
                <h2 style={{ margin: 0, fontSize: '14px', color: theme.textPrimary }}>{sectionTitle}</h2>
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: theme.textMuted }}>
                  Configure configurations tailored to staff and guests operations
                </p>
              </div>

              {activeSection === 'general' && (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                  <label style={labelStyle}>
                    Restaurant Name
                    <input value={settings.restaurantName} onChange={(event) => updateDraft({ restaurantName: event.target.value })} style={controlStyle} />
                  </label>
                  <label style={labelStyle}>
                    Timezone
                    <select value={settings.timezone} onChange={(event) => updateDraft({ timezone: event.target.value })} style={controlStyle}>
                      <option>(GMT-05:00) Eastern Time (US & Canada)</option>
                      <option>(GMT+05:30) India Standard Time</option>
                      <option>(GMT+00:00) London</option>
                    </select>
                  </label>
                  <label style={labelStyle}>
                    Date Format
                    <select value={settings.dateFormat} onChange={(event) => updateDraft({ dateFormat: event.target.value })} style={controlStyle}>
                      <option>MM/DD/YYYY</option>
                      <option>DD/MM/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </label>
                  <label style={labelStyle}>
                    Time Format
                    <select value={settings.timeFormat} onChange={(event) => updateDraft({ timeFormat: event.target.value as '12h' | '24h' })} style={controlStyle}>
                      <option value="12h">12 Hour (AM/PM)</option>
                      <option value="24h">24 Hour</option>
                    </select>
                  </label>
                  <label style={labelStyle}>
                    Language
                    <select value={settings.language} onChange={(event) => updateDraft({ language: event.target.value })} style={controlStyle}>
                      <option>English</option>
                      <option>Hindi</option>
                      <option>Spanish</option>
                    </select>
                  </label>
                  <label style={labelStyle}>
                    Location
                    <input value={settings.restaurantLocation} onChange={(event) => updateDraft({ restaurantLocation: event.target.value })} style={controlStyle} />
                  </label>
                </div>
              )}

              {activeSection === 'notifications' && (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                  {settings.notifications.filter(item => item.id === 'shift-changes' || item.id === 'critical-alerts' || item.id === 'push-notifications' || item.id === 'email-notifications').map((item) => {
                    const Icon = notificationIcons[item.icon] || Bell;
                    return (
                      <div key={item.id} style={{ ...card({ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }), background: theme.miniCardBg }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(249,115,22,0.12)', display: 'grid', placeItems: 'center', color: '#f97316' }}>
                          <Icon size={16} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, color: theme.textPrimary, fontSize: '12px', fontWeight: 700 }}>{item.title}</p>
                          <p style={{ margin: '3px 0 0', color: theme.textMuted, fontSize: '10px' }}>{item.description}</p>
                        </div>
                        <Toggle checked={item.enabled} onChange={() => toggleNotification(item.id)} label={`Toggle ${item.title}`} />
                      </div>
                    );
                  })}
                </div>
              )}

              {activeSection === 'staffSettings' && (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, minmax(0, 1fr))', gap: '10px' }}>
                  {settings.staffSettings.map((item) => (
                    <label key={item.id} style={labelStyle}>
                      {item.label}
                      <select value={item.value} onChange={(event) => updateStaffSetting(item.id, event.target.value)} style={controlStyle}>
                        {staffOptions.map((option) => <option key={`${item.id}-${option}`}>{option}</option>)}
                      </select>
                    </label>
                  ))}
                </div>
              )}

              {activeSection === 'security' && (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, minmax(0, 1fr))', gap: '10px' }}>
                  {[
                    { title: 'Change Password', desc: 'Update your account password', Icon: KeyRound, action: <ChevronRight size={15} /> },
                    { title: 'Two Factor Authentication', desc: settings.twoFactorAuthentication ? 'Adds an extra layer of security' : 'Currently disabled', Icon: ShieldCheck, action: <Toggle checked={settings.twoFactorAuthentication} onChange={() => updateDraft({ twoFactorAuthentication: !settings.twoFactorAuthentication })} label="Toggle two factor authentication" /> },
                    { title: 'Session Management', desc: settings.sessionTimeout, Icon: Clock, action: <ChevronRight size={15} /> },
                    { title: 'Login History', desc: settings.loginHistoryEnabled ? 'View recent login activity' : 'Login history disabled', Icon: Lock, action: <Toggle checked={settings.loginHistoryEnabled} onChange={() => updateDraft({ loginHistoryEnabled: !settings.loginHistoryEnabled })} label="Toggle login history" /> },
                  ].map((item) => (
                    <button
                      key={item.title}
                      type="button"
                      style={{ ...card({ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }), background: theme.miniCardBg, color: theme.textPrimary, cursor: 'pointer' }}
                    >
                      <item.Icon size={16} color="#f97316" />
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'block', color: theme.textPrimary, fontSize: '12px', fontWeight: 700 }}>{item.title}</span>
                        <span style={{ display: 'block', color: theme.textMuted, fontSize: '10px', marginTop: '3px' }}>{item.desc}</span>
                      </span>
                      {item.action}
                    </button>
                  ))}
                </div>
              )}

              {activeSection === 'integrations' && (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(5, minmax(0, 1fr))', gap: '10px' }}>
                  {settings.integrations.slice(0, 3).map((item) => {
                    const statusColor = item.status === 'connected' ? '#22c55e' : item.status === 'error' ? '#ef4444' : '#f59e0b';
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleIntegration(item.id)}
                        style={{ ...card({ padding: '12px', display: 'grid', gap: '8px', textAlign: 'left', cursor: 'pointer' }), background: theme.miniCardBg }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircle2 size={15} color={statusColor} />
                          <p style={{ margin: 0, color: theme.textPrimary, fontSize: '11px', fontWeight: 700 }}>{item.name}</p>
                        </div>
                        <p style={{ margin: 0, color: theme.textMuted, fontSize: '10px' }}>{item.description}</p>
                        <span style={{ color: statusColor, fontSize: '10px', fontWeight: 800, textTransform: 'capitalize' }}>{item.status}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            <section style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))', gap: '10px' }}>
              {[
                { label: 'Language', value: settings.language, Icon: Languages, color: '#3b82f6' },
                { label: 'Timezone', value: settings.timezone.split(') ')[1] ?? settings.timezone, Icon: MapPin, color: '#22c55e' },
                { label: 'Notifications', value: `${settings.notifications.filter((item) => item.enabled).length} enabled`, Icon: Bell, color: '#f97316' },
                { label: 'Last Saved', value: new Date(settings.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), Icon: Clock, color: '#8b5cf6' },
              ].map((item) => (
                <div key={item.label} style={card({ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px' })}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: `${item.color}20`, display: 'grid', placeItems: 'center' }}>
                    <item.Icon size={15} color={item.color} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, color: theme.textMuted, fontSize: '10px' }}>{item.label}</p>
                    <p style={{ margin: '3px 0 0', color: theme.textPrimary, fontSize: '11px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </section>
          </div>
        </div>
      </main>

      <NotificationWindow
        open={isNotificationWindowOpen}
        onClose={() => setIsNotificationWindowOpen(false)}
        theme={theme}
      />

      <style>{`
        * { box-sizing: border-box; }
        button, input, select { font-family: ${theme.font}; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${theme.cardBorder}; border-radius: 3px; }
      `}</style>
    </div>
  );
};

export default StaffSettings;
