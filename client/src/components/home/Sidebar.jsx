import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useChatStore } from '../../store/useChatStore';
import Avatar from '../ui/Avatar';
import SidebarSearch from './SidebarSearch';
import SidebarContactList from './SidebarContactList';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ activeChatId, onSelectChat, onSwitchAccount, user }) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div
      className="flex flex-col h-full flex-shrink-0 relative"
      style={{
        width: '340px',
        minWidth: '300px',
        maxWidth: '360px',
        background: 'rgba(10,10,15,0.98)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* ── Top shimmer ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.2), transparent)',
      }} />

      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{
          background:     'rgba(10,10,15,0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom:   '1px solid rgba(255,255,255,0.04)',
        }}
      >
        {/* Avatar + Name */}
        <button
          onClick={() => navigate(`/profile/${user.username}`)}
          className="flex items-center gap-3 group"
        >
          <div className="relative">
            {/* Hover glow */}
            <div
              className="absolute rounded-full opacity-0 group-hover:opacity-100
                         transition-opacity duration-300"
              style={{
                inset:      '-3px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                filter:     'blur(6px)',
                zIndex:     0,
              }}
            />
            <div className="relative z-10">
              <Avatar src={user.avatar?.url} username={user.username} size={40} />
              <span
                className="absolute bottom-0 right-0 w-3 h-3 rounded-full"
                style={{
                  background: '#22c55e',
                  border:     '2px solid #0a0a0f',
                  boxShadow:  '0 0 6px rgba(34,197,94,0.5)',
                }}
              />
            </div>
          </div>
          <div className="text-left">
            <p
              className="text-[14px] font-bold leading-tight"
              style={{
                background:           'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor:  'transparent',
                backgroundClip:       'text',
              }}
            >
              {user.username}
            </p>
            <p className="text-[11px]" style={{ color: '#6366f1' }}>
              tap to edit profile
            </p>
          </div>
        </button>

        {/* Right icons */}
        <div className="flex items-center gap-1.5">
          {/* Multi-account */}
          {user.linkedAccounts?.length > 0 && (
            <IconBtn onClick={onSwitchAccount} label="Switch account">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </IconBtn>
          )}

          {/* Settings */}
          <div className="relative">
            <IconBtn onClick={() => navigate('/settings')} label="Settings">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </IconBtn>
          </div>

          {/* Logout */}
          <IconBtn onClick={handleLogout} label="Sign out">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </IconBtn>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="px-4 py-3 flex-shrink-0">
        <SidebarSearch onSelectUser={onSelectChat} />
      </div>

      {/* ── Section label ── */}
      <div className="flex items-center gap-2 px-5 pb-2 flex-shrink-0">
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: '#2a2a3a' }}
        >
          Messages
        </span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />
      </div>

      {/* ── Contact List ── */}
      <SidebarContactList
        activeChatId={activeChatId}
        onSelectChat={onSelectChat}
      />
    </div>
  );
}

// ── Reusable Icon Button ─────────────────────────────────
function IconBtn({ onClick, label, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-9 h-9 flex items-center justify-center rounded-xl
                 transition-all duration-200 active:scale-95"
      style={{
        background:   hovered ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.03)',
        border:       hovered ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(255,255,255,0.06)',
        color:        hovered ? '#a5b4fc' : '#505060',
      }}
    >
      {children}
    </button>
  );
}