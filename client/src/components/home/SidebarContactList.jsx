import { useChatStore } from '../../store/useChatStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import Avatar from '../ui/Avatar';
import { formatDistanceToNowStrict } from 'date-fns';

export default function SidebarContactList({ activeChatId, onSelectChat }) {
  const { contacts, isLoadingContacts } = useChatStore();
  const { unreadByUser }                = useNotificationStore();

  // ── Skeleton ─────────────────────────────────────────
  if (isLoadingContacts) {
    return (
      <div className="flex-1 overflow-y-auto px-3 space-y-0.5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-3.5 rounded-xl">
            <div className="w-10 h-10 rounded-full animate-pulse flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.04)' }} />
            <div className="flex-1 space-y-2">
              <div className="h-2.5 rounded-lg animate-pulse"
                style={{ width: '40%', background: 'rgba(255,255,255,0.04)' }} />
              <div className="h-2 rounded-lg animate-pulse"
                style={{ width: '65%', background: 'rgba(255,255,255,0.03)' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Empty ─────────────────────────────────────────────
  if (contacts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center
                      text-center px-6 pb-12">
        <div
          className="w-16 h-16 flex items-center justify-center mb-4"
          style={{
            borderRadius: '20px',
            background:   'linear-gradient(145deg, #1a1a2e, #0f0f1a)',
            border:       '1px solid rgba(99,102,241,0.15)',
            boxShadow:    '0 0 30px rgba(99,102,241,0.08)',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <defs>
              <linearGradient id="sidebarGrad" x1="0" y1="0" x2="40" y2="40"
                gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#a5b4fc" />
                <stop offset="100%" stopColor="#4338ca" />
              </linearGradient>
            </defs>
            <path
              d="M8 10C8 7.8 9.8 6 12 6H28C30.2 6 32 7.8 32 10V22C32 24.2 30.2 26 28 26H22L16 32V26H12C9.8 26 8 24.2 8 22V10Z"
              fill="url(#sidebarGrad)" opacity="0.8"
            />
            <circle cx="15" cy="16" r="2" fill="white" opacity="0.8" />
            <circle cx="20" cy="16" r="2" fill="white" opacity="0.55" />
            <circle cx="25" cy="16" r="2" fill="white" opacity="0.35" />
          </svg>
        </div>
        <p className="text-[13px] font-semibold mb-1" style={{ color: '#404050' }}>
          No conversations yet
        </p>
        <p className="text-[11px]" style={{ color: '#2a2a3a' }}>
          Search for a user to get started
        </p>
      </div>
    );
  }

  // ── Contacts ─────────────────────────────────────────
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide px-2 pb-4">
      {contacts.map((contact) => {
        const unread    = unreadByUser[contact._id] || 0;
        const lastMsg   = contact.lastMessage;
        const isActive  = activeChatId === contact._id?.toString();

        const previewText = () => {
          if (!lastMsg)                               return 'Start a conversation';
          if (lastMsg.isDeleted)                      return '🗑 Deleted';
          if (lastMsg.messageType === 'missed_call')  return '📞 Missed call';
          if (lastMsg.messageType === 'missed_video') return '📹 Missed video';
          if (lastMsg.messageType === 'image')        return '📷 Photo';
          if (lastMsg.messageType === 'sticker')      return '🎨 Sticker';
          if (lastMsg.messageType === 'file')
            return `📎 ${lastMsg.file?.name || 'File'}`;
          return lastMsg.text || '';
        };

        return (
          <button
            key={contact._id}
            onClick={() => onSelectChat(contact._id)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl
                       text-left transition-all duration-150 active:scale-[0.98]
                       mb-0.5 group relative"
            style={{
              background: isActive
                ? 'rgba(99,102,241,0.1)'
                : 'transparent',
              border: isActive
                ? '1px solid rgba(99,102,241,0.15)'
                : '1px solid transparent',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            {/* Active left indicator */}
            {isActive && (
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full"
                style={{
                  background: 'linear-gradient(180deg, #6366f1, #8b5cf6)',
                  boxShadow:  '0 0 8px rgba(99,102,241,0.6)',
                }}
              />
            )}

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {unread > 0 && (
                <div
                  className="absolute rounded-full animate-pulse-soft"
                  style={{
                    inset:      '-2px',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.5), rgba(139,92,246,0.3))',
                    filter:     'blur(3px)',
                  }}
                />
              )}
              <div className="relative z-10">
                <Avatar
                  src={contact.avatar?.url}
                  username={contact.username}
                  size={44}
                />
                {contact.isOnline && !contact.isBlocked && (
                  <span
                    className="absolute bottom-0 right-0 w-3 h-3 rounded-full z-10"
                    style={{
                      background: '#22c55e',
                      border:     '2px solid #0a0a0f',
                      boxShadow:  '0 0 5px rgba(34,197,94,0.4)',
                    }}
                  />
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between mb-0.5">
                <span
                  className="text-[13px] font-semibold truncate"
                  style={{ color: isActive ? '#ffffff' : unread ? '#f0f0f0' : '#c0c0d0' }}
                >
                  {contact.username}
                </span>
                {lastMsg?.createdAt && (
                  <span
                    className="text-[10px] ml-2 flex-shrink-0"
                    style={{ color: unread ? '#6366f1' : '#303040' }}
                  >
                    {formatDistanceToNowStrict(
                      new Date(lastMsg.createdAt),
                      { addSuffix: false }
                    )}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1.5">
                {/* Read receipt + preview */}
                <div className="flex items-center gap-1 min-w-0 flex-1">
                  {lastMsg && !unread && (
                    <span style={{ color: '#4f5068', fontSize: 10, flexShrink: 0 }}>
                      {lastMsg.status === 'read'      ? '✓✓' :
                       lastMsg.status === 'delivered' ? '✓✓' : '✓'}
                    </span>
                  )}
                  <p
                    className="text-[12px] truncate"
                    style={{
                      color:      unread ? '#9090a8' : '#404050',
                      fontWeight: unread ? '500' : '400',
                    }}
                  >
                    {previewText()}
                  </p>
                </div>

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

                {/* Blocked */}
                {contact.isBlocked && (
                  <span
                    className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: 'rgba(239,68,68,0.08)',
                      color:      '#f87171',
                      border:     '1px solid rgba(239,68,68,0.15)',
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