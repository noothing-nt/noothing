import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { useMessages } from '../../hooks/useMessages';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import OnlineDot from '../shared/OnlineDot';
import MessageContextMenu from '../modals/MessageContextMenu';
import api from '../../api/axios';
import config from '../../config';

export default function ChatWindow({ chat, currentUser, onBack, onlineUsers }) {
  const navigate    = useNavigate();
  const { socket }  = useSocket();
  const { messages, loading, hasMore, loadMore, addOptimisticMessage } =
    useMessages(chat, currentUser);

  const [typingUsers, setTypingUsers]       = useState(new Map());
  const [contextMenu, setContextMenu]       = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [callToast, setCallToast]           = useState('');

  const messagesEndRef       = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef     = useRef(null);
  const isFirstLoad          = useRef(true);

  const isRoom      = chat?.isRoom;
  const chatId      = chat?._id;
  const isOnline    = !isRoom && (onlineUsers?.has(chatId) || chat?.isOnline);
  const displayName = isRoom ? chat?.name : chat?.username;

  // ── Start call ──────────────────────────────────────
  const startCall = useCallback((type) => {
    const callRoomId = `call_${currentUser._id}_${chatId}`;

    // Notify recipient via socket
    if (socket) {
      socket.emit('call:invite', {
        recipientId: chatId,
        callRoomId,
        callType: type,
        callerName: currentUser.username,
        callerAvatar: currentUser.avatar?.url || '',
      });
    }

    setCallToast(`${type === 'voice' ? '🎙️' : '📹'} Starting ${type} call...`);
    setTimeout(() => setCallToast(''), 3000);

    navigate(`/call/${callRoomId}?type=${type}`);
  }, [navigate, socket, currentUser, chatId]);

  // ── Copy invite link ───────────────────────────────
  const copyInviteLink = useCallback(() => {
    const code = chat?.inviteCode;
    if (!code) return;

    const baseUrl = config.APP_URL;
    const link = isRoom
      ? `${baseUrl}/room/${code}`
      : `${baseUrl}/join/${code}`;

    navigator.clipboard.writeText(link).then(() => {
      setCallToast('✅ Invite link copied!');
      setTimeout(() => setCallToast(''), 2500);
    });
  }, [chat, isRoom]);

  // ... (keep all existing useEffects unchanged)

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    if (isFirstLoad.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
      isFirstLoad.current = false;
      return;
    }
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 150;
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    isFirstLoad.current = true;
    setTypingUsers(new Map());
    setContextMenu(null);
    setEditingMessage(null);
  }, [chatId]);

  useEffect(() => {
    if (!socket || !messages.length) return;
    const unread = messages.filter(
      (m) => m.sender?._id !== currentUser._id && m.status !== 'read' && m._id
    );
    if (unread.length) {
      socket.emit('messages:read', {
        senderId: unread[0].sender._id,
        messageIds: unread.map((m) => m._id),
      });
    }
  }, [messages, socket, currentUser._id]);

  useEffect(() => {
    if (!socket) return;
    const onStart = ({ senderId, username }) =>
      setTypingUsers((prev) => new Map(prev.set(senderId, username)));
    const onStop = ({ senderId }) =>
      setTypingUsers((prev) => { const n = new Map(prev); n.delete(senderId); return n; });
    socket.on('typing:start', onStart);
    socket.on('typing:stop', onStop);
    return () => { socket.off('typing:start', onStart); socket.off('typing:stop', onStop); };
  }, [socket]);

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    if (container.scrollTop < 80 && hasMore && !loading) {
      const prevHeight = container.scrollHeight;
      loadMore();
      requestAnimationFrame(() => { container.scrollTop = container.scrollHeight - prevHeight; });
    }
  }, [hasMore, loading, loadMore]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleTyping = useCallback(
    (isTyping) => {
      if (!socket) return;
      clearTimeout(typingTimeoutRef.current);
      if (isTyping) {
        socket.emit('typing:start', {
          recipientId: !isRoom ? chatId : undefined,
          roomId: isRoom ? chatId : undefined,
        });
        typingTimeoutRef.current = setTimeout(() => {
          socket.emit('typing:stop', {
            recipientId: !isRoom ? chatId : undefined,
            roomId: isRoom ? chatId : undefined,
          });
        }, 2500);
      } else {
        socket.emit('typing:stop', {
          recipientId: !isRoom ? chatId : undefined,
          roomId: isRoom ? chatId : undefined,
        });
      }
    },
    [socket, chatId, isRoom]
  );

  const handleSend = useCallback(
    async ({ text, imageFile, isViewOnce }) => {
      if (!socket || (!text?.trim() && !imageFile)) return;
      const tempId = crypto.randomUUID();
      let imageData = null;
      if (imageFile) {
        try {
          const formData = new FormData();
          formData.append('image', imageFile);
          const { data } = await api.post('/messages/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          imageData = data;
        } catch (err) {
          console.error('Image upload failed:', err);
          return;
        }
      }
      const payload = {
        tempId,
        text: text?.trim() || '',
        image: imageData || { url: '', publicId: '' },
        isViewOnce: isViewOnce || false,
        recipientId: !isRoom ? chatId : undefined,
        roomId: isRoom ? chatId : undefined,
      };
      addOptimisticMessage({
        _id: null,
        tempId,
        sender: { _id: currentUser._id, username: currentUser.username, avatar: currentUser.avatar },
        text: payload.text,
        image: imageData || { url: '', publicId: '' },
        isViewOnce: payload.isViewOnce,
        status: 'sent',
        createdAt: new Date().toISOString(),
      });
      socket.emit('message:send', payload);
      handleTyping(false);
    },
    [socket, chatId, isRoom, currentUser, addOptimisticMessage, handleTyping]
  );

  const handleContextMenu = useCallback((e, message) => {
    e.preventDefault();
    setContextMenu({
      x: Math.min(e.clientX, window.innerWidth - 210),
      y: Math.min(e.clientY, window.innerHeight - 230),
      message,
      isMobile: false,
    });
  }, []);

  const handleDeleteMessage = useCallback(
    (message) => {
      if (!socket) return;
      socket.emit('message:delete', {
        messageId: message._id,
        recipientId: !isRoom ? chatId : undefined,
        roomId: isRoom ? chatId : undefined,
      });
      setContextMenu(null);
    },
    [socket, chatId, isRoom]
  );

  const handleEditMessage = useCallback((message) => {
    setEditingMessage(message);
    setContextMenu(null);
  }, []);

  return (
    <div className="flex flex-col h-full" style={{ background: '#080808' }}>

      {/* ── CALL TOAST ───────────────────────────────── */}
      {callToast && (
        <div
          className="absolute top-16 left-1/2 -translate-x-1/2 z-50
                     px-4 py-2.5 rounded-xl text-sm font-medium text-white
                     animate-float-up"
          style={{
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.3)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {callToast}
        </div>
      )}

      {/* ── HEADER ───────────────────────────────────── */}
      <div
        className="flex-shrink-0 px-4 py-3 flex items-center gap-3 z-10"
        style={{
          background: 'linear-gradient(180deg, rgba(14,14,14,0.98) 0%, rgba(10,10,10,0.95) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Mobile back */}
        <button
          onClick={onBack}
          className="md:hidden w-9 h-9 flex items-center justify-center
                     rounded-xl text-txt-secondary hover:text-txt-primary
                     hover:bg-surface-2 transition-all duration-150"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className="w-10 h-10 rounded-2xl overflow-hidden flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #1c1c2e, #13131f)',
              border: '1px solid rgba(99,102,241,0.2)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            }}
          >
            {chat?.avatar?.url || chat?.avatar ? (
              <img src={chat.avatar?.url || chat.avatar}
                alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span
                className="font-bold text-sm"
                style={{
                  background: 'linear-gradient(135deg, #a5b4fc, #6366f1)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {isRoom ? '👥' : displayName?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          {!isRoom && isOnline && (
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-void"
              style={{
                background: 'radial-gradient(circle at 35% 35%, #4ade80, #16a34a)',
                boxShadow: '0 0 8px rgba(34,197,94,0.6)',
              }}
            />
          )}
        </div>

        {/* Name + Status */}
        <div className="flex-1 min-w-0">
          <h2 className="text-txt-primary font-semibold text-[14px] truncate tracking-tight">
            {displayName}
          </h2>
          <p className="text-[11px] truncate mt-0.5">
            {isRoom ? (
              <span className="text-txt-muted font-medium">
                {chat?.isBurner ? '🔥 Burner · ' : ''}
                {chat?.members?.length || 0} members
              </span>
            ) : isOnline ? (
              <span className="font-semibold"
                style={{ color: '#4ade80', textShadow: '0 0 8px rgba(34,197,94,0.4)' }}>
                Online
              </span>
            ) : (
              <span className="text-txt-muted font-medium">
                {chat?.lastSeen
                  ? `Last seen ${new Date(chat.lastSeen).toLocaleTimeString([], {
                      hour: '2-digit', minute: '2-digit',
                    })}`
                  : 'Offline'}
              </span>
            )}
          </p>
        </div>

        {/* ── ACTION BUTTONS ──────────────────────────── */}
        <div className="flex items-center gap-1">

          {/* Voice Call — DM only */}
          {!isRoom && (
            <button
              onClick={() => startCall('voice')}
              className="w-9 h-9 flex items-center justify-center rounded-xl
                         text-txt-muted hover:text-online
                         hover:bg-green-500/8 border border-transparent
                         hover:border-green-500/20 transition-all duration-150"
              title="Voice Call"
            >
              <svg className="w-[18px] h-[18px]" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0
                     01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13
                     -2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2
                     2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
          )}

          {/* Video Call — DM only */}
          {!isRoom && (
            <button
              onClick={() => startCall('video')}
              className="w-9 h-9 flex items-center justify-center rounded-xl
                         text-txt-muted hover:text-accent-light
                         hover:bg-accent/8 border border-transparent
                         hover:border-accent/20 transition-all duration-150"
              title="Video Call"
            >
              <svg className="w-[18px] h-[18px]" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894
                     L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2
                     2v8a2 2 0 002 2z" />
              </svg>
            </button>
          )}

          {/* Invite Link */}
          <button
            onClick={copyInviteLink}
            className="w-9 h-9 flex items-center justify-center rounded-xl
                       text-txt-muted hover:text-txt-primary
                       hover:bg-surface-2 border border-transparent
                       hover:border-border transition-all duration-150"
            title="Copy invite link"
          >
            <svg className="w-[18px] h-[18px]" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938
                   -.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m
                   -6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367
                   2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── MESSAGES ─────────────────────────────────── */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
        style={{ background: '#080808' }}
      >
        {loading && (
          <div className="flex justify-center py-4">
            <div
              className="w-5 h-5 rounded-full border-2"
              style={{
                borderColor: 'rgba(99,102,241,0.3)',
                borderTopColor: '#6366f1',
                animation: 'spin 0.8s linear infinite',
              }}
            />
          </div>
        )}

        {!hasMore && messages.length > 0 && (
          <div className="text-center py-4">
            <span
              className="text-txt-muted text-xs px-3 py-1.5 rounded-full font-medium"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              Beginning of conversation
            </span>
          </div>
        )}

        {messages.map((message, index) => {
          const prevMessage = messages[index - 1];
          const showAvatar =
            !prevMessage || prevMessage.sender?._id !== message.sender?._id;
          const isMine =
            message.sender?._id === currentUser._id ||
            message.sender === currentUser._id;

          return (
            <MessageBubble
              key={message._id || message.tempId}
              message={message}
              isMine={isMine}
              showAvatar={showAvatar && !isMine}
              isRoom={isRoom}
              onContextMenu={(e) => handleContextMenu(e, message)}
              onLongPress={(coords) => {
                if (isMine && message._id) {
                  setContextMenu({ ...coords, message, isMobile: true });
                }
              }}
              currentUser={currentUser}
              chatId={chatId}
              socket={socket}
            />
          );
        })}

        {typingUsers.size > 0 && (
          <TypingIndicator users={[...typingUsers.values()]} />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── INPUT ────────────────────────────────────── */}
      <MessageInput
        onSend={handleSend}
        onTyping={handleTyping}
        editingMessage={editingMessage}
        onCancelEdit={() => setEditingMessage(null)}
        onEditSend={(messageId, text) => {
          if (!socket) return;
          socket.emit('message:edit', {
            messageId,
            text,
            recipientId: !isRoom ? chatId : undefined,
            roomId: isRoom ? chatId : undefined,
          });
          setEditingMessage(null);
        }}
      />

      {/* ── CONTEXT MENU ─────────────────────────────── */}
      {contextMenu && contextMenu.message?._id && (
        <MessageContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          isMobile={contextMenu.isMobile || false}
          message={contextMenu.message}
          isMine={
            contextMenu.message?.sender?._id === currentUser._id ||
            contextMenu.message?.sender === currentUser._id
          }
          onEdit={() => handleEditMessage(contextMenu.message)}
          onDelete={() => handleDeleteMessage(contextMenu.message)}
          onCopy={() => {
            if (contextMenu.message?.text) {
              navigator.clipboard.writeText(contextMenu.message.text);
            }
          }}
          onReply={() => setContextMenu(null)}
          onClose={() => setContextMenu(null)}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}