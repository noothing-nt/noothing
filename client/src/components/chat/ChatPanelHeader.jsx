import { useState } from 'react';
import { useChatStore }   from '../../store/useChatStore';
import { useSocketStore } from '../../store/useSocketStore';
import { useNavigate }    from 'react-router-dom';
import { formatDistanceToNowStrict } from 'date-fns';
import Avatar         from '../ui/Avatar';
import ChatOptionsMenu from './ChatOptionsMenu';

export default function ChatPanelHeader({ chatUser, onClose }) {
  const { typingUsers } = useChatStore();
  const { emit }        = useSocketStore();
  const navigate        = useNavigate();
  const [showOptions, setShowOptions] = useState(false);
  const [hoverCall, setHoverCall]     = useState(null);

  const isTyping = typingUsers[chatUser._id];

  const getStatus = () => {
    if (isTyping) return (
      <span className="text-[12px] font-medium animate-pulse text-indigo-400">typing...</span>
    );
    if (chatUser.isOnline) return (
      <span className="text-[12px] text-green-400">Online</span>
    );
    if (chatUser.lastSeen) return (
      <span className="text-[12px] text-[#404050]">
        Last seen {formatDistanceToNowStrict(new Date(chatUser.lastSeen), { addSuffix: true })}
      </span>
    );
    return <span className="text-[12px] text-[#404050]">Offline</span>;
  };

  const callBtn = (type, icon) => (
    <button
      key={type}
      onClick={() => emit('call:initiate', { recipientId: chatUser._id, callType: type })}
      onMouseEnter={() => setHoverCall(type)}
      onMouseLeave={() => setHoverCall(null)}
      aria-label={`${type} call`}
      className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 active:scale-95"
      style={{
        background: hoverCall === type ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)',
        border:     hoverCall === type ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(255,255,255,0.06)',
        color:      hoverCall === type ? '#a5b4fc' : '#505060',
      }}
    >
      {icon}
    </button>
  );

  return (
    <div
      className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
      style={{
        background:   'rgba(10,10,15,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        zIndex: 10,
      }}
    >
      {/* Left: Avatar + Name + Status */}
      <button
        onClick={() => navigate(`/profile/${chatUser.username}`)}
        className="flex items-center gap-3 group text-left"
      >
        <div className="relative flex-shrink-0">
          <Avatar src={chatUser.avatar?.url} username={chatUser.username} size={40} />
          {chatUser.isOnline && (
            <span
              className="absolute bottom-0 right-0 w-3 h-3 rounded-full"
              style={{ background: '#22c55e', border: '2px solid #0a0a0f', boxShadow: '0 0 5px rgba(34,197,94,0.4)' }}
            />
          )}
        </div>
        <div>
          <p className="text-[14px] font-bold text-[#e0e0e0] leading-tight">{chatUser.username}</p>
          {getStatus()}
        </div>
      </button>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 relative">
        {callBtn('audio',
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        )}
        {callBtn('video',
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M4 8h8a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2z" />
          </svg>
        )}

        {/* Three-dot options */}
        <button
          onClick={() => setShowOptions(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 hover:bg-white/5 hover:text-indigo-300 text-[#505060]"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5"  r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>

        {/* ✅ CLOSE BUTTON */}
        <div className="w-px h-5 bg-white/10 mx-1" />
        <button
          onClick={onClose}
          title="Close Chat"
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 text-[#505060] active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {showOptions && (
          <ChatOptionsMenu chatUser={chatUser} onClose={() => setShowOptions(false)} />
        )}
      </div>
    </div>
  );
}