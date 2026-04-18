import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import Avatar from '../components/ui/Avatar';
import { formatDistanceToNowStrict } from 'date-fns';

export default function AdminMatrix() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [banModal, setBanModal]   = useState(null);
  const [banReason, setBanReason] = useState('');

  useEffect(() => {
    loadDashboard();
    loadUsers();
  }, [page, search]);

  const loadDashboard = async () => {
    try {
      const { data } = await api.get('/admin/dashboard');
      setDashboard(data);
    } catch {
      toast.error('Failed to load dashboard.');
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/admin/users?page=${page}&search=${encodeURIComponent(search)}`
      );
      setUsers(data.users);
      setTotalPages(data.pages);
    } catch {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async () => {
    if (!banModal) return;
    try {
      await api.post(`/admin/ban/${banModal._id}`, { reason: banReason });
      toast.success(`@${banModal.username} banned.`);
      setBanModal(null);
      setBanReason('');
      loadUsers();
      loadDashboard();
    } catch {
      toast.error('Ban failed.');
    }
  };

  const handleUnban = async (userId, username) => {
    try {
      await api.post(`/admin/unban/${userId}`);
      toast.success(`@${username} unbanned.`);
      loadUsers();
      loadDashboard();
    } catch {
      toast.error('Unban failed.');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Delete @${username}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/user/${userId}`);
      toast.success(`@${username} deleted.`);
      loadUsers();
      loadDashboard();
    } catch {
      toast.error('Delete failed.');
    }
  };

  const StatCard = ({ label, value, color = 'text-white' }) => (
    <div className="bg-[#111] border border-white/5 rounded-2xl p-4 text-center">
      <p className={`text-2xl font-black ${color}`}>{value ?? '—'}</p>
      <p className="text-xs text-[#505050] mt-1">{label}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080808] max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-xl font-black">
            🔐 Admin Matrix
          </h1>
          <p className="text-[#404040] text-xs mt-0.5">
            Operator: @{user.username}
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="text-[#606060] hover:text-white text-sm"
        >
          ← Exit
        </button>
      </div>

      {/* System Stats */}
      {dashboard && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatCard label="Total Users"    value={dashboard.stats.totalUsers} />
            <StatCard label="Online Now"     value={dashboard.stats.activeUsers} color="text-green-400" />
            <StatCard label="Messages"       value={dashboard.stats.totalMessages} />
            <StatCard label="Banned"         value={dashboard.stats.bannedUsers} color="text-red-400" />
            <StatCard label="New Today"      value={dashboard.stats.newUsersToday} color="text-indigo-400" />
            <StatCard label="New (7 days)"   value={dashboard.stats.newUsers7d} color="text-indigo-300" />
          </div>

          {/* System Health */}
          <div className="bg-[#111] border border-white/5 rounded-2xl p-4 mb-6">
            <h3 className="text-white font-semibold text-sm mb-3">⚡ System Health</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: 'DB State',   value: dashboard.stats.dbState,    ok: dashboard.stats.dbState === 'connected' },
                { label: 'Uptime',     value: dashboard.stats.uptime,     ok: true },
                { label: 'Node',       value: dashboard.stats.nodeVersion, ok: true },
                { label: 'Heap (MB)',  value: dashboard.stats.memoryMB,   ok: dashboard.stats.memoryMB < 400 },
              ].map((s) => (
                <div key={s.label} className="flex justify-between bg-[#0d0d0d] rounded-xl px-3 py-2">
                  <span className="text-[#505050]">{s.label}</span>
                  <span className={s.ok ? 'text-green-400' : 'text-red-400'}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* User Management */}
      <div className="bg-[#111] border border-white/5 rounded-2xl p-4">
        <h3 className="text-white font-semibold text-sm mb-3">👥 User Management</h3>

        {/* Search */}
        <div className="flex items-center gap-2 bg-[#1a1a1a] border border-white/8 rounded-xl px-3 py-2 mb-4">
          <svg className="w-4 h-4 text-[#404040]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by username..."
            className="flex-1 bg-transparent text-sm text-white placeholder-[#404040] outline-none"
          />
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-white/5" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-white/5 rounded w-1/4" />
                  <div className="h-2 bg-white/5 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((u) => (
              <div
                key={u._id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                  u.isBanned
                    ? 'bg-red-500/5 border-red-500/15'
                    : 'bg-[#0d0d0d] border-white/5 hover:border-white/10'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <Avatar src={u.avatar?.url} username={u.username} size={36} />
                  {u.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0d0d0d]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white">@{u.username}</span>
                    {u.role === 'admin' && (
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full font-bold">
                        ADMIN
                      </span>
                    )}
                    {u.isBanned && (
                      <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-bold">
                        BANNED
                      </span>
                    )}
                    {u.isDisabled && (
                      <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full font-bold">
                        DISABLED
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#404040] mt-0.5">
                    Joined {formatDistanceToNowStrict(new Date(u.createdAt), { addSuffix: true })}
                    {u.registrationIP ? ` · ${u.registrationIP}` : ''}
                  </p>
                </div>

                {/* Actions */}
                {u.role !== 'admin' && (
                  <div className="flex gap-1.5 flex-shrink-0">
                    {u.isBanned ? (
                      <button
                        onClick={() => handleUnban(u._id, u.username)}
                        className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-xs font-semibold hover:bg-green-500/20 transition-colors"
                      >
                        Unban
                      </button>
                    ) : (
                      <button
                        onClick={() => { setBanModal(u); setBanReason(''); }}
                        className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-500/20 transition-colors"
                      >
                        Ban
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteUser(u._id, u.username)}
                      className="px-2 py-1.5 text-[#404040] hover:text-red-400 transition-colors text-xs"
                    >
                      🗑
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-[#1a1a1a] text-[#606060] disabled:opacity-30 rounded-xl text-xs hover:bg-white/5 transition-colors"
            >
              ← Prev
            </button>
            <span className="text-xs text-[#404040]">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 bg-[#1a1a1a] text-[#606060] disabled:opacity-30 rounded-xl text-xs hover:bg-white/5 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Ban Modal */}
      {banModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={() => setBanModal(null)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-[#111] border border-white/10 rounded-2xl p-6 max-w-sm mx-auto">
            <h3 className="text-white font-bold text-lg mb-1">Ban @{banModal.username}</h3>
            <p className="text-[#606060] text-sm mb-4">Provide a reason for the ban.</p>
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Reason (e.g. Terms of Service violation)"
              className="w-full bg-[#1a1a1a] border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#404040] resize-none outline-none mb-4"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setBanModal(null)}
                className="flex-1 py-3 bg-[#1a1a1a] border border-white/8 text-[#d0d0d0] rounded-xl text-sm font-semibold hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleBan}
                className="flex-1 py-3 bg-red-500 hover:bg-red-400 text-white rounded-xl text-sm font-bold transition-colors"
              >
                🔨 Ban User
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}