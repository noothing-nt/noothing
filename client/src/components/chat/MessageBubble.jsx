import { useState, useRef } from 'react';
import { useSocketStore } from '../../store/useSocketStore';
import { useChatStore }   from '../../store/useChatStore';
import ReplyPreview from './ReplyPreview';

const EMOJIS = ['❤️', '😂', '😮', '😢', '👍', '🔥', '👏', '😍'];

export default function MessageBubble({ message, isMine, chatUserId }) {
  const { emit }        = useSocketStore();
  const { updateMessage, markMessageDeleted, setReplyTo } = useChatStore();
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing]     = useState(false);
  const [editText, setEditText]       = useState(message.text);
  const [hovered, setHovered]         = useState(false);
  const longPressTimer = useRef(null);

  if (message.isDeleted) {
    return (
      <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} px-4 mb-0.5`}>
        <div
          className="px-3.5 py-2 rounded-2xl text-[12px] italic"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border:     '1px solid rgba(255,255,255,0.06)',
            color:      '#404050',
          }}
        >
          🗑 Message deleted
        </div>
      </div>
    );
  }

  const handleReact = (emoji) => {
    emit('reaction:add', { messageId: message._id, emoji, recipientId: chatUserId });
    setShowActions(false);
  };

  const handleDelete = () => {
    emit('message:delete', { messageId: message._id, recipientId: chatUserId });
    markMessageDeleted(message._id);
    setShowActions(false);
  };

  const handleEdit = () => {
    if (!editText.trim()) return;
    emit('message:edit', { messageId: message._id, text: editText, recipientId: chatUserId });
    updateMessage(message._id, { text: editText, isEdited: true });
    setIsEditing(false);
    setShowActions(false);
  };

  const handleReply = () => {
    setReplyTo({
      messageId:      message._id,
      text:           message.text,
      senderUsername: message.sender?.username,
      messageType:    message.messageType,
    });
    setShowActions(false);
  };

  const readIcon = () => {
    if (!isMine) return null;
    if (message._isOptimistic)
      return <span style={{ color: '#404050', fontSize: 10 }}>⏳</span>;
    if (message.status === 'read')
      return <span style={{ color: '#6366f1', fontSize: 10 }}>✓✓</span>;
    if (message.status === 'delivered')
      return <span style={{ color: '#505060', fontSize: 10 }}>✓✓</span>;
    return <span style={{ color: '#404050', fontSize: 10 }}>✓</span>;
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour:   '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const renderContent = () => {
    if (message.messageType === 'image' && message.image?.url) {
      return (
        <a href={message.image.url} target="_blank" rel="noreferrer"
          className="block" onClick={(e) => e.stopPropagation()}>
          <img
            src={message.image.url}
            alt="Image"
            className="rounded-xl max-w-[280px] object-cover block"
            style={{ maxHeight: 320 }}
            loading="lazy"
          />
        </a>
      );
    }
    if (message.messageType === 'sticker' && message.sticker?.url) {
      return (
        <img
          src={message.sticker.url}
          alt="Sticker"
          className="w-24 h-24 object-contain"
          loading="lazy"
        />
      );
    }
    if (message.messageType === 'file' && message.file?.url) {
      return (
        <a
          href={message.file.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2.5 p-3 rounded-xl transition-colors"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border:     '1px solid rgba(255,255,255,0.08)',
            color:      '#a5b4fc',
            minWidth:   '180px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(99,102,241,0.15)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2} style={{ color: '#6366f1' }}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold truncate" style={{ color: '#e0e0e0' }}>
              {message.file.name || 'File'}
            </p>
            {message.file.size > 0 && (
              <p className="text-[10px]" style={{ color: '#505060' }}>
                {(message.file.size / 1024).toFixed(0)} KB
              </p>
            )}
          </div>
        </a>
      );
    }
    if (isEditing) {
      return (
        <div className="flex flex-col gap-2 min-w-[200px]">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="text-[14px] resize-none outline-none"
            style={{
              background:  'transparent',
              border:      'none',
              color:       isMine ? '#ffffff' : '#e0e0e0',
              caretColor:  '#a5b4fc',
              minWidth:    '160px',
              lineHeight:  '1.5',
            }}
            rows={2}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEdit(); }
              if (e.key === 'Escape') { setIsEditing(false); setEditText(message.text); }
            }}
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setIsEditing(false); setEditText(message.text); }}
              className="text-[11px] px-2 py-1 rounded-lg"
              style={{ color: '#505060', background: 'rgba(255,255,255,0.05)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              className="text-[11px] px-2 py-1 rounded-lg font-semibold"
              style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}
            >
              Save
            </button>
          </div>
        </div>
      );
    }
    return (
      <p
        className="text-[14px] leading-relaxed whitespace-pre-wrap break-words"
        style={{ color: isMine ? '#ffffff' : '#e0e0e0' }}
      >
        {message.text}
      </p>
    );
  };

  return (
    <div
      className={`flex ${isMine ? 'justify-end' : 'justify-start'} px-4 mb-0.5`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); }}
    >
      {/* Avatar for other's messages */}
      {!isMine && (
        <div className="w-7 h-7 flex-shrink-0 mt-auto mb-1 mr-2">
          {/* Show avatar only for last message in group — simplified */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #4338ca)',
              color:      '#fff',
            }}
          >
            {(message.sender?.username || '?')[0].toUpperCase()}
          </div>
        </div>
      )}

      <div className={`relative max-w-[65%] flex flex-col
        ${isMine ? 'items-end' : 'items-start'}`}>

        {/* Reply Preview */}
        {message.replyTo?.messageId && (
          <ReplyPreview replyTo={message.replyTo} isMine={isMine} />
        )}

        {/* Bubble */}
        <div
          className="relative px-4 py-2.5 cursor-pointer select-text"
          style={{
            borderRadius: isMine
              ? '18px 18px 4px 18px'
              : '18px 18px 18px 4px',
            background: isMine
              ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
              : 'rgba(255,255,255,0.05)',
            border: isMine
              ? 'none'
              : '1px solid rgba(255,255,255,0.07)',
            boxShadow: isMine
              ? '0 4px 16px rgba(99,102,241,0.2)'
              : '0 2px 8px rgba(0,0,0,0.2)',
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowActions(true);
          }}
          onDoubleClick={() => handleReply()}
        >
          {renderContent()}

          {/* Time + status */}
          <div
            className={`flex items-center gap-1.5 mt-1
              ${isMine ? 'justify-end' : 'justify-start'}`}
          >
            <span
              className="text-[10px]"
              style={{ color: isMine ? 'rgba(255,255,255,0.45)' : '#404050' }}
            >
              {formatTime(message.createdAt)}
            </span>
            {message.isEdited && (
              <span
                className="text-[10px] italic"
                style={{ color: isMine ? 'rgba(255,255,255,0.35)' : '#383848' }}
              >
                edited
              </span>
            )}
            {readIcon()}
          </div>
        </div>

        {/* Reactions */}
        {message.reactions?.length > 0 && (
          <div
            className={`flex flex-wrap gap-1 mt-1
              ${isMine ? 'justify-end' : 'justify-start'}`}
          >
            {message.reactions.map((r, i) => (
              <button
                key={i}
                onClick={() => handleReact(r.emoji)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full
                           text-[12px] transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border:     '1px solid rgba(255,255,255,0.08)',
                }}
                title={r.username}
              >
                {r.emoji}
              </button>
            ))}
          </div>
        )}

        {/* Hover quick react */}
        {hovered && !showActions && !isEditing && (
          <div
            className={`absolute flex items-center gap-1 px-2 py-1.5 rounded-2xl
                        transition-all animate-fade-in z-20
                        ${isMine ? 'left-0 -translate-x-full pr-2' : 'right-0 translate-x-full pl-2'}`}
            style={{ top: '50%', transform: `translateY(-50%) ${isMine ? 'translateX(-100%)' : 'translateX(100%)'}` }}
          >
            {EMOJIS.slice(0, 5).map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                className="text-[16px] hover:scale-125 transition-transform leading-none"
              >
                {emoji}
              </button>
            ))}
            {/* More actions */}
            <button
              onClick={() => setShowActions(true)}
              className="w-6 h-6 flex items-center justify-center rounded-lg ml-0.5"
              style={{
                background: 'rgba(255,255,255,0.08)',
                color:      '#606070',
              }}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5"  r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
          </div>
        )}

        {/* Context Menu */}
        {showActions && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowActions(false)}
            />
            <div
              className={`absolute z-50 py-1 rounded-2xl overflow-hidden
                          animate-scale-in min-w-[180px]
                          ${isMine ? 'right-0' : 'left-0'}
                          bottom-full mb-2`}
              style={{
                background: 'rgba(13,13,20,0.99)',
                border:     '1px solid rgba(255,255,255,0.08)',
                boxShadow:  '0 20px 60px rgba(0,0,0,0.7)',
              }}
            >
              {/* Top shimmer */}
              <div style={{
                height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)',
              }} />

              {/* Quick emoji row */}
              <div
                className="flex items-center gap-1 px-3 py-2.5"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReact(emoji)}
                    className="text-[18px] hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Actions */}
              {[
                {
                  icon: '↩️',
                  label: 'Reply',
                  action: handleReply,
                  color: '#d0d0e0',
                },
                ...(isMine && message.messageType === 'text' ? [{
                  icon: '✏️',
                  label: 'Edit',
                  action: () => { setIsEditing(true); setShowActions(false); },
                  color: '#d0d0e0',
                }] : []),
                ...(isMine ? [{
                  icon: '🗑',
                  label: 'Delete',
                  action: handleDelete,
                  color: '#f87171',
                }] : []),
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={opt.action}
                  className="w-full flex items-center gap-3 px-4 py-2.5
                             text-left text-[13px] transition-colors"
                  style={{ color: opt.color }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span>{opt.icon}</span>
                  <span className="font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}