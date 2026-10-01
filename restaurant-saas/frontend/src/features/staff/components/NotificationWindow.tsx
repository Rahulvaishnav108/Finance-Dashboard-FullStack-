import React from 'react';
import { AlertTriangle, Bell, CheckCircle2, Clock, Sparkles, X } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

type NotificationWindowTheme = {
  cardBg: string;
  cardBorder: string;
  miniCardBg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  font: string;
};

const toneStyles = {
  urgent: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', Icon: AlertTriangle },
  success: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', Icon: CheckCircle2 },
  info: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', Icon: Bell },
  cleaning: { color: '#f97316', bg: 'rgba(249,115,22,0.12)', Icon: Sparkles },
};

export function NotificationWindow({
  open,
  onClose,
  theme,
}: {
  open: boolean;
  onClose: () => void;
  theme: NotificationWindowTheme;
}) {
  const {
    notifications,
    unreadCount,
    toggleRead,
    markAllAsRead,
    clearRead,
  } = useNotifications();

  if (!open) return null;

  const markAllRead = () => {
    void markAllAsRead();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Notifications"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(8, 12, 20, 0.78)',
        backdropFilter: 'blur(8px)',
        zIndex: 90,
        display: 'grid',
        placeItems: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: 'min(560px, 100%)',
          maxHeight: 'min(680px, calc(100vh - 40px))',
          overflow: 'hidden',
          background: theme.cardBg,
          border: `1px solid ${theme.cardBorder}`,
          borderRadius: '18px',
          boxShadow: '0 30px 90px rgba(0,0,0,0.28)',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: theme.font,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '18px',
            borderBottom: `1px solid ${theme.cardBorder}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(249,115,22,0.12)', display: 'grid', placeItems: 'center' }}>
              <Bell size={18} color="#f97316" />
            </div>
            <div>
              <p style={{ margin: 0, color: theme.textPrimary, fontSize: '16px', fontWeight: 800 }}>Notifications</p>
              <p style={{ margin: '4px 0 0', color: theme.textMuted, fontSize: '12px' }}>
                {unreadCount ? `${unreadCount} unread update${unreadCount === 1 ? '' : 's'}` : 'You are all caught up'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications"
            style={{
              width: '32px',
              height: '32px',
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: '10px',
              background: theme.miniCardBg,
              color: theme.textSecondary,
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', padding: '12px 18px', borderBottom: `1px solid ${theme.cardBorder}` }}>
          <button
            type="button"
            onClick={markAllRead}
            style={{
              border: 'none',
              borderRadius: '10px',
              padding: '9px 12px',
              background: '#f97316',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            Mark all read
          </button>
          <button
            type="button"
            onClick={clearRead}
            style={{
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: '10px',
              padding: '9px 12px',
              background: theme.miniCardBg,
              color: theme.textSecondary,
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            Clear read
          </button>
        </div>

        <div style={{ overflowY: 'auto', padding: '14px 18px 18px', display: 'grid', gap: '10px' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '34px 10px', color: theme.textMuted, fontSize: '13px' }}>
              <Clock size={22} style={{ margin: '0 auto 10px', display: 'block' }} />
              No notifications right now.
            </div>
          ) : (
            notifications.map((item) => {
              const tone = toneStyles[item.tone];
              const Icon = tone.Icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleRead(item.id)}
                  style={{
                    width: '100%',
                    border: `1px solid ${item.read ? theme.cardBorder : tone.color}`,
                    borderRadius: '14px',
                    padding: '12px',
                    background: item.read ? theme.miniCardBg : tone.bg,
                    cursor: 'pointer',
                    display: 'grid',
                    gridTemplateColumns: '34px 1fr auto',
                    gap: '10px',
                    alignItems: 'start',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ width: '34px', height: '34px', borderRadius: '11px', background: tone.bg, display: 'grid', placeItems: 'center' }}>
                    <Icon size={16} color={tone.color} />
                  </span>
                  <span>
                    <span style={{ display: 'block', color: theme.textPrimary, fontSize: '13px', fontWeight: 800 }}>{item.title}</span>
                    <span style={{ display: 'block', color: theme.textSecondary, fontSize: '12px', lineHeight: 1.5, marginTop: '4px' }}>{item.message}</span>
                    <span style={{ display: 'block', color: theme.textMuted, fontSize: '10px', marginTop: '7px' }}>{item.time}</span>
                  </span>
                  {!item.read && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: tone.color, marginTop: '6px' }} />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
