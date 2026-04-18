import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import Avatar from '../ui/Avatar';

export default function Header({ user, onSwitchAccount }) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  return (
    <div
      className="relative flex items-center justify-between px-5 py-4 z-20"
      style={{
        background:   'rgba(8,8,8,0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* ── Top shimmer line ── */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.25), transparent)',
        }}
      />

      {/* ── Left: Avatar + Name ── */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={() => navigate(`/profile/${user.username}`)}
          className="relative group"
          aria-label="View profile"
        >
          {/* Hover glow ring */}
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
          {/* Avatar */}
          <div className="relative z-10">
            <Avatar
              src={user.avatar?.url}
              username={user.username}
              size={42}
            />
            {/* Online dot */}
            {user.isOnline && (
              <span
                className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full z-20"
                style={{
                  background:  '#22c55e',
                  border:      '2.5px solid #080808',
                  boxShadow:   '0 0 6px rgba(34,197,94,0.5)',
                }}
              />
            )}
          </div>
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1
              className="text-[15px] font-bold tracking-[-0.02em]"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Noothing
            </h1>
            {/* Live dot */}
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: '#6366f1' }}
            />
          </div>
          <p
            className="text-[11px] font-semibold"
            style={{ color: '#6366f1' }}
          >
            @{user.username}
          </p>
        </div>
      </div>

      {/* ── Right: Action Buttons ── */}
      <div className="flex items-center gap-2">

        {/* Multi-account switch */}
        {user.linkedAccounts?.length > 0 && (
          <button
            onClick={onSwitchAccount}
            aria-label="Switch account"
            className="relative w-10 h-10 flex items-center justify-center
                       rounded-xl transition-all duration-200
                       hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border:     '1px solid rgba(255,255,255,0.07)',
              color:      '#808080',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(99,102,241,0.08)';
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)';
              e.currentTarget.style.color = '#a5b4fc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
              e.currentTarget.style.color = '#808080';
            }}
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
        )}

        {/* Settings */}
        <button
          onClick={() => navigate('/settings')}
          aria-label="Settings"
          className="relative w-10 h-10 flex items-center justify-center
                     rounded-xl transition-all duration-200
                     hover:scale-105 active:scale-95"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border:     '1px solid rgba(255,255,255,0.07)',
            color:      '#808080',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(99,102,241,0.08)';
            e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)';
            e.currentTarget.style.color = '#a5b4fc';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
            e.currentTarget.style.color = '#808080';
          }}
        >
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>

          {/* Notification badge */}
          {unreadCount > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px]
                         rounded-full text-[9px] font-bold text-white
                         flex items-center justify-center px-1"
              style={{
                background: '#ef4444',
                border:     '2px solid #080808',
                boxShadow:  '0 0 8px rgba(239,68,68,0.4)',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}