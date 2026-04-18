import { useAuthStore } from '../../store/useAuthStore';
import { useState } from 'react';
import Avatar from '../ui/Avatar';
import InputField from '../ui/InputField';
import Button from '../ui/Button';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

export default function LinkedAccountsSwitcher({ onClose }) {
  const { user, switchAccount } = useAuthStore();
  const [addMode, setAddMode]   = useState(false);
  const [form, setForm]         = useState({ username: '', password: '' });
  const [loading, setLoading]   = useState(false);

  const handleSwitch = async (targetUserId) => {
    try {
      await switchAccount(targetUserId);
      toast.success('Switched account!');
      onClose();
      window.location.reload();
    } catch {
      toast.error('Failed to switch account.');
    }
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/users/linked-accounts', form);
      toast.success('Account linked!');
      setAddMode(false);
      setForm({ username: '', password: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to link account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#111] border-t border-white/8 rounded-t-3xl p-6 max-w-md mx-auto">
        <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-6" />
        <h2 className="text-white font-bold text-lg mb-4">Switch Account</h2>

        {/* Current Account */}
        <div className="flex items-center gap-3 p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl mb-3">
          <Avatar src={user.avatar?.url} username={user.username} size={40} />
          <div>
            <p className="text-sm font-semibold text-white">@{user.username}</p>
            <p className="text-xs text-indigo-400">Current account</p>
          </div>
        </div>

        {/* Linked Accounts */}
        {user.linkedAccounts?.map((acc) => (
          <button
            key={acc.userId}
            onClick={() => handleSwitch(acc.userId)}
            className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-2xl transition-colors mb-1 text-left"
          >
            <Avatar src={acc.avatar} username={acc.username} size={40} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">@{acc.username}</p>
            </div>
            <svg className="w-4 h-4 text-[#404040]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}

        {/* Add Account */}
        {addMode ? (
          <form onSubmit={handleAddAccount} className="mt-4 space-y-3">
            <InputField
              label="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })}
              placeholder="username"
              required
            />
            <InputField
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              required
            />
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setAddMode(false)} fullWidth>Cancel</Button>
              <Button type="submit" loading={loading} fullWidth>Link Account</Button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setAddMode(true)}
            className="w-full flex items-center justify-center gap-2 mt-3 py-3 border border-dashed border-white/10 rounded-2xl text-sm text-[#606060] hover:text-white hover:border-white/20 transition-colors"
          >
            <span className="text-lg">+</span> Add another account
          </button>
        )}
      </div>
    </>
  );
}