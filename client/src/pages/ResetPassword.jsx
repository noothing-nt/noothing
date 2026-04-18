import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { token }  = useParams();
  const navigate   = useNavigate();

  const [form, setForm]         = useState({ newPassword: '', confirmPassword: '' });
  const [showNew, setShowNew]   = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);
  const [errors, setErrors]     = useState({});

  // Password strength
  const getStrength = (p) => {
    if (!p) return { score: 0, label: '', color: '' };
    let s = 0;
    if (p.length >= 6)             s++;
    if (p.length >= 10)            s++;
    if (/[A-Z]|[0-9]/.test(p))    s++;
    if (/[^A-Za-z0-9]/.test(p))   s++;
    const m = [
      { score: 0, label: '',       color: '' },
      { score: 1, label: 'Weak',   color: 'bg-red-500' },
      { score: 2, label: 'Fair',   color: 'bg-yellow-500' },
      { score: 3, label: 'Good',   color: 'bg-blue-400' },
      { score: 4, label: 'Strong', color: 'bg-green-400' },
    ];
    return m[s] || m[0];
  };

  const strength = getStrength(form.newPassword);

  const validate = () => {
    const e = {};
    if (!form.newPassword)
      e.newPassword = 'New password is required.';
    else if (form.newPassword.length < 6)
      e.newPassword = 'Password must be at least 6 characters.';

    if (!form.confirmPassword)
      e.confirmPassword = 'Please confirm your password.';
    else if (form.newPassword !== form.confirmPassword)
      e.confirmPassword = 'Passwords do not match.';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: form.newPassword,
      });
      setDone(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Reset failed. Link may have expired.';
      toast.error(msg);
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] mesh-bg flex items-center justify-center p-4
                    relative overflow-hidden">

      {/* ── Ambient orbs ─────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px]
                        bg-accent/6 rounded-full blur-[120px] animate-pulse-soft" />
        <div className="absolute bottom-[-10%] right-[5%] w-[350px] h-[350px]
                        bg-violet-600/5 rounded-full blur-[100px] animate-pulse-soft"
          style={{ animationDelay: '1.5s' }} />
      </div>

      {/* ── Grid ─────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative w-full max-w-[400px] animate-float-up">

        {/* ── Logo ──────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="relative inline-flex mb-4">
            <div className="absolute inset-[-8px] rounded-[24px] bg-accent/10
                            blur-xl animate-pulse-soft" />
            <div
              className="relative w-16 h-16 rounded-[20px] flex items-center justify-center"
              style={{
                background: 'linear-gradient(145deg, #1a1a2e 0%, #16162a 50%, #0f0f1a 100%)',
                border: '1px solid rgba(99,102,241,0.3)',
                boxShadow: '0 0 0 1px rgba(99,102,241,0.1), 0 20px 60px rgba(99,102,241,0.2)',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                <defs>
                  <linearGradient id="lgReset" x1="0" y1="0" x2="40" y2="40"
                    gradientUnits="userSpaceOnUse">
                    <stop offset="0%"   stopColor="#a5b4fc" />
                    <stop offset="100%" stopColor="#4338ca" />
                  </linearGradient>
                </defs>
                <path
                  d="M8 10C8 7.8 9.8 6 12 6H28C30.2 6 32 7.8 32 10V22C32 24.2 30.2 26 28 26H22L16 32V26H12C9.8 26 8 24.2 8 22V10Z"
                  fill="url(#lgReset)" opacity="0.95"
                />
                <circle cx="15" cy="16" r="2" fill="white" opacity="0.9" />
                <circle cx="20" cy="16" r="2" fill="white" opacity="0.7" />
                <circle cx="25" cy="16" r="2" fill="white" opacity="0.5" />
              </svg>
            </div>
          </div>
          <h1 className="text-[28px] font-bold tracking-[-0.03em] gradient-text mb-1">
            Noothing
          </h1>
          <p className="text-txt-muted text-[13px] font-medium">
            Set your new password
          </p>
        </div>

        {/* ── Card ─────────────────────────────────── */}
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(22,22,22,0.95) 0%, rgba(14,14,14,0.98) 100%)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {/* Top shimmer */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r
                          from-transparent via-accent/40 to-transparent" />

          <div className="p-7">
            {done ? (
              /* ── Success State ── */
              <div className="text-center space-y-6 py-2 animate-fade-in">
                <div className="relative inline-flex">
                  <div className="absolute inset-[-8px] rounded-full
                                  bg-green-400/10 blur-xl animate-pulse-soft" />
                  <div
                    className="relative w-20 h-20 rounded-full flex items-center justify-center"
                    style={{
                      background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 100%)',
                      border: '1px solid rgba(34,197,94,0.25)',
                      boxShadow: '0 0 30px rgba(34,197,94,0.15)',
                    }}
                  >
                    <svg className="w-9 h-9 text-green-400" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>

                <div>
                  <h2 className="text-white text-[20px] font-bold mb-2">
                    Password Reset! 🎉
                  </h2>
                  <p className="text-txt-muted text-[13px] leading-relaxed">
                    Your password has been successfully updated.
                    <br />
                    You can now sign in with your new credentials.
                  </p>
                </div>

                <button
                  onClick={() => navigate('/auth')}
                  className="relative w-full py-3.5 rounded-xl text-[14px] font-bold
                             text-white overflow-hidden transition-all duration-200
                             active:scale-[0.98]
                             hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)',
                    boxShadow: '0 4px 20px rgba(99,102,241,0.25)',
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    Sign In Now
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
              </div>
            ) : (
              /* ── Form State ── */
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>

                {/* Header */}
                <div className="mb-6">
                  <h2 className="text-white text-[20px] font-bold mb-1">
                    Reset Password
                  </h2>
                  <p className="text-txt-muted text-[13px] leading-relaxed">
                    Choose a strong password you haven't used before.
                  </p>
                </div>

                {/* General Error */}
                {errors.general && (
                  <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl
                                  bg-red-500/8 border border-red-500/20
                                  text-red-400 text-[13px] animate-slide-down">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd" />
                    </svg>
                    {errors.general}
                  </div>
                )}

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="block text-[12px] font-semibold text-txt-muted
                                    uppercase tracking-widest">
                    New Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2
                                    text-txt-muted pointer-events-none">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={form.newPassword}
                      onChange={(e) => {
                        setForm({ ...form, newPassword: e.target.value });
                        setErrors({ ...errors, newPassword: '', general: '' });
                      }}
                      placeholder="Min 6 characters"
                      autoComplete="new-password"
                      autoFocus
                      className={`w-full pl-11 pr-12 py-3 rounded-xl text-[14px] text-white
                                  placeholder-txt-muted/50 outline-none transition-all duration-200
                                  bg-void-2 border
                                  focus:border-accent/50 focus:bg-surface
                                  focus:shadow-[0_0_0_3px_rgba(99,102,241,0.08)]
                                  ${errors.newPassword
                                    ? 'border-red-500/40 bg-red-500/5'
                                    : 'border-border hover:border-border-hover'
                                  }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2
                                 text-txt-muted hover:text-txt-secondary transition-colors"
                      tabIndex={-1}
                    >
                      {showNew ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                          stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                          stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Strength meter */}
                  {form.newPassword.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              i <= strength.score ? strength.color : 'bg-white/8'
                            }`}
                          />
                        ))}
                      </div>
                      {strength.label && (
                        <p className={`text-[11px] pl-1 ${
                          strength.score <= 1 ? 'text-red-400'    :
                          strength.score === 2 ? 'text-yellow-400' :
                          strength.score === 3 ? 'text-blue-400'   :
                          'text-green-400'
                        }`}>
                          {strength.label} password
                        </p>
                      )}
                    </div>
                  )}

                  {errors.newPassword && (
                    <p className="text-[11px] text-red-400 flex items-center gap-1 pl-1">
                      <span>⚠</span> {errors.newPassword}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="block text-[12px] font-semibold text-txt-muted
                                    uppercase tracking-widest">
                    Confirm Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2
                                    text-txt-muted pointer-events-none">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <input
                      type={showConf ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={(e) => {
                        setForm({ ...form, confirmPassword: e.target.value });
                        setErrors({ ...errors, confirmPassword: '' });
                      }}
                      placeholder="Repeat your new password"
                      autoComplete="new-password"
                      className={`w-full pl-11 pr-12 py-3 rounded-xl text-[14px] text-white
                                  placeholder-txt-muted/50 outline-none transition-all duration-200
                                  bg-void-2 border
                                  focus:border-accent/50 focus:bg-surface
                                  focus:shadow-[0_0_0_3px_rgba(99,102,241,0.08)]
                                  ${errors.confirmPassword
                                    ? 'border-red-500/40 bg-red-500/5'
                                    : form.confirmPassword && form.confirmPassword === form.newPassword
                                      ? 'border-green-500/40'
                                      : 'border-border hover:border-border-hover'
                                  }`}
                    />
                    {/* Match icon */}
                    {form.confirmPassword ? (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {form.confirmPassword === form.newPassword ? (
                          <svg className="w-4 h-4 text-green-400" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-red-400" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowConf((v) => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2
                                   text-txt-muted hover:text-txt-secondary transition-colors"
                        tabIndex={-1}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                          stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-[11px] text-red-400 flex items-center gap-1 pl-1">
                      <span>⚠</span> {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full py-3.5 rounded-xl text-[14px] font-bold
                             text-white overflow-hidden transition-all duration-200
                             active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                             hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)',
                    boxShadow: '0 4px 20px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent
                                  via-white/8 to-transparent -translate-x-full
                                  hover:translate-x-full transition-transform duration-700" />

                  {loading ? (
                    <span className="flex items-center justify-center gap-2.5">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10"
                          stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Resetting Password...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Reset Password
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  )}
                </button>

                {/* Back link */}
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className="w-full text-center text-[12px] text-txt-muted
                             hover:text-txt-secondary transition-colors py-1"
                >
                  ← Back to Sign In
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── Bottom badges ─────────────────────────── */}
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