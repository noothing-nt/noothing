// LoginForm.jsx — Complete Fixed File

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import toast from 'react-hot-toast';

export default function LoginForm({ onForgot }) {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const [form, setForm]             = useState({ username: '', password: '' });
  const [showPassword, setShowPass] = useState(false);
  const [errors, setErrors]         = useState({});

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username is required.';
    if (!form.password)        e.password = 'Password is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const res = await login({
      username: form.username.toLowerCase().trim(),
      password: form.password,
    });
    if (res.success) {
      toast.success('Welcome back! 👋');
      navigate('/');
    } else {
      toast.error(res.message);
      setErrors({ general: res.message });
    }
  };

  // ── Shared input style ────────────────────────────────
  const inputClass = (hasError) => `
    w-full py-3 rounded-xl text-[14px] outline-none
    transition-all duration-200 text-[#f0f0f0]
    placeholder-[#404040]
    border
    ${hasError
      ? 'bg-[#1a0a0a] border-red-500/40'
      : 'bg-[#111111] border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]'
    }
    focus:bg-[#141414]
    focus:border-[rgba(99,102,241,0.5)]
    focus:shadow-[0_0_0_3px_rgba(99,102,241,0.08)]
  `;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>

      {/* ── General Error Banner ── */}
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

      {/* ── Username ── */}
      <div className="space-y-1.5">
        <label className="block text-[12px] font-semibold text-[#606060]
                          uppercase tracking-widest">
          Username
        </label>
        <div className="relative">
          {/* Icon */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2
                          text-[#404040] pointer-events-none z-10">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <input
            type="text"
            value={form.username}
            onChange={(e) => {
              setForm({ ...form, username: e.target.value.toLowerCase() });
              setErrors({ ...errors, username: '', general: '' });
            }}
            placeholder="your_username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            style={{
              background:  '#111111',
              paddingLeft: '2.75rem',
              paddingRight: '1rem',
            }}
            className={inputClass(errors.username)}
          />
        </div>
        {errors.username && (
          <p className="text-[11px] text-red-400 flex items-center gap-1 pl-1">
            <span>⚠</span> {errors.username}
          </p>
        )}
      </div>

      {/* ── Password ── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-[12px] font-semibold text-[#606060]
                            uppercase tracking-widest">
            Password
          </label>
          <button
            type="button"
            onClick={onForgot}
            className="text-[12px] text-[rgba(99,102,241,0.7)]
                       hover:text-[#6366f1] transition-colors font-medium"
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          {/* Lock icon */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2
                          text-[#404040] pointer-events-none z-10">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={(e) => {
              setForm({ ...form, password: e.target.value });
              setErrors({ ...errors, password: '', general: '' });
            }}
            placeholder="••••••••"
            autoComplete="current-password"
            style={{
              background:   '#111111',
              paddingLeft:  '2.75rem',
              paddingRight: '3rem',
            }}
            className={inputClass(errors.password)}
          />
          {/* Eye toggle */}
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            tabIndex={-1}
            className="absolute right-4 top-1/2 -translate-y-1/2
                       text-[#404040] hover:text-[#808080] transition-colors z-10"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
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
        {errors.password && (
          <p className="text-[11px] text-red-400 flex items-center gap-1 pl-1">
            <span>⚠</span> {errors.password}
          </p>
        )}
      </div>

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={isLoading}
        className="relative w-full py-3.5 rounded-xl text-[14px] font-bold
                   text-white overflow-hidden transition-all duration-200
                   active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                   hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] mt-2"
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)',
          boxShadow: '0 4px 20px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent
                        via-white/8 to-transparent -translate-x-full
                        hover:translate-x-full transition-transform duration-700" />
        {isLoading ? (
          <span className="flex items-center justify-center gap-2.5">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Signing in...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Sign In
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        )}
      </button>
    </form>
  );
}