import { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

export default function AuthPage() {
  const [mode, setMode] = useState('login');

  return (
    <div className="min-h-[100dvh] mesh-bg flex items-center justify-center p-4 relative overflow-hidden">

      {/* ── Ambient light orbs ───────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px]
                        bg-accent/6 rounded-full blur-[120px] animate-pulse-soft" />
        <div className="absolute bottom-[-10%] right-[5%] w-[400px] h-[400px]
                        bg-violet-600/5 rounded-full blur-[100px] animate-pulse-soft"
          style={{ animationDelay: '1s' }} />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px]
                        bg-blue-600/4 rounded-full blur-[80px] animate-pulse-soft"
          style={{ animationDelay: '2s' }} />
      </div>

      {/* ── Subtle grid pattern ──────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative w-full max-w-[400px] animate-float-up">

        {/* ── Logo Block ───────────────────────────────── */}
        <div className="text-center mb-8">
          {/* Logo mark */}
          <div className="relative inline-flex mb-5">
            {/* Outer glow ring */}
            <div className="absolute inset-[-8px] rounded-[28px] bg-accent/10
                            blur-xl animate-pulse-soft" />
            {/* Logo container */}
            <div className="relative w-20 h-20 rounded-[24px] flex items-center
                            justify-center shadow-glow-md"
              style={{
                background: 'linear-gradient(145deg, #1a1a2e 0%, #16162a 50%, #0f0f1a 100%)',
                border: '1px solid rgba(99,102,241,0.3)',
                boxShadow: '0 0 0 1px rgba(99,102,241,0.1), 0 20px 60px rgba(99,102,241,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              {/* N logo mark */}
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <defs>
                  <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#a5b4fc" />
                    <stop offset="50%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#4338ca" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {/* Chat bubble shape */}
                <path
                  d="M8 10C8 7.8 9.8 6 12 6H28C30.2 6 32 7.8 32 10V22C32 24.2 30.2 26 28 26H22L16 32V26H12C9.8 26 8 24.2 8 22V10Z"
                  fill="url(#logoGrad)"
                  filter="url(#glow)"
                  opacity="0.95"
                />
                {/* Dots inside */}
                <circle cx="15" cy="16" r="2" fill="white" opacity="0.9" />
                <circle cx="20" cy="16" r="2" fill="white" opacity="0.7" />
                <circle cx="25" cy="16" r="2" fill="white" opacity="0.5" />
              </svg>
            </div>
          </div>

          {/* Wordmark */}
          <h1 className="text-[32px] font-bold tracking-[-0.03em] gradient-text mb-1">
            Noothing
          </h1>
          <p className="text-txt-muted text-[13px] font-medium tracking-wide">
            Privacy-first · No email · End-to-end ready
          </p>
        </div>

        {/* ── Auth Card ────────────────────────────────── */}
        <div
          className="relative rounded-3xl overflow-hidden shadow-premium"
          style={{
            background: 'linear-gradient(180deg, rgba(22,22,22,0.95) 0%, rgba(14,14,14,0.98) 100%)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {/* Top shimmer line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r
                          from-transparent via-accent/40 to-transparent" />

          <div className="p-7">
            {/* ── Tab Switcher ── */}
            <div className="relative flex bg-void-2 rounded-2xl p-1 mb-7
                            border border-border">
              {/* Active indicator */}
              <div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl
                           transition-all duration-300 ease-out"
                style={{
                  left: mode === 'login' ? '4px' : 'calc(50%)',
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(79,70,229,0.1) 100%)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  boxShadow: '0 0 20px rgba(99,102,241,0.1)',
                }}
              />
              {['login', 'register'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setMode(tab)}
                  className={`relative flex-1 py-2.5 text-[13px] font-semibold
                              rounded-xl transition-all duration-200 z-10 capitalize
                              tracking-wide
                              ${mode === tab
                                ? 'text-accent-light'
                                : 'text-txt-muted hover:text-txt-secondary'
                              }`}
                >
                  {tab === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            {/* ── Form ── */}
            {mode === 'login' ? <LoginForm /> : <RegisterForm />}
          </div>
        </div>

        {/* ── Bottom badges ───────────────────────────── */}
        <div className="flex items-center justify-center gap-4 mt-6">
          {[
            { icon: '🔒', text: 'E2EE Ready' },
            { icon: '📵', text: 'No Email' },
            { icon: '⚡', text: 'Real-time' },
          ].map(({ icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                         text-[11px] font-medium text-txt-muted
                         border border-border bg-surface/50"
            >
              <span className="text-xs">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}