export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full
                    mesh-bg gap-8 px-8 text-center relative overflow-hidden">

      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[400px] h-[400px] bg-accent/4 rounded-full blur-[80px]
                        animate-pulse-soft" />
      </div>

      {/* Illustration */}
      <div className="relative animate-float-up">
        <div className="absolute inset-[-20px] rounded-full border border-accent/8 animate-pulse-soft" />
        <div className="absolute inset-[-40px] rounded-full border border-accent/4 animate-pulse-soft"
          style={{ animationDelay: '0.5s' }} />

        <div className="relative w-28 h-28 rounded-[32px] flex items-center justify-center"
          style={{
            background: 'linear-gradient(145deg, #1a1a2e 0%, #13131f 100%)',
            border: '1px solid rgba(99,102,241,0.2)',
            boxShadow: '0 0 60px rgba(99,102,241,0.12), 0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}>
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <defs>
              <linearGradient id="emptyGrad" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#c7d2fe" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
            </defs>
            <rect x="6" y="10" width="34" height="22" rx="8" fill="url(#emptyGrad)" opacity="0.9" />
            <path d="M8 32 L4 42 L20 32" fill="url(#emptyGrad)" opacity="0.9" />
            <rect x="18" y="26" width="32" height="20" rx="8"
              fill="#312e81" opacity="0.85"
              stroke="rgba(129,140,248,0.3)" strokeWidth="1" />
            <path d="M48 46 L52 54 L36 46" fill="#312e81" opacity="0.85" />
            <circle cx="30" cy="36" r="2.5" fill="#a5b4fc" opacity="0.8" />
            <circle cx="38" cy="36" r="2.5" fill="#a5b4fc" opacity="0.6" />
            <circle cx="46" cy="36" r="2.5" fill="#a5b4fc" opacity="0.4" />
          </svg>
        </div>
      </div>

      {/* Text */}
      <div className="space-y-2 animate-float-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-xl font-bold tracking-tight gradient-text-subtle">
          Select a conversation
        </h2>
        <p className="text-txt-muted text-sm max-w-xs leading-relaxed">
          Choose a contact from the sidebar or search for a username to start
          a private, encrypted conversation.
        </p>
      </div>

      {/* Feature badges */}
      <div className="flex flex-wrap justify-center gap-2 animate-float-up"
        style={{ animationDelay: '0.2s' }}>
        {[
          { icon: '🔒', label: 'E2EE Ready' },
          { icon: '👁️', label: 'View Once' },
          { icon: '🔥', label: 'Burner Rooms' },
          { icon: '📵', label: 'No Email' },
          { icon: '⚡', label: 'Real-time' },
        ].map(({ icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                       text-[11px] font-semibold text-txt-muted tracking-wide
                       border border-border bg-surface/60"
          >
            <span>{icon}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}