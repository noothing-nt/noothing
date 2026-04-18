export default function ReplyPreview({ replyTo, isMine }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl mb-1
                 max-w-full overflow-hidden"
      style={{
        background:  isMine
          ? 'rgba(255,255,255,0.08)'
          : 'rgba(255,255,255,0.04)',
        borderLeft:  `2px solid ${isMine ? 'rgba(255,255,255,0.4)' : '#6366f1'}`,
      }}
    >
      <div className="min-w-0">
        <p
          className="text-[10px] font-bold truncate mb-0.5"
          style={{ color: isMine ? 'rgba(255,255,255,0.6)' : '#6366f1' }}
        >
          @{replyTo.senderUsername}
        </p>
        <p
          className="text-[11px] truncate"
          style={{ color: isMine ? 'rgba(255,255,255,0.4)' : '#505060' }}
        >
          {replyTo.messageType !== 'text'
            ? `📎 ${replyTo.messageType}`
            : replyTo.text}
        </p>
      </div>
    </div>
  );
}