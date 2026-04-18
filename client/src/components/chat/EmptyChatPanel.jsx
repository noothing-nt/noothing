export default function EmptyChatPanel() {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center
                 text-center px-8 relative overflow-hidden"
      style={{ background: '#0a0a0f' }}
    >
      {/* Ambient */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 50% 40% at 50% 55%, rgba(99,102,241,0.04) 0%, transparent 70%)',
      }} />

      {/* Grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.015,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      {/* Icon */}
      <div className="relative mb-6">
        <div style={{
          position: 'absolute', inset: -14, borderRadius: 36,
          background: 'rgba(99,102,241,0.05)', filter: 'blur(20px)',
        }} />
        <div
          className="relative w-24 h-24 flex items-center justify-center"
          style={{
            borderRadius: '28px',
            background:   'linear-gradient(145deg, #1a1a2e 0%, #16162a 50%, #0f0f1a 100%)',
            border:       '1px solid rgba(99,102,241,0.2)',
            boxShadow:    '0 0 0 1px rgba(99,102,241,0.08), 0 20px 60px rgba(99,102,241,0.1)',
          }}
        >
          <svg width="44" height="44" viewBox="0 0 40 40" fill="none">
            <defs>
              <linearGradient id="panelGrad" x1="0" y1="0" x2="40" y2="40"
                gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stopColor="#a5b4fc" />
                <stop offset="50%"  stopColor="#6366f1" />
                <stop offset="100%" stopColor="#4338ca" />
              </linearGradient>
            </defs>
            <path
              d="M8 10C8 7.8 9.8 6 12 6H28C30.2 6 32 7.8 32 10V22C32 24.2 30.2 26 28 26H22L16 32V26H12C9.8 26 8 24.2 8 22V10Z"
              fill="url(#panelGrad)" opacity="0.9"
            />
            <circle cx="15" cy="16" r="2" fill="white" opacity="0.9" />
            <circle cx="20" cy="16" r="2" fill="white" opacity="0.65" />
            <circle cx="25" cy="16" r="2" fill="white" opacity="0.4" />
          </svg>
        </div>
      </div>

      {/* Text */}
      <h2
        className="text-[22px] font-bold mb-2 tracking-[-0.02em]"
        style={{
          background:           'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor:  'transparent',
          backgroundClip:       'text',
        }}
      >
        Select a conversation
      </h2>
      <p className="text-[13px] leading-relaxed max-w-[240px]"
        style={{ color: '#404050' }}>
        Choose from your existing chats or search for a user to start messaging.
      </p>

      {/* Badges */}
      <div className="flex items-center gap-3 mt-8">
        {[
          { icon: '🔒', text: 'End-to-end ready' },
          { icon: '⚡', text: 'Real-time' },
          { icon: '👻', text: 'Private' },
        ].map(({ icon, text }) => (
          <div
            key={text}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                       text-[11px] font-medium"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border:     '1px solid rgba(255,255,255,0.05)',
              color:      '#383848',
            }}
          >
            <span>{icon}</span>
            <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}