import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import toast from 'react-hot-toast';

export default function RegisterForm({ onSwitchToLogin }) {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();

  const [form, setForm] = useState({
    username:      '',
    email:         '',
    password:      '',
    confirmPass:   '',
    acceptedTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [errors, setErrors]             = useState({});

  const validate = () => {
    const e = {};
    const usernameRegex = /^[a-z0-9_.]+$/;
    if (!form.username.trim())
      e.username = 'Username is required.';
    else if (!usernameRegex.test(form.username))
      e.username = 'Only lowercase letters, numbers, _ and . allowed.';
    else if (form.username.length < 3 || form.username.length > 30)
      e.username = 'Must be 3–30 characters.';

    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
      e.email = 'Invalid email format.';

    if (!form.password)
      e.password = 'Password is required.';
    else if (form.password.length < 6)
      e.password = 'Must be at least 6 characters.';

    if (form.password && form.confirmPass !== form.password)
      e.confirmPass = 'Passwords do not match.';

    if (!form.acceptedTerms)
      e.terms = 'You must accept the Terms of Service.';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const res = await register({
      username:      form.username.toLowerCase().trim(),
      password:      form.password,
      email:         form.email.trim() || undefined,
      acceptedTerms: true,
    });
    if (res.success) {
      toast.success('Account created! Welcome to Noothing 🎉');
      navigate('/');
    } else {
      toast.error(res.message);
      setErrors({ general: res.message });
    }
  };

  // ── Password strength ─────────────────────────────────
  const getStrength = () => {
    const p = form.password;
    if (!p) return { score: 0, label: '', color: '' };
    let s = 0;
    if (p.length >= 6)           s++;
    if (p.length >= 10)          s++;
    if (/[A-Z]|[0-9]/.test(p))  s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    const levels = [
      { score: 0, label: '',        color: '' },
      { score: 1, label: 'Weak',    color: 'bg-red-500' },
      { score: 2, label: 'Fair',    color: 'bg-yellow-500' },
      { score: 3, label: 'Good',    color: 'bg-blue-400' },
      { score: 4, label: 'Strong',  color: 'bg-green-400' },
    ];
    return levels[s] || levels[0];
  };
  const strength = getStrength();

  // ── Shared dark input style ───────────────────────────
  const inputClass = (hasError, extraPr = false) => `
    w-full py-3 rounded-xl text-[14px] outline-none
    transition-all duration-200
    text-[#f0f0f0] placeholder-[#404040]
    border
    ${hasError
      ? 'border-red-500/40'
      : 'border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]'
    }
    focus:border-[rgba(99,102,241,0.5)]
    focus:shadow-[0_0_0_3px_rgba(99,102,241,0.08)]
  `;

  // Inline style always forces dark bg (beats Tailwind specificity + autofill)
  const inputStyle = (hasError) => ({
    background:  hasError ? '#1a0a0a' : '#111111',
    paddingLeft: '2.75rem',
    paddingRight: '1rem',
  });

  const inputStyleWithToggle = (hasError) => ({
    background:   hasError ? '#1a0a0a' : '#111111',
    paddingLeft:  '2.75rem',
    paddingRight: '3rem',
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>

      {/* ── General Error ── */}
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
          Username <span className="text-red-400">*</span>
        </label>
        <div className="relative">
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
              setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, '') });
              setErrors({ ...errors, username: '', general: '' });
            }}
            placeholder="cool_username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={30}
            style={{
              ...inputStyle(!!errors.username),
              paddingRight: form.username.length > 0 ? '3.5rem' : '1rem',
            }}
            className={inputClass(!!errors.username)}
          />
          {/* Character count */}
          {form.username.length > 0 && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2
                             text-[11px] text-[#404040] pointer-events-none">
              {form.username.length}/30
            </span>
          )}
        </div>
        {errors.username ? (
          <p className="text-[11px] text-red-400 flex items-center gap-1 pl-1">
            <span>⚠</span> {errors.username}
          </p>
        ) : (
          <p className="text-[11px] text-[#404040] pl-1">
            Lowercase · numbers · underscores · dots only
          </p>
        )}
      </div>

      {/* ── Email (Optional) ── */}
      <div className="space-y-1.5">
        <label className="block text-[12px] font-semibold text-[#606060]
                          uppercase tracking-widest">
          Email
          <span className="ml-1.5 text-[10px] text-[#404040] normal-case
                           tracking-normal font-normal">
            (optional · recovery only)
          </span>
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2
                          text-[#404040] pointer-events-none z-10">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            type="email"
            value={form.email}
            onChange={(e) => {
              setForm({ ...form, email: e.target.value });
              setErrors({ ...errors, email: '', general: '' });
            }}
            placeholder="you@email.com"
            autoComplete="email"
            style={inputStyle(!!errors.email)}
            className={inputClass(!!errors.email)}
          />
        </div>
        {errors.email && (
          <p className="text-[11px] text-red-400 flex items-center gap-1 pl-1">
            <span>⚠</span> {errors.email}
          </p>
        )}
      </div>

      {/* ── Password ── */}
      <div className="space-y-1.5">
        <label className="block text-[12px] font-semibold text-[#606060]
                          uppercase tracking-widest">
          Password <span className="text-red-400">*</span>
        </label>
        <div className="relative">
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
            placeholder="Min 6 characters"
            autoComplete="new-password"
            style={inputStyleWithToggle(!!errors.password)}
            className={inputClass(!!errors.password)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
            className="absolute right-4 top-1/2 -translate-y-1/2
                       text-[#404040] hover:text-[#808080] transition-colors z-10"
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

        {/* Strength bar */}
        {form.password.length > 0 && (
          <div className="space-y-1 pt-0.5">
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
                strength.score <= 1 ? 'text-red-400'     :
                strength.score === 2 ? 'text-yellow-400' :
                strength.score === 3 ? 'text-blue-400'   :
                'text-green-400'
              }`}>
                {strength.label} password
              </p>
            )}
          </div>
        )}

        {errors.password && (
          <p className="text-[11px] text-red-400 flex items-center gap-1 pl-1">
            <span>⚠</span> {errors.password}
          </p>
        )}
      </div>

      {/* ── Confirm Password ── */}
      <div className="space-y-1.5">
        <label className="block text-[12px] font-semibold text-[#606060]
                          uppercase tracking-widest">
          Confirm Password <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2
                          text-[#404040] pointer-events-none z-10">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <input
            type={showConfirm ? 'text' : 'password'}
            value={form.confirmPass}
            onChange={(e) => {
              setForm({ ...form, confirmPass: e.target.value });
              setErrors({ ...errors, confirmPass: '' });
            }}
            placeholder="Repeat your password"
            autoComplete="new-password"
            style={{
              background:   errors.confirmPass ? '#1a0a0a' :
                            form.confirmPass && form.confirmPass === form.password
                              ? '#0a1a0a' : '#111111',
              paddingLeft:  '2.75rem',
              paddingRight: '3rem',
              borderColor:  form.confirmPass && form.confirmPass === form.password
                              ? 'rgba(34,197,94,0.4)' : undefined,
            }}
            className={inputClass(!!errors.confirmPass)}
          />
          {/* Match icon OR eye toggle */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
            {form.confirmPass ? (
              form.confirmPass === form.password ? (
                <svg className="w-4 h-4 text-green-400" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-red-400" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                tabIndex={-1}
                className="text-[#404040] hover:text-[#808080] transition-colors"
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
        </div>
        {errors.confirmPass && (
          <p className="text-[11px] text-red-400 flex items-center gap-1 pl-1">
            <span>⚠</span> {errors.confirmPass}
          </p>
        )}
      </div>

      {/* ── Terms of Service ── */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative mt-0.5 flex-shrink-0">
            <input
              type="checkbox"
              className="sr-only"
              checked={form.acceptedTerms}
              onChange={(e) => {
                setForm({ ...form, acceptedTerms: e.target.checked });
                setErrors({ ...errors, terms: '' });
              }}
            />
            <div
              className={`w-5 h-5 rounded-md border-2 transition-all duration-200
                          flex items-center justify-center
                          ${form.acceptedTerms
                            ? 'bg-[#6366f1] border-[#6366f1] shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                            : errors.terms
                              ? 'border-red-500/50 bg-red-500/5'
                              : 'border-[rgba(255,255,255,0.15)] bg-[#111111] group-hover:border-[rgba(255,255,255,0.25)]'
                          }`}
            >
              {form.acceptedTerms && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-[12px] text-[#606060] leading-relaxed">
            I agree to the{' '}
            <a href="/terms" target="_blank" rel="noreferrer"
              className="text-[rgba(99,102,241,0.8)] hover:text-[#6366f1]
                         underline underline-offset-2 transition-colors"
              onClick={(e) => e.stopPropagation()}>
              Terms of Service
            </a>
            {' '}and{' '}
            <a href="/privacy" target="_blank" rel="noreferrer"
              className="text-[rgba(99,102,241,0.8)] hover:text-[#6366f1]
                         underline underline-offset-2 transition-colors"
              onClick={(e) => e.stopPropagation()}>
              Privacy Policy
            </a>
          </span>
        </label>
        {errors.terms && (
          <p className="text-[11px] text-red-400 flex items-center gap-1 pl-1 mt-1.5">
            <span>⚠</span> {errors.terms}
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
                   hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] mt-1"
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
            Creating Account...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Create Account
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