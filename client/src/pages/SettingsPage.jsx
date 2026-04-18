import { useState, useRef } from 'react';  // ✅ useRef was missing — caused blank screen
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';
import Toggle from '../components/ui/Toggle';
import Avatar from '../components/ui/Avatar'; // ✅ Avatar was missing — caused blank screen

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuthStore();

  const [section, setSection] = useState('privacy');
  const [loading, setLoading] = useState(false);

  const [usernameForm, setUsernameForm] = useState({ newUsername: '', password: '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmNew: '',
  });
  const [deleteForm, setDeleteForm]     = useState({ password: '', securityAnswer: '' });
  const [securityForm, setSecurityForm] = useState({ securityQuestion: '', securityAnswer: '' });

  const handlePrivacyToggle = async (field, value) => {
    try {
      await api.put('/users/profile', { [field]: value });
      updateUser({ [field]: value });
      toast.success('Setting updated.');
    } catch {
      toast.error('Update failed.');
    }
  };

  // ✅ USERNAME CHANGE — one-time only, blocked after first change
  const handleChangeUsername = async (e) => {
    e.preventDefault();

    // Guard: block if already changed once
    if (user.hasChangedUsername) {
      toast.error('You can only change your username once.');
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/change-username', usernameForm);
      // Mark locally that username has been changed
      updateUser({ username: usernameForm.newUsername, hasChangedUsername: true });
      toast.success('Username updated! This can only be done once.');
      setUsernameForm({ newUsername: '', password: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update username.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNew)
      return toast.error('Passwords do not match.');
    if (passwordForm.newPassword.length < 6)
      return toast.error('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password updated!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNew: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecurityQA = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/users/profile', securityForm);
      toast.success('Security Q&A saved.');
      setSecurityForm({ securityQuestion: '', securityAnswer: '' });
    } catch {
      toast.error('Failed to save security Q&A.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ DISABLE ACCOUNT — also sets isSearchable: false so no one can find them
  const handleDisableAccount = async () => {
    const pwd = window.prompt('Enter your password to disable your account:');
    if (!pwd) return;
    try {
      const { data } = await api.put('/auth/disable-account', { password: pwd });
      toast.success(data.message);
      if (data.message.toLowerCase().includes('disabled')) {
        // Also hide from search immediately before logging out
        await api.put('/users/profile', { isSearchable: false, isDisabled: true });
        updateUser({ isSearchable: false, isDisabled: true });
        await logout();
        navigate('/auth');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    const confirmed = window.confirm(
      'THIS IS PERMANENT AND IRREVERSIBLE.\n\nAll your data will be deleted forever.\n\nAre you absolutely sure?'
    );
    if (!confirmed) return;
    setLoading(true);
    try {
      await api.delete('/auth/delete-account', { data: deleteForm });
      toast.success('Account permanently deleted.');
      await logout();
      navigate('/auth');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Deletion failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const SECTIONS = [
    { key: 'privacy',  label: '🔒 Privacy'  },
    { key: 'account',  label: '👤 Account'  },
    { key: 'security', label: '🛡 Security' },
    { key: 'danger',   label: '⚠️ Danger'   },
  ];

  return (
    <div className="min-h-screen bg-[#080808] max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 sticky top-0 bg-[#080808] z-10">
        <button
          onClick={() => navigate('/')}
          className="text-[#606060] hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-white font-bold text-lg">Settings</h1>
      </div>

      {/* Section Tabs */}
      <div className="flex overflow-x-auto gap-2 px-4 py-3 border-b border-white/5 scrollbar-hide">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSection(s.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              section === s.key
                ? 'bg-indigo-600 text-white'
                : 'bg-[#141414] text-[#606060] hover:text-white border border-white/5'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4 pb-24">

        {/* ── PRIVACY ─────────────────────────────────── */}
        {section === 'privacy' && (
          <>
            <SectionCard title="Ghost Protocol" icon="👻">
              <Toggle
                label="Appear in search results"
                description="When off, no one can find you by searching your username."
                checked={user.isSearchable ?? true}
                onChange={(v) => handlePrivacyToggle('isSearchable', v)}
              />
            </SectionCard>

            <SectionCard title="Presence" icon="🟢">
              <Toggle
                label="Show Last Seen"
                description="When off, your last seen timestamp is hidden from everyone."
                checked={user.showLastSeen ?? true}
                onChange={(v) => handlePrivacyToggle('showLastSeen', v)}
              />
            </SectionCard>

            <SectionCard title="Blocklist" icon="🚫">
              <BlocklistManager />
            </SectionCard>
          </>
        )}

        {/* ── ACCOUNT ─────────────────────────────────── */}
        {section === 'account' && (
          <>
            <SectionCard title="Change Username" icon="✏️">
              {/* ✅ Show locked state if already changed once */}
              {user.hasChangedUsername ? (
                <div className="flex items-start gap-3 p-3 bg-yellow-500/8 border border-yellow-500/20 rounded-xl">
                  <span className="text-lg">🔒</span>
                  <div>
                    <p className="text-sm font-semibold text-yellow-400">
                      Username already changed
                    </p>
                    <p className="text-xs text-[#606060] mt-0.5">
                      For security, usernames can only be changed once.
                      Your current username is{' '}
                      <span className="text-white font-medium">@{user.username}</span>.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleChangeUsername} className="space-y-3">
                  <div className="flex items-start gap-2 p-2.5 bg-indigo-500/8 border border-indigo-500/20 rounded-xl mb-1">
                    <span className="text-indigo-400 text-xs mt-0.5">ℹ️</span>
                    <p className="text-xs text-indigo-300">
                      You can only change your username <strong>one time</strong>. Choose carefully.
                    </p>
                  </div>
                  <InputField
                    label="New Username"
                    value={usernameForm.newUsername}
                    onChange={(e) =>
                      setUsernameForm({ ...usernameForm, newUsername: e.target.value.toLowerCase().trim() })
                    }
                    placeholder="new_username"
                    hint="Lowercase, numbers, _ and . only"
                    required
                  />
                  <InputField
                    label="Current Password"
                    type="password"
                    value={usernameForm.password}
                    onChange={(e) =>
                      setUsernameForm({ ...usernameForm, password: e.target.value })
                    }
                    placeholder="Confirm with password"
                    required
                  />
                  <Button type="submit" loading={loading} fullWidth>
                    Update Username (One-Time Only)
                  </Button>
                </form>
              )}
            </SectionCard>

            <SectionCard title="Update Bio" icon="📝">
              <BioEditor />
            </SectionCard>

            <SectionCard title="Avatar" icon="🖼">
              <AvatarUploader />
            </SectionCard>

            <button
              onClick={handleLogout}
              className="w-full py-3.5 bg-[#1a1a1a] border border-white/8 rounded-2xl text-[#d0d0d0] text-sm font-semibold hover:bg-white/5 transition-colors"
            >
              Sign Out
            </button>
          </>
        )}

        {/* ── SECURITY ────────────────────────────────── */}
        {section === 'security' && (
          <>
            <SectionCard title="Change Password" icon="🔑">
              <form onSubmit={handleChangePassword} className="space-y-3">
                <InputField
                  label="Current Password"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  placeholder="Current password"
                  required
                />
                <InputField
                  label="New Password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  placeholder="Min 6 characters"
                  required
                />
                <InputField
                  label="Confirm New Password"
                  type="password"
                  value={passwordForm.confirmNew}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmNew: e.target.value })
                  }
                  placeholder="Repeat new password"
                  required
                />
                <Button type="submit" loading={loading} fullWidth>
                  Update Password
                </Button>
              </form>
            </SectionCard>

            <SectionCard title="Security Question" icon="❓">
              <p className="text-xs text-[#505050] mb-3">
                Used as an extra verification layer for account recovery and deletion.
              </p>
              <form onSubmit={handleSaveSecurityQA} className="space-y-3">
                <InputField
                  label="Security Question"
                  value={securityForm.securityQuestion}
                  onChange={(e) =>
                    setSecurityForm({ ...securityForm, securityQuestion: e.target.value })
                  }
                  placeholder="e.g. Name of your first pet?"
                  required
                />
                <InputField
                  label="Answer"
                  value={securityForm.securityAnswer}
                  onChange={(e) =>
                    setSecurityForm({ ...securityForm, securityAnswer: e.target.value })
                  }
                  placeholder="Your answer (stored encrypted)"
                  required
                />
                <Button type="submit" loading={loading} fullWidth>
                  Save Security Q&A
                </Button>
              </form>
            </SectionCard>

            <SectionCard title="Password Recovery" icon="📧">
              <p className="text-xs text-[#505050] mb-3">
                {user.email
                  ? `Recovery email: ${user.email}`
                  : 'No recovery email set. Add one to enable password reset via email.'}
              </p>
              <EmailEditor />
            </SectionCard>
          </>
        )}

        {/* ── DANGER ZONE ─────────────────────────────── */}
        {section === 'danger' && (
          <>
            <SectionCard title="Disable Account" icon="😴">
              <p className="text-xs text-[#606060] mb-1 leading-relaxed">
                Temporarily deactivate your account. You can re-enable it by logging back in.
              </p>
              {/* ✅ Inform user they will be hidden from search */}
              <div className="flex items-start gap-2 p-2.5 bg-yellow-500/8 border border-yellow-500/20 rounded-xl mb-3">
                <span className="text-yellow-400 text-xs mt-0.5">⚠️</span>
                <p className="text-xs text-yellow-300/80">
                  While disabled, your profile will be{' '}
                  <strong>hidden from all search results</strong> and your online status
                  will not be visible to anyone.
                </p>
              </div>
              <button
                onClick={handleDisableAccount}
                className="w-full py-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-xl text-sm font-semibold hover:bg-yellow-500/20 transition-colors"
              >
                Disable Account
              </button>
            </SectionCard>

            <SectionCard title="Delete Account" icon="💀">
              <p className="text-xs text-red-400/80 mb-4 leading-relaxed">
                ⚠️ This action is <strong>permanent and irreversible</strong>. All your
                messages, profile data, and account information will be destroyed forever.
              </p>
              <form onSubmit={handleDeleteAccount} className="space-y-3">
                <InputField
                  label="Password"
                  type="password"
                  value={deleteForm.password}
                  onChange={(e) =>
                    setDeleteForm({ ...deleteForm, password: e.target.value })
                  }
                  placeholder="Confirm with your password"
                  required
                />
                {user.securityQuestion && (
                  <div>
                    <p className="text-xs text-[#606060] mb-1">{user.securityQuestion}</p>
                    <InputField
                      label="Security Answer"
                      value={deleteForm.securityAnswer}
                      onChange={(e) =>
                        setDeleteForm({ ...deleteForm, securityAnswer: e.target.value })
                      }
                      placeholder="Your security answer"
                    />
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-red-500/10 border border-red-500/40 text-red-400 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-colors disabled:opacity-40"
                >
                  {loading ? 'Deleting...' : 'Permanently Delete Account'}
                </button>
              </form>
            </SectionCard>
          </>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-[#111] border border-white/5 rounded-2xl p-4">
      <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
      {children}
    </div>
  );
}

function BioEditor() {
  const { user, updateUser } = useAuthStore();
  const [bio, setBio]         = useState(user.bio || '');
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await api.put('/users/profile', { bio });
      updateUser({ bio });
      toast.success('Bio updated.');
    } catch {
      toast.error('Failed to update bio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value.slice(0, 150))}
        placeholder="Write a short bio..."
        rows={3}
        className="w-full bg-[#1a1a1a] border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#404040] resize-none outline-none focus:border-indigo-500/50 transition-colors"
      />
      <div className="flex justify-between items-center">
        <span className="text-xs text-[#404040]">{bio.length}/150</span>
        <Button onClick={save} loading={loading} size="sm">Save Bio</Button>
      </div>
    </div>
  );
}

function AvatarUploader() {
  const { user, updateUser } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null); // ✅ now works — useRef imported at top

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    setUploading(true);
    try {
      const { data } = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser({ avatar: data.user.avatar });
      toast.success('Avatar updated!');
    } catch {
      toast.error('Avatar upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar src={user.avatar?.url} username={user.username} size={64} />
        {uploading && (
          <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      <div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {uploading ? 'Uploading...' : 'Change Avatar'}
        </button>
        <p className="text-xs text-[#404040] mt-1">JPG, PNG or WebP · Max 5MB</p>
      </div>
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleUpload}
      />
    </div>
  );
}

function EmailEditor() {
  const { user, updateUser } = useAuthStore();
  const [email, setEmail]     = useState(user.email || '');
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await api.put('/users/profile', { email });
      updateUser({ email });
      toast.success('Recovery email saved.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <InputField
        label="Recovery Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
      />
      <Button onClick={save} loading={loading} fullWidth>
        Save Email
      </Button>
    </div>
  );
}

function BlocklistManager() {
  const [blocklist, setBlocklist] = useState([]);
  const [loaded, setLoaded]       = useState(false);
  const [loading, setLoading]     = useState(false);

  const loadBlocklist = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users/blocklist');
      setBlocklist(data);
      setLoaded(true);
    } catch {
      toast.error('Failed to fetch blocklist.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (userId) => {
    try {
      await api.post(`/users/block/${userId}`);
      setBlocklist((prev) => prev.filter((u) => u._id !== userId));
      toast.success('User unblocked.');
    } catch {
      toast.error('Unblock failed.');
    }
  };

  if (!loaded) {
    return (
      <Button onClick={loadBlocklist} loading={loading} variant="ghost" fullWidth>
        Load Blocklist
      </Button>
    );
  }

  if (blocklist.length === 0) {
    return <p className="text-xs text-[#404040] text-center py-2">No blocked users.</p>;
  }

  return (
    <div className="space-y-2">
      {blocklist.map((u) => (
        <div key={u._id} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar src={u.avatar?.url} username={u.username} size={32} />
            <span className="text-sm text-white">@{u.username}</span>
          </div>
          <button
            onClick={() => handleUnblock(u._id)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            Unblock
          </button>
        </div>
      ))}
    </div>
  );
}