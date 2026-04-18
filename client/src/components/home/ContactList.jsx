import { useChatStore } from '../../store/useChatStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useNavigate } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import { formatDistanceToNowStrict } from 'date-fns';

export default function ContactList() {
  const { contacts, isLoadingContacts } = useChatStore();
  const { unreadByUser }                = useNotificationStore();
  const navigate                        = useNavigate();

  // ── Loading Skeleton ─────────────────────────────────
  if (isLoadingContacts) {
    return (
      <div className="flex-1 overflow-y-auto px-3 pt-1">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-3 py-3.5 rounded-2xl mb-1"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* Avatar skeleton */}
            <div
              className="w-13 h-13 rounded-full flex-shrink-0 animate-pulse"
              style={{ width: 52, height: 52, background: 'rgba(255,255,255,0.04)' }}
            />
            {/* Text skeletons */}
            <div className="flex-1 space-y-2">
              <div
                className="h-3 rounded-lg animate-pulse"
                style={{ width: '35%', background: 'rgba(255,255,255,0.04)' }}
              />
              <div
                className="h-2.5 rounded-lg animate-pulse"
                style={{ width: '60%', background: 'rgba(255,255,255,0.03)' }}
              />
            </div>
            {/* Time skeleton */}
            <div
              className="h-2 w-8 rounded-lg animate-pulse flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            />
          </div>
        ))}
      </div>
    );
  }

  // ── Empty State ──────────────────────────────────────
  if (contacts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center
                      text-center px-8 pb-16 relative overflow-hidden">

        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 40% at 50% 55%, rgba(99,102,241,0.04) 0%, transparent 70%)',
          }}
        />

        {/* Icon container */}
        <div className="relative mb-7">
          {/* Outer glow ring */}
          <div
            className="absolute animate-pulse-soft"
            style={{
              inset:      '-12px',
              borderRadius: '36px',
              background: 'rgba(99,102,241,0.06)',
              filter:     'blur(16px)',
            }}
          />
          {/* Icon box */}
          <div
            className="relative w-24 h-24 flex items-center justify-center"
            style={{
              borderRadius: '28px',
              background:   'linear-gradient(145deg, #1a1a2e 0%, #16162a 50%, #0f0f1a 100%)',
              border:       '1px solid rgba(99,102,241,0.2)',
              boxShadow:    '0 0 0 1px rgba(99,102,241,0.08), 0 20px 60px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <svg width="44" height="44" viewBox="0 0 40 40" fill="none">
              <defs>
                <linearGradient id="emptyGrad" x1="0" y1="0" x2="40" y2="40"
                  gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="#a5b4fc" />
                  <stop offset="50%"  stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#4338ca" />
                </linearGradient>
                <filter id="emptyGlow">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* Chat bubble */}
              <path
                d="M8 10C8 7.8 9.8 6 12 6H28C30.2 6 32 7.8 32 10V22C32 24.2 30.2 26 28 26H22L16 32V26H12C9.8 26 8 24.2 8 22V10Z"
                fill="url(#emptyGrad)"
                filter="url(#emptyGlow)"
                opacity="0.9"
              />
              {/* Dots */}
              <circle cx="15" cy="16" r="2" fill="white" opacity="0.9" />
              <circle cx="20" cy="16" r="2" fill="white" opacity="0.65" />
              <circle cx="25" cy="16" r="2" fill="white" opacity="0.4" />
            </svg>
          </div>
        </div>

        {/* Text */}
        <h2
          className="text-[20px] font-bold mb-2 tracking-[-0.02em]"
          style={{
            background:           'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor:  'transparent',
            backgroundClip:       'text',
          }}
        >
          No active chats
        </h2>
        <p
          className="text-[13px] leading-relaxed max-w-[220px]"
          style={{ color: '#505050' }}
        >
          Search for a username above to start an encrypted conversation.
        </p>

        {/* Feature badges */}
        <div className="flex items-center gap-2.5 mt-7">
          {[
            { icon: '🔒', text: 'Encrypted' },
            { icon: '⚡', text: 'Real-time' },
            { icon: '👻', text: 'Private' },
          ].map(({ icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                         text-[11px] font-medium"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border:     '1px solid rgba(255,255,255,0.06)',
                color:      '#404040',
              }}
            >
              <span className="text-[11px]">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Contact Rows ─────────────────────────────────────
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide px-3 pt-1 pb-4">

      {/* Section label */}
      <div className="flex items-center gap-2 px-2 mb-2 mt-1">
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: '#333' }}
        >
          Messages
        </span>
        <div
          className="flex-1 h-px"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        />
        <span
          className="text-[10px] font-medium"
          style={{ color: '#333' }}
        >
          {contacts.length}
        </span>
      </div>

      {contacts.map((contact, idx) => {
        const unread   = unreadByUser[contact._id] || 0;
        const lastMsg  = contact.lastMessage;

        const previewText = () => {
          if (!lastMsg)                                    return 'Start a conversation';
          if (lastMsg.isDeleted)                           return '🗑 Message deleted';
          if (lastMsg.messageType === 'missed_call')       return '📞 Missed call';
          if (lastMsg.messageType === 'missed_video')      return '📹 Missed video call';
          if (lastMsg.messageType === 'image')             return '📷 Photo';
          if (lastMsg.messageType === 'sticker')           return '🎨 Sticker';
          if (lastMsg.messageType === 'file')
            return `📎 ${lastMsg.file?.name || 'File'}`;
          return lastMsg.text || '';
        };

        return (
          <button
            key={contact._id}
            onClick={() => navigate(`/chat/${contact._id}`)}
            className="w-full flex items-center gap-3.5 px-3 py-3.5
                       rounded-2xl mb-0.5 text-left transition-all duration-200
                       active:scale-[0.98] group"
            style={{
              background:   unread
                ? 'rgba(99,102,241,0.04)'
                : 'transparent',
              border:       unread
                ? '1px solid rgba(99,102,241,0.08)'
                : '1px solid transparent',
            }}
            onMouseEnter={(e) => {
              if (!unread) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.025)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)';
              } else {
                e.currentTarget.style.background = 'rgba(99,102,241,0.07)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = unread
                ? 'rgba(99,102,241,0.04)'
                : 'transparent';
              e.currentTarget.style.borderColor = unread
                ? 'rgba(99,102,241,0.08)'
                : 'transparent';
            }}
          >
            {/* ── Avatar ── */}
            <div className="relative flex-shrink-0">
              {/* Glow ring when unread */}
              {unread > 0 && (
                <div
                  className="absolute rounded-full animate-pulse-soft"
                  style={{
                    inset:      '-2px',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(139,92,246,0.2))',
                    filter:     'blur(4px)',
                  }}
                />
              )}
              <div className="relative z-10">
                <Avatar
                  src={contact.avatar?.url}
                  username={contact.username}
                  size={50}
                />
                {contact.isOnline && !contact.isBlocked && (
                  <span
                    className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full z-10"
                    style={{
                      background: '#22c55e',
                      border:     '2px solid #080808',
                      boxShadow:  '0 0 5px rgba(34,197,94,0.4)',
                    }}
                  />
                )}
              </div>
            </div>

            {/* ── Content ── */}
            <div className="flex-1 min-w-0">
              {/* Top row */}
              <div className="flex items-baseline justify-between mb-0.5">
                <span
                  className="text-[14px] font-bold truncate tracking-[-0.01em]"
                  style={{ color: unread ? '#ffffff' : '#d0d0d0' }}
                >
                  @{contact.username}
                </span>
                {lastMsg?.createdAt && (
                  <span
                    className="text-[10px] ml-2 flex-shrink-0 font-medium"
                    style={{ color: unread ? '#6366f1' : '#383838' }}
                  >
                    {formatDistanceToNowStrict(
                      new Date(lastMsg.createdAt),
                      { addSuffix: false }
                    )}
                  </span>
                )}
              </div>

              {/* Bottom row */}
              <div className="flex items-center justify-between gap-2">
                <p
                  className="text-[12px] truncate flex-1"
                  style={{
                    color:      unread ? '#a0a0a0' : '#404040',
                    fontWeight: unread ? '500' : '400',
                  }}
                >
                  {previewText()}
                </p>

                {/* Unread badge */}
                {unread > 0 && (
                  <span
                    className="flex-shrink-0 min-w-[18px] h-[18px] rounded-full
                               text-[9px] font-bold text-white
                               flex items-center justify-center px-1.5"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                      boxShadow:  '0 2px 8px rgba(99,102,241,0.4)',
                    }}
                  >
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}

                {/* Blocked indicator */}
                {contact.isBlocked && (
                  <span
                    className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: 'rgba(239,68,68,0.08)',
                      border:     '1px solid rgba(239,68,68,0.15)',
                      color:      '#f87171',
                    }}
                  >
                    Blocked
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}