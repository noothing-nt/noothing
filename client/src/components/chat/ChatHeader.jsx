import { useNavigate } from 'react-router-dom';
import { useChatStore }  from '../../store/useChatStore';
import { useSocketStore } from '../../store/useSocketStore';
import { useAuthStore }  from '../../store/useAuthStore';
import Avatar from '../ui/Avatar';
import { useState } from 'react';
import ChatOptionsMenu from './ChatOptionsMenu';
import { formatDistanceToNowStrict } from 'date-fns';

export default function ChatHeader({ chatUser }) {
  const navigate = useNavigate();
  const { typingUsers } = useChatStore();
  const { emit } = useSocketStore();
  const { user } = useAuthStore();
  const [showOptions, setShowOptions] = useState(false);

  const isTyping = typingUsers[chatUser._id];

  const initiateCall = (callType) => {
    emit('call:initiate', { recipientId: chatUser._id, callType });
  };

  const getStatus = () => {
    if (isTyping) return <span className="text-indigo-400 text-xs animate-pulse">typing...</span>;
    if (chatUser.isOnline) return <span className="text-green-400 text-xs">Online</span>;
    if (chatUser.lastSeen) {
      return (
        <span className="text-[#505050] text-xs">
          Last seen {formatDistanceToNowStrict(new Date(chatUser.lastSeen), { addSuffix: true })}
        </span>
      );
    }
    return <span className="text-[#505050] text-xs">Offline</span>;
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#0d0d0d]">
      {/* Back */}
      <button
        onClick={() => navigate('/')}
        className="text-[#606060] hover:text-white transition-colors mr-1"
        aria-label="Go back"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Avatar + Info — clickable to view profile */}
      <button
        onClick={() => navigate(`/profile/${chatUser.username}`)}
        className="flex items-center gap-3 flex-1 text-left"
      >
        <div className="relative flex-shrink-0">
          <Avatar src={chatUser.avatar?.url} username={chatUser.username} size={38} />
          {chatUser.isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0d0d0d]" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">@{chatUser.username}</p>
          {getStatus()}
        </div>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => initiateCall('audio')}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/5 text-[#606060] hover:text-white transition-colors"
          aria-label="Voice call"
        >
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </button>
        <button
          onClick={() => initiateCall('video')}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/5 text-[#606060] hover:text-white transition-colors"
          aria-label="Video call"
        >
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M4 8h8a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2z" />
          </svg>
        </button>
        <button
          onClick={() => setShowOptions(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/5 text-[#606060] hover:text-white transition-colors"
          aria-label="Options"
        >
          <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5"  r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
      </div>

      {showOptions && (
        <ChatOptionsMenu chatUser={chatUser} onClose={() => setShowOptions(false)} />
      )}
    </div>
  );
}