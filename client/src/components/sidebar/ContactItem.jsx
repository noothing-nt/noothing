import OnlineDot from '../shared/OnlineDot';
import ReadReceipt from '../shared/ReadReceipt';

function formatTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now   = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1)   return 'now';
  if (diffMins < 60)  return `${diffMins}m`;
  if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7)   return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function ContactItem({ contact, isActive, isOnline, onClick }) {
  const isRoom    = contact.isRoom;
  const name      = isRoom ? contact.name : contact.username;
  const lastMsg   = contact.lastMessage;
  const hasAvatar = contact.avatar?.url || (typeof contact.avatar === 'string' && contact.avatar);

  const lastMsgText = lastMsg?.isDeleted
    ? '🚫 Deleted message'
    : lastMsg?.isViewOnce
    ? '👁 View once photo'
    : lastMsg?.image?.url && !lastMsg?.text
    ? '📷 Photo'
    : lastMsg?.text
    ? lastMsg.text
    : isRoom
    ? `${contact.members?.length || 0} members`
    : 'Tap to start chatting';

  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl
        text-left transition-all duration-150 group relative overflow-hidden
        ${isActive
          ? 'bg-accent/8 border border-accent/15'
          : 'border border-transparent hover:bg-surface-2 hover:border-border'
        }
      `}
      style={isActive ? {
        boxShadow: 'inset 0 1px 0 rgba(99,102,241,0.1)',
      } : {}}
    >
      {/* Active left bar */}
      {isActive && (
        <div className="absolute left-0 top-[20%] bottom-[20%] w-0.5 rounded-full
                        bg-gradient-to-b from-accent-light to-accent" />
      )}

      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div
          className={`w-12 h-12 rounded-2xl overflow-hidden flex items-center
                      justify-center transition-all duration-200
                      ${isActive ? 'ring-1 ring-accent/30' : ''}`}
          style={{
            background: hasAvatar ? 'transparent' : 'linear-gradient(135deg, #1c1c2e 0%, #16162a 100%)',
            border: hasAvatar ? 'none' : '1px solid rgba(99,102,241,0.15)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          {hasAvatar ? (
            <img
              src={contact.avatar?.url || contact.avatar}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[15px] font-bold"
              style={{
                background: 'linear-gradient(135deg, #a5b4fc, #6366f1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
              {isRoom ? '👥' : name?.[0]?.toUpperCase()}
            </span>
          )}
        </div>

        {/* Online indicator */}
        {!isRoom && isOnline && (
          <div
            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-online
                       rounded-full border-2 border-void"
            style={{ boxShadow: '0 0 8px rgba(34,197,94,0.6)' }}
          />
        )}

        {/* Burner badge */}
        {isRoom && contact.isBurner && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full
                          bg-burner border border-void flex items-center
                          justify-center text-[9px]"
            title="Burner Room">
            🔥
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className={`font-semibold text-[13.5px] truncate tracking-tight
                           ${isActive ? 'text-accent-light' : 'text-txt-primary'}`}>
            {name}
          </span>
          <span className="text-txt-muted text-[11px] flex-shrink-0 font-medium">
            {formatTime(lastMsg?.createdAt)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {lastMsg && !isRoom && (
            <ReadReceipt status={lastMsg.status} mini />
          )}
          <p className="text-txt-muted text-[12px] truncate leading-relaxed">
            {lastMsgText}
          </p>
        </div>
      </div>
    </button>
  );
}