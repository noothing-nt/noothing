import { useState, useRef, useCallback, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { compressImage } from '../../utils/imageCompressor';

export default function MessageInput({
  onSend,
  onTyping,
  editingMessage,
  onCancelEdit,
  onEditSend,
}) {
  const [text, setText]               = useState('');
  const [showEmoji, setShowEmoji]     = useState(false);
  const [isViewOnce, setIsViewOnce]   = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile]     = useState(null);
  const [sending, setSending]         = useState(false);
  const [focused, setFocused]         = useState(false);
  const textareaRef  = useRef(null);
  const fileInputRef = useRef(null);
  const typingRef    = useRef(false);

  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text || '');
      textareaRef.current?.focus();
    }
  }, [editingMessage]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`;
  }, [text]);

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (!typingRef.current) {
      typingRef.current = true;
      onTyping(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape' && editingMessage) {
      onCancelEdit();
      setText('');
    }
  };

  const handleImagePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setImageFile(compressed);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(compressed);
    } catch {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setIsViewOnce(false);
  };

  const handleEmojiClick = (emojiData) => {
    const ta = textareaRef.current;
    const start = ta.selectionStart;
    const end   = ta.selectionEnd;
    const newText = text.slice(0, start) + emojiData.emoji + text.slice(end);
    setText(newText);
    setShowEmoji(false);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(
        start + emojiData.emoji.length,
        start + emojiData.emoji.length
      );
    }, 0);
  };

  const handleSubmit = useCallback(async () => {
    if (sending) return;
    const trimmed = text.trim();

    if (editingMessage) {
      if (!trimmed) return;
      onEditSend(editingMessage._id, trimmed);
      setText('');
      typingRef.current = false;
      onTyping(false);
      return;
    }

    if (!trimmed && !imageFile) return;

    setSending(true);
    try {
      await onSend({ text: trimmed, imageFile, isViewOnce });
      setText('');
      clearImage();
      typingRef.current = false;
      onTyping(false);
    } catch (err) {
      console.error('Send failed:', err);
    } finally {
      setSending(false);
    }
  }, [text, imageFile, isViewOnce, editingMessage, onSend, onEditSend, onTyping, sending]);

  const canSend = (text.trim().length > 0 || imageFile) && !sending;

  return (
    <div
      className="flex-shrink-0"
      style={{
        borderTop: '1px solid rgba(255,255,255,0.04)',
        background: 'linear-gradient(180deg, #0e0e0e 0%, #0a0a0a 100%)',
      }}
    >
      {/* Edit Banner */}
      {editingMessage && (
        <div
          className="flex items-center justify-between px-4 py-2.5 animate-float-up"
          style={{
            borderBottom: '1px solid rgba(99,102,241,0.15)',
            background: 'rgba(99,102,241,0.05)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-0.5 h-8 rounded-full"
              style={{ background: 'linear-gradient(180deg, #818cf8, #6366f1)' }} />
            <div>
              <p className="text-accent-light text-xs font-semibold">Editing message</p>
              <p className="text-txt-muted text-xs truncate max-w-[220px] mt-0.5">
                {editingMessage.text}
              </p>
            </div>
          </div>
          <button
            onClick={() => { onCancelEdit(); setText(''); }}
            className="w-7 h-7 rounded-lg bg-surface-2 border border-border
                       flex items-center justify-center text-txt-muted
                       hover:text-txt-primary hover:bg-surface-3
                       transition-all duration-150"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="px-4 pt-3 pb-0 animate-float-up">
          <div className="relative inline-flex">
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <img src={imagePreview} alt="Preview"
                className="h-20 w-auto object-cover max-w-[140px]" />
              {isViewOnce && (
                <div className="absolute inset-0 bg-black/65 flex items-center
                                justify-center backdrop-blur-sm">
                  <span className="text-white text-xs font-semibold">👁 Once</span>
                </div>
              )}
            </div>
            <button
              onClick={clearImage}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full
                         flex items-center justify-center shadow-lg
                         transition-all duration-150 active:scale-90"
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                boxShadow: '0 4px 12px rgba(239,68,68,0.4)',
              }}
            >
              <svg className="w-2.5 h-2.5 text-white" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3}
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* View Once Toggle */}
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={() => setIsViewOnce(!isViewOnce)}
              className={`flex items-center gap-1.5 text-[11px] font-semibold
                          px-3 py-1.5 rounded-full border transition-all duration-200
                          ${isViewOnce
                            ? 'text-accent-light border-accent/30 bg-accent/8'
                            : 'text-txt-muted border-border hover:border-border-2'
                          }`}
            >
              <span>👁️</span>
              View Once {isViewOnce ? '· ON' : '· OFF'}
            </button>
            {isViewOnce && (
              <span className="text-txt-muted text-[10px] font-medium">
                Destroys 5s after viewing
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Input Row */}
      <div className="flex items-end gap-2 px-3 py-3">

        {/* Emoji */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center
                        transition-all duration-150 text-xl
                        ${showEmoji
                          ? 'bg-accent/10 border border-accent/25'
                          : 'text-txt-muted hover:text-txt-secondary hover:bg-surface-2 border border-transparent'
                        }`}
          >
            😊
          </button>

          {showEmoji && (
            <div className="absolute bottom-14 left-0 z-50 animate-pop-in">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme="dark"
                skinTonesDisabled
                height={340}
                width={300}
                previewConfig={{ showPreview: false }}
                searchPlaceholder="Search emoji..."
              />
            </div>
          )}
        </div>

        {/* Image attach */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                     text-txt-muted hover:text-txt-secondary hover:bg-surface-2
                     border border-transparent hover:border-border
                     transition-all duration-150"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImagePick}
          className="hidden"
        />

        {/* Textarea */}
        <div
          className={`flex-1 relative rounded-2xl transition-all duration-200
                      ${focused
                        ? 'shadow-glow-sm'
                        : ''
                      }`}
          style={{
            background: focused
              ? 'rgba(99,102,241,0.04)'
              : 'rgba(255,255,255,0.03)',
            border: focused
              ? '1px solid rgba(99,102,241,0.3)'
              : '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              if (typingRef.current) {
                typingRef.current = false;
                onTyping(false);
              }
            }}
            placeholder={editingMessage ? 'Edit message...' : 'Message...'}
            rows={1}
            className="w-full bg-transparent px-4 py-3 text-txt-primary
                       placeholder-txt-muted text-sm focus:outline-none
                       resize-none overflow-hidden leading-relaxed font-medium"
            style={{ minHeight: '46px', maxHeight: '140px' }}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSubmit}
          disabled={!canSend}
          className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center
                      justify-center transition-all duration-200
                      ${canSend
                        ? 'active:scale-90'
                        : 'cursor-not-allowed opacity-40'
                      }`}
          style={canSend ? {
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            boxShadow: '0 4px 20px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
          } : {
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {sending ? (
            <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg
              className={`w-5 h-5 transition-all duration-200
                          ${canSend ? 'text-white' : 'text-txt-muted'}`}
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>

      {/* Emoji backdrop */}
      {showEmoji && (
        <div className="fixed inset-0 z-40" onClick={() => setShowEmoji(false)} />
      )}
    </div>
  );
}