import { useState, useRef } from 'react';
import ReadReceipt from '../shared/ReadReceipt';
import ViewOnceImage from './ViewOnceImage';

function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MessageBubble({
  message,
  isMine,
  showAvatar,
  isRoom,
  onContextMenu,
  onLongPress,
  currentUser,
  socket,
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const longPressTimer = useRef(null);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    longPressTimer.current = setTimeout(() => {
      onLongPress?.({ x: touch.clientX, y: touch.clientY, isMobile: true });
    }, 500);
  };
  const handleTouchEnd = () => clearTimeout(longPressTimer.current);

  if (message.isDeleted) {
    return (
      <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-fade-in`}>
        <div
          className="px-4 py-2.5 rounded-2xl text-xs text-txt-muted italic
                     flex items-center gap-2"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          Message deleted
        </div>
      </div>
    );
  }

  const hasImage = !!message.image?.url;
  const hasText  = !!message.text?.trim();
  const isPending = !message._id;

  return (
    <div className={`flex items-end gap-2.5
                     ${isMine ? 'justify-end msg-mine' : 'justify-start msg-other'}`}>

      {/* Other user avatar */}
      {!isMine && (
        <div className="flex-shrink-0 w-7 h-7 mb-0.5">
          {showAvatar ? (
            <div
              className="w-7 h-7 rounded-full overflow-hidden flex items-center
                         justify-center"
              style={{
                background: 'linear-gradient(135deg, #1c1c2e, #13131f)',
                border: '1px solid rgba(99,102,241,0.2)',
              }}
            >
              {message.sender?.avatar?.url ? (
                <img src={message.sender.avatar.url} alt=""
                  className="w-full h-full object-cover" />
              ) : (
                <span
                  className="text-[10px] font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #a5b4fc, #6366f1)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {message.sender?.username?.[0]?.toUpperCase()}
                </span>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Bubble wrapper */}
      <div className={`max-w-[72%] md:max-w-[60%] flex flex-col
                      ${isMine ? 'items-end' : 'items-start'}`}>

        {/* Room sender name */}
        {isRoom && !isMine && showAvatar && (
          <span
            className="text-[11px] font-semibold mb-1 ml-1 tracking-wide"
            style={{
              background: 'linear-gradient(135deg, #a5b4fc, #818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {message.sender?.username}
          </span>
        )}

        {/* The bubble */}
        <div
          onContextMenu={onContextMenu}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchEnd}
          className={`
            relative rounded-2xl overflow-hidden cursor-pointer select-none
            transition-all duration-150 active:opacity-80 active:scale-[0.98]
            ${isMine ? 'rounded-br-sm' : 'rounded-bl-sm'}
            ${isPending ? 'opacity-60' : 'opacity-100'}
          `}
          style={
            hasImage
              ? {
                  background: '#161620',
                  border: '1px solid rgba(255,255,255,0.06)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }
              : isMine
              ? {
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 60%, #4338ca 100%)',
                  boxShadow: '0 4px 20px rgba(99,102,241,0.25), 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
                }
              : {
                  background: 'linear-gradient(135deg, #1c1c2e 0%, #161620 100%)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                }
          }
        >
          {/* View once */}
          {hasImage && message.isViewOnce ? (
            <ViewOnceImage message={message} isMine={isMine} socket={socket} />
          ) : hasImage ? (
            <div className="relative">
              {!imgLoaded && (
                <div className="absolute inset-0 shimmer bg-surface flex items-center
                                justify-center min-w-[180px] min-h-[120px]">
                  <svg className="w-6 h-6 text-txt-muted" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <img
                src={message.image.url}
                alt="Shared"
                onLoad={() => setImgLoaded(true)}
                className={`max-w-full max-h-72 object-cover block
                            transition-opacity duration-300
                            ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
              {hasText && (
                <p className="px-3.5 py-2.5 text-sm text-txt-primary
                              whitespace-pre-wrap break-words leading-relaxed">
                  {message.text}
                </p>
              )}
            </div>
          ) : (
            hasText && (
              <p className={`px-4 py-2.5 text-sm leading-relaxed
                             whitespace-pre-wrap break-words
                             ${isMine ? 'text-white' : 'text-txt-primary'}`}>
                {message.text}
              </p>
            )
          )}
        </div>

        {/* Meta row */}
        <div className={`flex items-center gap-1.5 mt-1 px-1
                        ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-txt-muted text-[11px] font-medium">
            {formatTime(message.createdAt)}
          </span>
          {message.isEdited && (
            <span className="text-txt-muted text-[10px] italic">edited</span>
          )}
          {isMine && !isPending && (
            <ReadReceipt status={message.status} />
          )}
          {isPending && (
            <div className="w-3 h-3 rounded-full border border-txt-muted/40
                            animate-pulse-soft" />
          )}
        </div>
      </div>
    </div>
  );
}