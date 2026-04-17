import { useEffect, useRef, useState } from 'react';

/**
 * MessageContextMenu
 *
 * Renders a floating context menu anchored to where the user
 * right-clicked (desktop) or long-pressed (mobile).
 *
 * Props:
 *  - x, y          : screen coords (desktop)
 *  - isMobile      : render as bottom sheet instead
 *  - message       : the target message object
 *  - isMine        : whether current user owns the message
 *  - onEdit        : () => void
 *  - onDelete      : () => void
 *  - onCopy        : () => void
 *  - onReply       : () => void  (future ready)
 *  - onClose       : () => void
 */

const MENU_WIDTH  = 200;
const MENU_HEIGHT = 220;

export default function MessageContextMenu({
  x = 0,
  y = 0,
  isMobile = false,
  message,
  isMine = false,
  onEdit,
  onDelete,
  onCopy,
  onReply,
  onClose,
}) {
  const menuRef        = useRef(null);
  const [pos, setPos]  = useState({ x, y });
  const [visible, setVisible] = useState(false);

  // ── Clamp position so menu never overflows viewport ──
  useEffect(() => {
    if (isMobile) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    setPos({
      x: Math.min(x, vw - MENU_WIDTH  - 8),
      y: Math.min(y, vh - MENU_HEIGHT - 8),
    });

    // Small delay so the clamp runs after first paint
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, [x, y, isMobile]);

  // Show immediately on mobile
  useEffect(() => {
    if (isMobile) setVisible(true);
  }, [isMobile]);

  // ── Close on outside click / Escape ──────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick, { passive: true });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [onClose]);

  // ── Helpers ───────────────────────────────────────────
  const hasText   = !!message?.text?.trim();
  const canEdit   = isMine && !message?.isDeleted && hasText;
  const canDelete = isMine && !message?.isDeleted;
  const canCopy   = hasText && !message?.isDeleted;

  const handleAction = (fn) => {
    fn?.();
    onClose();
  };

  // ── Menu items config ─────────────────────────────────
  const items = [
    {
      id: 'reply',
      show: true,
      label: 'Reply',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      ),
      action: () => handleAction(onReply),
      className: 'text-txt-secondary hover:text-txt-primary hover:bg-surface',
    },
    {
      id: 'copy',
      show: canCopy,
      label: 'Copy Text',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012
               2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2
               2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      action: () => handleAction(onCopy),
      className: 'text-txt-secondary hover:text-txt-primary hover:bg-surface',
    },
    {
      id: 'edit',
      show: canEdit,
      label: 'Edit Message',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0
               002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828
               15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      action: () => handleAction(onEdit),
      className: 'text-txt-secondary hover:text-txt-primary hover:bg-surface',
    },
    {
      id: 'divider',
      show: canDelete,
      isDivider: true,
    },
    {
      id: 'delete',
      show: canDelete,
      label: 'Delete for Everyone',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2
               0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0
               00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      action: () => handleAction(onDelete),
      className: 'text-red-400 hover:text-red-300 hover:bg-red-500/10',
    },
  ];

  const visibleItems = items.filter((item) => item.show);

  // ── Timestamp display ─────────────────────────────────
  const timeLabel = message?.createdAt
    ? new Date(message.createdAt).toLocaleString([], {
        month:  'short',
        day:    'numeric',
        hour:   '2-digit',
        minute: '2-digit',
      })
    : '';

  // ════════════════════════════════════════════════════
  // MOBILE — Bottom Sheet
  // ════════════════════════════════════════════════════
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50
                      transition-opacity duration-200
                      ${visible ? 'opacity-100' : 'opacity-0'}`}
          onMouseDown={onClose}
          onTouchStart={onClose}
        />

        {/* Sheet */}
        <div
          ref={menuRef}
          className={`fixed bottom-0 left-0 right-0 z-50
                      bg-void-2 border-t border-border
                      rounded-t-2xl shadow-2xl
                      transition-transform duration-300 ease-out
                      ${visible ? 'translate-y-0' : 'translate-y-full'}`}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-border-2 rounded-full" />
          </div>

          {/* Message preview */}
          {(hasText || message?.image?.url) && (
            <div className="mx-4 mb-3 mt-2 p-3 bg-surface border border-border
                            rounded-xl">
              {message?.image?.url && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-txt-muted text-xs">📷 Photo</span>
                </div>
              )}
              {hasText && (
                <p className="text-txt-secondary text-sm leading-relaxed
                              line-clamp-3 break-words">
                  {message.text}
                </p>
              )}
              {timeLabel && (
                <p className="text-txt-muted text-[11px] mt-1">{timeLabel}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="px-4 pb-2 space-y-1">
            {visibleItems.map((item) => {
              if (item.isDivider) {
                return (
                  <div key={item.id}
                    className="h-px bg-border mx-1 my-2" />
                );
              }
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className={`w-full flex items-center gap-3 px-4 py-3.5
                              rounded-xl text-sm font-medium
                              transition-all duration-150 active:scale-[0.98]
                              ${item.className}`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Cancel button */}
          <div className="px-4 pb-6 pt-2">
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-surface border border-border
                         text-txt-secondary text-sm font-semibold
                         rounded-xl hover:bg-surface-2 active:scale-[0.98]
                         transition-all duration-150"
            >
              Cancel
            </button>
          </div>
        </div>
      </>
    );
  }

  // ════════════════════════════════════════════════════
  // DESKTOP — Floating Dropdown
  // ════════════════════════════════════════════════════
  return (
    <>
      {/* Invisible backdrop */}
      <div className="fixed inset-0 z-40" onMouseDown={onClose} />

      {/* Menu */}
      <div
        ref={menuRef}
        style={{ top: pos.y, left: pos.x, minWidth: MENU_WIDTH }}
        className={`fixed z-50 bg-surface-2 border border-border
                    rounded-2xl shadow-2xl overflow-hidden
                    transition-all duration-150 origin-top-left
                    ${visible
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-95 pointer-events-none'
                    }`}
      >
        {/* Message timestamp header */}
        {timeLabel && (
          <div className="px-4 py-2.5 border-b border-border">
            <p className="text-txt-muted text-[11px] font-medium">
              {timeLabel}
            </p>
            {message?.isEdited && (
              <p className="text-txt-muted text-[10px] italic mt-0.5">
                edited
              </p>
            )}
          </div>
        )}

        {/* Action items */}
        <div className="py-1.5">
          {visibleItems.map((item) => {
            if (item.isDivider) {
              return (
                <div key={item.id}
                  className="h-px bg-border mx-2 my-1" />
              );
            }
            return (
              <button
                key={item.id}
                onClick={item.action}
                className={`w-full flex items-center gap-3 px-4 py-2.5
                            text-sm transition-all duration-100
                            active:scale-[0.98]
                            ${item.className}`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}