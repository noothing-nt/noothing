import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import SearchBar from './SearchBar';
import ContactItem from './ContactItem';
import ProfilePanel from '../profile/ProfilePanel';
import CreateRoomModal from '../modals/CreateRoomModal';
import LogoutModal from '../modals/LogoutModal';
import api from '../../api/axios';

export default function Sidebar({ activeChat, onSelectChat, onlineUsers, currentUser }) {
  const { socket } = useSocket();
  const [contacts, setContacts]           = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching]     = useState(false);
  const [showProfile, setShowProfile]     = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showLogout, setShowLogout]       = useState(false);
  const [loading, setLoading]             = useState(true);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const [dmRes, roomRes] = await Promise.all([
        api.get('/users/contacts').catch(() => ({ data: [] })),
        api.get('/rooms').catch(() => ({ data: [] })),
      ]);
      const rooms = roomRes.data.map((r) => ({ ...r, isRoom: true }));
      setContacts([...rooms, ...dmRes.data]);
    } catch (err) {
      console.error('Fetch contacts error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  useEffect(() => {
    if (!socket) return;
    socket.on('contact:update', ({ user: u, lastMessage }) => {
      setContacts((prev) => {
        const exists = prev.find((c) => c._id === u._id);
        if (exists) return prev.map((c) => c._id === u._id ? { ...c, lastMessage } : c);
        return [{ ...u, lastMessage }, ...prev];
      });
    });
    socket.on('user:online',  ({ userId }) =>
      setContacts((prev) => prev.map((c) => c._id === userId ? { ...c, isOnline: true } : c)));
    socket.on('user:offline', ({ userId, lastSeen }) =>
      setContacts((prev) => prev.map((c) => c._id === userId ? { ...c, isOnline: false, lastSeen } : c)));
    return () => {
      socket.off('contact:update');
      socket.off('user:online');
      socket.off('user:offline');
    };
  }, [socket]);

  const handleSearch = async (query) => {
    if (!query.trim()) { setIsSearching(false); setSearchResults([]); return; }
    setIsSearching(true);
    try {
      const { data } = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
      setSearchResults(data);
    } catch {}
  };

  const displayList = isSearching ? searchResults : contacts;

  return (
    <>
      <div className="flex flex-col h-full"
        style={{ background: 'linear-gradient(180deg, #0e0e0e 0%, #0a0a0a 100%)' }}>

        {/* ── HEADER ─────────────────────────────────── */}
        <div className="flex-shrink-0 px-4 pt-5 pb-3"
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            background: 'rgba(255,255,255,0.01)',
          }}>
          <div className="flex items-center justify-between mb-4">

            {/* Profile button */}
            <button
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-3 group flex-1 min-w-0"
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-2xl overflow-hidden
                                border border-border-2 group-hover:border-accent/30
                                transition-colors duration-200"
                  style={{
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                  }}>
                  {currentUser?.avatar?.url ? (
                    <img src={currentUser.avatar.url} alt=""
                      className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center
                                    text-sm font-bold text-white"
                      style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                      }}>
                      {currentUser?.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                {/* Online dot */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-online
                                rounded-full border-2 border-void"
                  style={{ boxShadow: '0 0 8px rgba(34,197,94,0.5)' }} />
              </div>

              {/* Name */}
              <div className="min-w-0 text-left">
                <p className="text-txt-primary text-sm font-semibold truncate
                               tracking-tight group-hover:text-accent-light
                               transition-colors duration-200">
                  {currentUser?.username}
                </p>
                <p className="text-txt-muted text-[11px] truncate">
                  tap to edit profile
                </p>
              </div>
            </button>

            {/* Action buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setShowCreateRoom(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center
                           text-txt-muted hover:text-txt-primary
                           hover:bg-surface-2 border border-transparent
                           hover:border-border transition-all duration-150"
                title="New Group Room"
              >
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              <button
                onClick={() => setShowLogout(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center
                           text-txt-muted hover:text-error
                           hover:bg-red-500/8 border border-transparent
                           hover:border-red-500/20 transition-all duration-150"
                title="Sign Out"
              >
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>

          {/* Search */}
          <SearchBar
            onSearch={handleSearch}
            onClear={() => { setIsSearching(false); setSearchResults([]); }}
          />
        </div>

        {/* ── Section Label ───────────────────────────── */}
        {!isSearching && contacts.length > 0 && (
          <div className="px-5 pt-4 pb-1.5">
            <p className="text-[10px] font-bold text-txt-muted uppercase tracking-[0.12em]">
              Messages
            </p>
          </div>
        )}

        {/* ── CONTACT LIST ────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {loading ? (
            <div className="space-y-1 px-2 pt-2">
              {[...Array(5)].map((_, i) => (
                <div key={i}
                  className="flex items-center gap-3 px-3 py-3 rounded-2xl">
                  <div className="w-12 h-12 rounded-2xl shimmer bg-surface-2 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-surface-2 shimmer rounded-full w-2/3" />
                    <div className="h-2.5 bg-surface-2 shimmer rounded-full w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48
                            text-center px-6 gap-3">
              {isSearching ? (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border
                                  flex items-center justify-center text-2xl">🔍</div>
                  <div>
                    <p className="text-txt-secondary text-sm font-semibold">No results</p>
                    <p className="text-txt-muted text-xs mt-0.5">Try a different username</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border
                                  flex items-center justify-center text-2xl">💬</div>
                  <div>
                    <p className="text-txt-secondary text-sm font-semibold">No conversations</p>
                    <p className="text-txt-muted text-xs mt-0.5">Search to start chatting</p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-0.5 pt-1">
              {isSearching && (
                <p className="text-txt-muted text-[11px] px-4 py-2 font-medium">
                  {searchResults.length} user{searchResults.length !== 1 ? 's' : ''} found
                </p>
              )}
              {displayList.map((contact) => (
                <ContactItem
                  key={contact._id}
                  contact={contact}
                  isActive={activeChat?._id === contact._id}
                  isOnline={onlineUsers.has(contact._id) || contact.isOnline}
                  onClick={() => onSelectChat(contact)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showProfile    && <ProfilePanel   onClose={() => setShowProfile(false)} />}
      {showCreateRoom && (
        <CreateRoomModal
          onClose={() => setShowCreateRoom(false)}
          onCreated={(room) => {
            setContacts((prev) => [{ ...room, isRoom: true }, ...prev]);
            onSelectChat({ ...room, isRoom: true });
            setShowCreateRoom(false);
          }}
        />
      )}
      {showLogout && <LogoutModal onClose={() => setShowLogout(false)} />}
    </>
  );
}