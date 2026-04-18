import MessageBubble from './MessageBubble';
import SystemMessage from './SystemMessage';

export default function MessageList({ messages, currentUserId, chatUserId }) {
  if (!messages.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div
          className="w-14 h-14 flex items-center justify-center mb-4"
          style={{
            borderRadius: '18px',
            background:   'linear-gradient(145deg, #1a1a2e, #0f0f1a)',
            border:       '1px solid rgba(99,102,241,0.15)',
            boxShadow:    '0 0 20px rgba(99,102,241,0.06)',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
            <defs>
              <linearGradient id="msgListGrad" x1="0" y1="0" x2="40" y2="40"
                gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#a5b4fc" />
                <stop offset="100%" stopColor="#4338ca" />
              </linearGradient>
            </defs>
            <path
              d="M8 10C8 7.8 9.8 6 12 6H28C30.2 6 32 7.8 32 10V22C32 24.2 30.2 26 28 26H22L16 32V26H12C9.8 26 8 24.2 8 22V10Z"
              fill="url(#msgListGrad)" opacity="0.7"
            />
            <circle cx="15" cy="16" r="2" fill="white" opacity="0.7" />
            <circle cx="20" cy="16" r="2" fill="white" opacity="0.5" />
            <circle cx="25" cy="16" r="2" fill="white" opacity="0.3" />
          </svg>
        </div>
        <p className="text-[13px] font-medium" style={{ color: '#404050' }}>
          Say hello 👋
        </p>
        <p className="text-[11px] mt-1" style={{ color: '#2a2a3a' }}>
          This is the beginning of your conversation.
        </p>
      </div>
    );
  }

  // Group messages by date
  const grouped = [];
  let lastDate = null;

  messages.forEach((msg) => {
    const d = new Date(msg.createdAt);
    const dateKey = d.toDateString();
    if (dateKey !== lastDate) {
      grouped.push({ type: 'dateSeparator', date: d, key: `date_${dateKey}` });
      lastDate = dateKey;
    }
    grouped.push({ type: 'message', msg, key: msg._id });
  });

  return (
    <div className="flex flex-col gap-0.5 pb-2">
      {grouped.map((item) => {
        if (item.type === 'dateSeparator') {
          return <DateSeparator key={item.key} date={item.date} />;
        }

        const { msg } = item;
        const isSystem = ['system', 'missed_call', 'missed_video'].includes(msg.messageType);
        if (isSystem) return <SystemMessage key={msg._id} message={msg} />;

        const isMine = (msg.sender?._id || msg.sender)?.toString()
          === currentUserId?.toString();

        return (
          <MessageBubble
            key={msg._id || item.key}
            message={msg}
            isMine={isMine}
            chatUserId={chatUserId}
          />
        );
      })}
    </div>
  );
}

function DateSeparator({ date }) {
  const today     = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const ds        = date.toDateString();

  const label = ds === today
    ? 'Today'
    : ds === yesterday
      ? 'Yesterday'
      : date.toLocaleDateString('en-US', {
          month: 'short', day: 'numeric',
          year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
        });

  return (
    <div className="flex items-center gap-3 my-4 px-2">
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />
      <span
        className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border:     '1px solid rgba(255,255,255,0.06)',
          color:      '#404050',
        }}
      >
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />
    </div>
  );
}