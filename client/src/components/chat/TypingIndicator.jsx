export default function TypingIndicator({ users }) {
  if (!users?.length) return null;

  const label = users.length === 1
    ? `${users[0]} is typing`
    : users.length === 2
    ? `${users[0]} & ${users[1]} are typing`
    : 'Several people are typing';

  return (
    <div className="flex items-end gap-2.5 msg-other">
      {/* Avatar spacer */}
      <div className="w-7 flex-shrink-0" />

      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl rounded-bl-sm max-w-fit"
        style={{
          background: 'linear-gradient(135deg, #1c1c2e 0%, #161620 100%)',
          border: '1px solid rgba(99,102,241,0.12)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        {/* Animated dots */}
        <div className="flex items-center gap-1">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
        <span className="text-txt-muted text-xs font-medium">{label}</span>
      </div>
    </div>
  );
}