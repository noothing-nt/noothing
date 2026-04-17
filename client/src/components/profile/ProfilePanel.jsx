import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { compressImage } from '../../utils/imageCompressor';
import api from '../../api/axios';

export default function ProfilePanel({ onClose }) {
  const { user, updateUser } = useAuth();
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setError('');
    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append('avatar', compressed);
      const { data } = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Avatar upload failed.');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleSaveBio = async () => {
    setSaving(true);
    setError('');
    try {
      const { data } = await api.put('/users/profile', { bio });
      updateUser(data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/join/${user?.inviteCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-void-2
                      border-r border-border z-50 flex flex-col
                      shadow-2xl animate-slide-up">

        {/* Header */}
        <div className="glass border-b border-border px-5 py-4
                        flex items-center justify-between flex-shrink-0">
          <h2 className="text-txt-primary font-semibold text-base">My Profile</h2>
          <button
            onClick={onClose}
            className="p-2 text-txt-muted hover:text-txt-primary
                       hover:bg-surface rounded-xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">

          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-surface
                              border-2 border-border">
                {user?.avatar?.url ? (
                  <img src={user.avatar.url} alt="Avatar"
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center
                                  bg-surface-2 text-3xl font-bold text-txt-secondary">
                    {user?.username?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              {/* Upload overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 rounded-full bg-black/60
                           flex items-center justify-center opacity-0
                           group-hover:opacity-100 transition-opacity
                           cursor-pointer"
              >
                {uploadingAvatar ? (
                  <svg className="animate-spin w-6 h-6 text-white"
                    viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0
                         0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07
                         7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <p className="text-txt-muted text-xs">Tap photo to change</p>
          </div>

          {/* User info */}
          <div className="space-y-1">
            <p className="text-txt-muted text-xs font-medium uppercase tracking-wider">
              Username
            </p>
            <div className="flex items-center gap-2 bg-surface border border-border
                            rounded-xl px-4 py-3">
              <span className="text-txt-muted text-sm">@</span>
              <span className="text-txt-primary text-sm font-medium">
                {user?.username}
              </span>
            </div>
            <p className="text-txt-muted text-[11px] px-1">
              Usernames cannot be changed after registration.
            </p>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-txt-muted text-xs font-medium uppercase tracking-wider">
                Bio
              </p>
              <span className="text-txt-muted text-xs">{bio.length}/150</span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 150))}
              placeholder="Tell people about yourself..."
              rows={3}
              className="w-full bg-surface border border-border rounded-xl
                         px-4 py-3 text-txt-primary placeholder-txt-muted text-sm
                         focus:outline-none focus:border-accent/50 focus:ring-1
                         focus:ring-accent/20 transition-all duration-200 resize-none"
            />
            <button
              onClick={handleSaveBio}
              disabled={saving}
              className="w-full bg-accent hover:bg-accent-dim text-white text-sm
                         font-medium py-2.5 rounded-xl transition-all duration-200
                         disabled:opacity-50 active:scale-[0.98]"
            >
              {saving ? 'Saving...' : 'Save Bio'}
            </button>
          </div>

          {/* Invite Link */}
          <div className="space-y-2">
            <p className="text-txt-muted text-xs font-medium uppercase tracking-wider">
              My Invite Link
            </p>
            <div className="flex items-center gap-2 bg-surface border border-border
                            rounded-xl px-4 py-3">
              <span className="text-txt-secondary text-xs flex-1 truncate font-mono">
                {window.location.origin}/join/{user?.inviteCode}
              </span>
              <button
                onClick={copyInviteLink}
                className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg
                            transition-all duration-200 font-medium
                            ${copied
                              ? 'bg-online/20 text-online border border-online/30'
                              : 'bg-accent/10 text-accent border border-accent/20'
                            }`}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-txt-muted text-[11px] px-1">
              Share this link so others can message you directly.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400
                            text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
        </div>
      </div>
    </>
  );
}