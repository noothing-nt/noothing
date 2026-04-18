export default function SystemMessage({ message }) {
  const config = {
    missed_call:  { icon: '📞', text: 'Missed voice call', color: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.2)', textColor: '#f87171' },
    missed_video: { icon: '📹', text: 'Missed video call', color: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.2)', textColor: '#f87171' },
    system:       { icon: 'ℹ️',  text: message.text,      color: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.15)', textColor: '#6366f1' },
  };

  const c = config[message.messageType] || config.system;

  return (
    <div className="flex justify-center my-3 px-4">
      <div
        className="flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-medium"
        style={{
          background: c.color,
          border:     `1px solid ${c.border}`,
          color:      c.textColor,
        }}
      >
        <span>{c.icon}</span>
        <span>{message.text || c.text}</span>
      </div>
    </div>
  );
}