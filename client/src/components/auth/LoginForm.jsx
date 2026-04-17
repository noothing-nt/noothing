import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginForm() {
  const { login } = useAuth();
  const [form, setForm]           = useState({ username: '', password: '' });
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.username, form.password);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) => `
    w-full bg-void-2 rounded-xl px-4 py-3.5 text-txt-primary
    placeholder-txt-muted text-sm font-medium
    focus:outline-none transition-all duration-200
    border ${focused === field
      ? 'border-accent/50 shadow-glow-sm'
      : 'border-border-2 hover:border-border-3'
    }
  `;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/8 border border-red-500/20
                        text-red-400 text-sm px-4 py-3 rounded-xl animate-float-up">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Username */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-semibold text-txt-muted
                          uppercase tracking-widest">
          Username
        </label>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-txt-muted">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })}
            onFocus={() => setFocused('username')}
            onBlur={() => setFocused('')}
            placeholder="your_username"
            required
            autoComplete="username"
            className={inputClass('username') + ' pl-10'}
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-semibold text-txt-muted
                          uppercase tracking-widest">
          Password
        </label>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-txt-muted">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onFocus={() => setFocused('password')}
            onBlur={() => setFocused('')}
            placeholder="••••••••••"
            required
            autoComplete="current-password"
            className={inputClass('password') + ' pl-10 pr-12'}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-txt-muted
                       hover:text-txt-secondary transition-colors p-0.5"
          >
            {showPassword ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="relative w-full py-3.5 rounded-xl font-semibold text-sm
                     text-white overflow-hidden
                     disabled:opacity-60 disabled:cursor-not-allowed
                     active:scale-[0.98] transition-transform duration-150
                     group"
          style={{
            background: loading
              ? 'rgba(99,102,241,0.5)'
              : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)',
            boxShadow: loading
              ? 'none'
              : '0 0 0 1px rgba(99,102,241,0.3), 0 8px 32px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        >
          {/* Hover shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent
                          via-white/8 to-transparent -translate-x-full
                          group-hover:translate-x-full transition-transform
                          duration-700 ease-out" />

          {loading ? (
            <span className="flex items-center justify-center gap-2.5">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Authenticating...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Sign In
              <svg className="w-4 h-4 transition-transform duration-200
                              group-hover:translate-x-0.5"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          )}
        </button>
      </div>
    </form>
  );
}