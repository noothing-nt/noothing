import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LogoutModal({ onClose }) {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try { await logout(); } catch {}
    finally { setLoading(false); }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 animate-fade-in"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-xs rounded-3xl overflow-hidden
                     animate-pop-in"
          style={{
            background: 'linear-gradient(180deg, #161616 0%, #111111 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 32px 80px rgba(0,0,0,0.6)',
          }}
        >
          {/* Top shimmer */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r
                          from-transparent via-red-500/30 to-transparent" />

          <div className="p-6 flex flex-col items-center text-center gap-4">
            {/* Icon */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(220,38,38,0.08) 100%)',
                border: '1px solid rgba(239,68,68,0.2)',
                boxShadow: '0 0 30px rgba(239,68,68,0.1)',
              }}
            >
              <svg className="w-7 h-7 text-red-400" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>

            <div>
              <h3 className="text-txt-primary font-bold text-lg tracking-tight">
                Sign Out?
              </h3>
              <p className="text-txt-muted text-sm mt-1.5 leading-relaxed">
                You'll need your username and password to sign back in.
              </p>
            </div>

            <div className="flex gap-3 w-full pt-1">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-3 rounded-xl text-sm font-semibold
                           text-txt-secondary transition-all duration-150
                           active:scale-[0.97] disabled:opacity-50"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="flex-1 py-3 rounded-xl text-sm font-semibold
                           text-white transition-all duration-150
                           active:scale-[0.97] disabled:opacity-60"
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  boxShadow: '0 4px 20px rgba(239,68,68,0.3)',
                }}
              >
                {loading ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}