import { useState, useRef, useEffect, useCallback } from 'react';
import { useSocketStore } from '../../store/useSocketStore';
import { useChatStore }   from '../../store/useChatStore';
import { useAuthStore }   from '../../store/useAuthStore';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import StickerPicker from './StickerPicker';

export default function MessageInput({ chatUserId, chatUser }) {
  const [text, setText]               = useState('');
  const [isSending, setIsSending]     = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [dragOver, setDragOver]       = useState(false);

  const { emit }   = useSocketStore();
  const { user }   = useAuthStore();
  const { sendMessage, replyTo, setReplyTo } = useChatStore();

  const typingTimeout = useRef(null);
  const fileInputRef  = useRef(null);
  const inputRef      = useRef(null);
  const isTypingRef   = useRef(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, [chatUserId]);

  const stopTyping = useCallback(() => {
    if (isTypingRef.current) {
      isTypingRef.current = false;
      emit('typing:stop', { recipientId: chatUserId });
    }
  }, [chatUserId, emit]);

  const handleTyping = useCallback((val) => {
    setText(val);
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      emit('typing:start', { recipientId: chatUserId });
    }
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(stopTyping, 1500);
  }, [chatUserId, emit, stopTyping]);

  const buildPayload = (extra = {}) => ({
    recipientId: chatUserId,
    sender: { _id: user._id, username: user.username, avatar: user.avatar },
    recipient: chatUserId,
    ...(replyTo ? { replyTo } : {}),
    ...extra,
  });

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    setIsSending(true);
    setText('');
    stopTyping();
    const payload = buildPayload({ text: trimmed, messageType: 'text' });
    sendMessage(payload);
    emit('message:send', payload);
    if (replyTo) setReplyTo(null);
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    setIsSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const formData = new FormData();
    formData.append('image', file);
    setUploadingMedia(true);
    try {
      const { data } = await api.post('/messages/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const payload = buildPayload({
        messageType: isImage ? 'image' : 'file',
        image:       isImage ? { url: data.url, publicId: data.publicId } : undefined,
        file:        !isImage ? {
          url: data.url, publicId: data.publicId,
          name: file.name, size: file.size, mimeType: file.type,
        } : undefined,
      });
      sendMessage(payload);
      emit('message:send', payload);
      if (replyTo) setReplyTo(null);
    } catch {
      toast.error('Media upload failed.');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleStickerSend = (stickerUrl) => {
    const payload = buildPayload({
      messageType: 'sticker',
      sticker:     { url: stickerUrl, pack: 'default' },
    });
    sendMessage(payload);
    emit('message:send', payload);
    setShowStickers(false);
    if (replyTo) setReplyTo(null);
  };

  return (
    <div
      className="flex-shrink-0 relative"
      style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {dragOver && (
        <div
          className="absolute inset-0 flex items-center justify-center z-50 rounded-none"
          style={{
            background: 'rgba(99,102,241,0.08)',
            border:     '2px dashed rgba(99,102,241,0.4)',
          }}
        >
          <p className="text-[13px] font-semibold" style={{ color: '#a5b4fc' }}>
            Drop file to send
          </p>
        </div>
      )}

      {/* Reply Banner */}
      {replyTo && (
        <div
          className="flex items-center justify-between px-5 py-2.5"
          style={{
            background:  'rgba(99,102,241,0.05)',
            borderTop:   '1px solid rgba(99,102,241,0.1)',
            borderBottom: '1px solid rgba(99,102,241,0.08)',
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-0.5 h-8 rounded-full flex-shrink-0"
              style={{ background: 'linear-gradient(180deg, #6366f1, #8b5cf6)' }}
            />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold" style={{ color: '#6366f1' }}>
                Replying to @{replyTo.senderUsername}
              </p>
              <p className="text-[12px] truncate" style={{ color: '#505060' }}>
                {replyTo.messageType !== 'text'
                  ? `📎 ${replyTo.messageType}`
                  : replyTo.text}
              </p>
            </div>
          </div>
          <button
            onClick={() => setReplyTo(null)}
            className="w-6 h-6 flex items-center justify-center rounded-full
                       transition-colors flex-shrink-0 ml-3"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color:      '#505060',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = '#f0f0f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.color = '#505060';
            }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Main Input Row */}
      <div className="flex items-end gap-2.5 px-4 py-3.5">

        {/* Sticker Button */}
        <ActionBtn
          onClick={() => setShowStickers((v) => !v)}
          active={showStickers}
          label="Stickers"
        >
          <span className="text-base leading-none">🎨</span>
        </ActionBtn>

        {/* File Upload */}
        <ActionBtn
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingMedia}
          label="Attach file"
        >
          {uploadingMedia ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          )}
        </ActionBtn>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.zip,.txt,.mp4"
          onChange={handleFileChange}
        />

        {/* Text Area */}
        <div
          className="flex-1 flex items-end rounded-2xl px-4 py-2.5 transition-all duration-200"
          style={{
            background:   'rgba(255,255,255,0.03)',
            border:       text
              ? '1px solid rgba(99,102,241,0.25)'
              : '1px solid rgba(255,255,255,0.07)',
            boxShadow:    text ? '0 0 0 3px rgba(99,102,241,0.05)' : 'none',
          }}
        >
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            rows={1}
            style={{
              flex:        1,
              background:  'transparent',
              border:      'none',
              outline:     'none',
              color:       '#e0e0e0',
              fontSize:    '14px',
              lineHeight:  '1.5',
              resize:      'none',
              maxHeight:   '120px',
              overflowY:   'auto',
              caretColor:  '#6366f1',
            }}
            className="placeholder-[#303040] scrollbar-hide"
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!text.trim() || isSending}
          className="w-10 h-10 flex items-center justify-center rounded-2xl
                     transition-all duration-200 active:scale-95 flex-shrink-0
                     disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: text.trim()
              ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
              : 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: text.trim()
              ? '0 4px 16px rgba(99,102,241,0.3)'
              : 'none',
          }}
        >
          <svg
            className="w-4 h-4"
            style={{ color: text.trim() ? '#ffffff' : '#404050' }}
            fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.269 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>

      {/* Sticker Picker */}
      {showStickers && (
        <StickerPicker
          onSelect={handleStickerSend}
          onClose={() => setShowStickers(false)}
        />
      )}
    </div>
  );
}

// ── Action Button ─────────────────────────────────────
function ActionBtn({ onClick, disabled, label, active, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-10 h-10 flex items-center justify-center rounded-xl
                 transition-all duration-200 active:scale-95 flex-shrink-0
                 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        background:   active || hovered
          ? 'rgba(99,102,241,0.1)'
          : 'rgba(255,255,255,0.03)',
        border:       active || hovered
          ? '1px solid rgba(99,102,241,0.2)'
          : '1px solid rgba(255,255,255,0.06)',
        color:        active || hovered ? '#a5b4fc' : '#505060',
      }}
    >
      {children}
    </button>
  );
}