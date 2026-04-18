import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import Avatar from '../components/ui/Avatar';
import { formatDistanceToNowStrict } from 'date-fns';

export default function ProfilePage() {
  const { username } = useParams();
  const navigate     = useNavigate();
  const { user: me } = useAuthStore();

  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);

  const isOwnProfile = me.username === username;

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/users/${username}`);
        setProfile(data);

        if (!isOwnProfile) {
          const bl = await api.get('/users/blocklist');
          setIsBlocked(bl.data.some((u) => u._id === data._id));
        }
      } catch {
        toast.error('User not found.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [username]);

  const handleBlock = async () => {
    try {
      const { data } = await api.post(`/users/block/${profile._id}`);
      setIsBlocked(data.blocked);
      toast.success(data.message);
    } catch {
      toast.error('Block failed.');
    }
  };

  const handleMessage = () => {
    navigate(`/chat/${profile._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[#080808] max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
        <button
          onClick={() => navigate(-1)}
          className="text-[#606060] hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-white font-bold">Profile</h1>
      </div>

      {/* Profile Card */}
      <div className="p-6">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-4">
            <Avatar src={profile.avatar?.url} username={profile.username} size={96} />
            {profile.isOnline && (
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-3 border-[#080808]" />
            )}
          </div>

          <h2 className="text-white text-2xl font-black mb-1">@{profile.username}</h2>

          {profile.bio && (
            <p className="text-[#808080] text-sm max-w-xs leading-relaxed">{profile.bio}</p>
          )}

          <div className="mt-3">
            {profile.isOnline ? (
              <span className="inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full font-medium">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Online
              </span>
            ) : profile.lastSeen ? (
              <span className="text-xs text-[#404040]">
                Last seen {formatDistanceToNowStrict(new Date(profile.lastSeen), { addSuffix: true })}
              </span>
            ) : (
              <span className="text-xs text-[#404040]">Offline</span>
            )}
          </div>

          {profile.inviteCode && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/invite/${profile.inviteCode}`
                );
                toast.success('Invite link copied!');
              }}
              className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              🔗 Copy invite link
            </button>
          )}
        </div>

        {/* Actions */}
        {!isOwnProfile && (
          <div className="space-y-3">
            <button
              onClick={handleMessage}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all active:scale-[0.98]"
            >
              💬 Send Message
            </button>

            <button
              onClick={handleBlock}
              className={`w-full py-3.5 border font-semibold rounded-2xl text-sm transition-all ${
                isBlocked
                  ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                  : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
              }`}
            >
              {isBlocked ? '✅ Unblock User' : '🚫 Block User'}
            </button>
          </div>
        )}

        {isOwnProfile && (
          <button
            onClick={() => navigate('/settings')}
            className="w-full py-3.5 bg-[#1a1a1a] border border-white/8 text-white font-semibold rounded-2xl text-sm hover:bg-white/5 transition-colors"
          >
            ⚙️ Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}