import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const USERNAME_REGEX = /^[a-z0-9_.]+$/;

export default function RegisterForm() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  const validateUsername = (value) => {
    if (value.length < 3) return 'At least 3 characters required.';
    if (value.length > 30) return 'Max 30 characters.';
    if (!USERNAME_REGEX.test(value)) return 'Only lowercase letters, numbers, _ and . allowed.';
    return '';
  };

  const handleUsernameChange = (e) => {
    const val = e.target.value.toLowerCase();
    setForm({ ...form, username: val });
    if (val) setUsernameError(validateUsername(val));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const uErr = validateUsername(form.username);
    if (uErr) return setUsernameError(uErr);

    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (!form.acceptedTerms) {
      return setError('You must accept the Terms of Service.');
    }

    setLoading(true);
    try {
      await register(form.username, form.password, form.acceptedTerms);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 
                        text-sm px-4 py-3 rounded-xl animate-fade-in">
          {error}
        </div>
      )}

      {/* Username */}
      <div>
        <label className="block text-xs font-medium text-txt-secondary mb-1.5">
          Username
        </label>
        <input
          type="text"
          value={form.username}
          onChange={handleUsernameChange}
          placeholder="john_doe"
          required
          autoComplete="username"
          className={`w-full bg-void-2 border rounded-xl px-4 py-3
                     text-txt-primary placeholder-txt-muted text-sm
                     focus:outline-none focus:ring-1 transition-all duration-200
                     ${usernameError
                       ? 'border-red-500/50 focus:border-red-500/60 focus:ring-red-500/20'
                       : 'border-border focus:border-accent/60 focus:ring-accent/20'
                     }`}
        />
        {usernameError && (
          <p className="text-red-400 text-xs mt-1.5 animate-fade-in">{usernameError}</p>
        )}
        <p className="text-txt-muted text-xs mt-1">
          Lowercase, numbers, underscores & dots only.
        </p>
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs font-medium text-txt-secondary mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Min 6 characters"
            required
            autoComplete="new-password"
            className="w-full bg-void-2 border border-border rounded-xl px-4 py-3 pr-12
                       text-txt-primary placeholder-txt-muted text-sm
                       focus:outline-none focus:border-accent/60 focus:ring-1
                       focus:ring-accent/20 transition-all duration-200"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 
                       text-txt-muted hover:text-txt-secondary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {showPassword ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7
                     a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878
                     9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3
                     3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543
                     7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
              ) : (
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943
                       9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943
                       -9.542-7z" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-xs font-medium text-txt-secondary mb-1.5">
          Confirm Password
        </label>
        <input
          type="password"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          placeholder="Repeat password"
          required
          autoComplete="new-password"
          className={`w-full bg-void-2 border rounded-xl px-4 py-3
                     text-txt-primary placeholder-txt-muted text-sm
                     focus:outline-none focus:ring-1 transition-all duration-200
                     ${form.confirmPassword && form.password !== form.confirmPassword
                       ? 'border-red-500/50 focus:border-red-500/60 focus:ring-red-500/20'
                       : 'border-border focus:border-accent/60 focus:ring-accent/20'
                     }`}
        />
        {form.confirmPassword && form.password !== form.confirmPassword && (
          <p className="text-red-400 text-xs mt-1.5 animate-fade-in">
            Passwords do not match.
          </p>
        )}
      </div>

      {/* Terms */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative mt-0.5 flex-shrink-0">
          <input
            type="checkbox"
            checked={form.acceptedTerms}
            onChange={(e) => setForm({ ...form, acceptedTerms: e.target.checked })}
            className="sr-only"
          />
          <div
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center
                       transition-all duration-200
                       ${form.acceptedTerms
                         ? 'bg-accent border-accent'
                         : 'bg-void-2 border-border group-hover:border-border-2'
                       }`}
          >
            {form.acceptedTerms && (
              <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </div>
        <span className="text-xs text-txt-secondary leading-relaxed">
          I agree to Noothing's{' '}
          <a href="#" className="text-accent hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-accent hover:underline">Privacy Policy</a>.
          No email required, ever.
        </span>
      </label>

      <button
        type="submit"
        disabled={loading || !!usernameError || !form.acceptedTerms}
        className="w-full bg-accent hover:bg-accent-dim text-white font-semibold 
                   py-3 rounded-xl transition-all duration-200 text-sm
                   disabled:opacity-50 disabled:cursor-not-allowed
                   active:scale-[0.98] shadow-lg shadow-accent/20"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Creating account...
          </span>
        ) : 'Create Account'}
      </button>
    </form>
  );
}