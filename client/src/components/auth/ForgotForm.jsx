import { useState } from 'react';
import api from '../../lib/axios';

export default function ForgotForm({ onSuccess }) {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  const validate = () => {
    if (!email.trim()) {
      setError('Email address is required.');
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success State ────────────────────────────────────
  if (sent) {
    return (
      <div className="text-center space-y-5 py-2 animate-fade-in">

        {/* Success icon */}
        <div className="relative inline-flex">
          <div
            className="absolute inset-[-8px] rounded-full animate-pulse-soft"
            style={{ background: 'rgba(34,197,94,0.08)', filter: 'blur(16px)' }}
          />
          <div
            className="relative w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.04) 100%)',
              border:     '1px solid rgba(34,197,94,0.2)',
              boxShadow:  '0 0 24px rgba(34,197,94,0.12)',
            }}
          >
            <svg
              className="w-7 h-7"
              style={{ color: '#4ade80' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <p className="text-white font-bold text-[17px]">
            Check your inbox 📬
          </p>
          <p className="text-[#606060] text-[13px] leading-relaxed">
            If an account with{' '}
            <span
              className="font-medium"
              style={{ color: '#a5b4fc' }}
            >
              {email}
            </span>
            {' '}exists, a reset link has been sent.
          </p>
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                       text-[11px] font-medium"
            style={{
              background:  'rgba(99,102,241,0.08)',
              border:      '1px solid rgba(99,102,241,0.15)',
              color:       'rgba(165,180,252,0.8)',
            }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Link expires in 15 minutes
          </div>
        </div>

        {/* Divider */}
        <div
          className="h-px w-full"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        />

        {/* Actions */}
        <div className="space-y-2.5">
          {/* Back to sign in */}
          <button
            onClick={onSuccess}
            className="relative w-full py-3.5 rounded-xl text-[14px] font-bold
                       text-white overflow-hidden transition-all duration-200
                       active:scale-[0.98]
                       hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)',
              boxShadow:  '0 4px 20px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            <div
              className="absolute inset-0 -translate-x-full
                         hover:translate-x-full transition-transform duration-700"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
              }}
            />
            <span className="flex items-center justify-center gap-2">
              Back to Sign In
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>

          {/* Try different email */}
          <button
            onClick={() => { setSent(false); setEmail(''); setError(''); }}
            className="w-full py-2.5 text-[12px] font-medium transition-colors"
            style={{ color: '#505050' }}
            onMouseEnter={(e) => e.target.style.color = '#808080'}
            onMouseLeave={(e) => e.target.style.color = '#505050'}
          >
            Try a different email address
          </button>
        </div>
      </div>
    );
  }

  // ── Form State ───────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>

      {/* ── Error Banner ── */}
      {error && (
        <div
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl
                     text-[13px] animate-slide-down"
          style={{
            background: 'rgba(239,68,68,0.06)',
            border:     '1px solid rgba(239,68,68,0.2)',
            color:      '#f87171',
          }}
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* ── Email Field ── */}
      <div className="space-y-1.5">
        <label
          className="block text-[12px] font-semibold uppercase tracking-widest"
          style={{ color: '#606060' }}
        >
          Recovery Email
        </label>

        <div className="relative">
          {/* Email icon */}
          <div
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10"
            style={{ color: '#404040' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            placeholder="you@email.com"
            autoComplete="email"
            autoFocus
            // ── Inline style forces dark bg — beats autofill + Tailwind ──
            style={{
              background:   error ? '#1a0a0a' : '#111111',
              paddingLeft:  '2.75rem',
              paddingRight: '1rem',
              borderColor:  error ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.06)',
            }}
            className="
              w-full py-3 rounded-xl text-[14px] outline-none
              transition-all duration-200
              text-[#f0f0f0] placeholder-[#404040]
              border
              hover:border-[rgba(255,255,255,0.12)]
              focus:border-[rgba(99,102,241,0.5)]
              focus:shadow-[0_0_0_3px_rgba(99,102,241,0.08)]
            "
            onFocus={(e) => {
              e.target.style.background = '#141414';
              e.target.style.borderColor = 'rgba(99,102,241,0.5)';
            }}
            onBlur={(e) => {
              e.target.style.background = error ? '#1a0a0a' : '#111111';
              e.target.style.borderColor = error
                ? 'rgba(239,68,68,0.4)'
                : 'rgba(255,255,255,0.06)';
            }}
          />
        </div>

        {/* Hint */}
        {!error && (
          <p
            className="text-[11px] pl-1"
            style={{ color: '#404040' }}
          >
            Must match the email registered on your account.
          </p>
        )}
        {error && (
          <p
            className="text-[11px] flex items-center gap-1 pl-1"
            style={{ color: '#f87171' }}
          >
            <span>⚠</span> {error}
          </p>
        )}
      </div>

      {/* ── Info Box ── */}
      <div
        className="flex items-start gap-3 px-4 py-3 rounded-xl"
        style={{
          background: 'rgba(99,102,241,0.04)',
          border:     '1px solid rgba(99,102,241,0.1)',
        }}
      >
        <svg
          className="w-4 h-4 flex-shrink-0 mt-0.5"
          style={{ color: 'rgba(165,180,252,0.6)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p
          className="text-[12px] leading-relaxed"
          style={{ color: '#505050' }}
        >
          For security, we always show the same message whether or not
          the email is registered.
        </p>
      </div>

      {/* ── Submit Button ── */}
      <button
        type="submit"
        disabled={loading}
        className="relative w-full py-3.5 rounded-xl text-[14px] font-bold
                   text-white overflow-hidden transition-all duration-200
                   active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                   hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]"
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)',
          boxShadow:  '0 4px 20px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        {/* Shimmer sweep */}
        <div
          className="absolute inset-0 -translate-x-full
                     hover:translate-x-full transition-transform duration-700"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
          }}
        />

        {loading ? (
          <span className="flex items-center justify-center gap-2.5">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25" cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4"
              />
              <path
                className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Sending reset link...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Send Reset Link
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        )}
      </button>

      {/* ── Spam note ── */}
      <p
        className="text-center text-[11px]"
        style={{ color: '#383838' }}
      >
        Didn't receive it? Check your spam folder or try again.
      </p>
    </form>
  );
}