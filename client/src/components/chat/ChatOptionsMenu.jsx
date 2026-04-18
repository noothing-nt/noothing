import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../../store/useChatStore';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function ChatOptionsMenu({ chatUser, onClose }) {
  const navigate = useNavigate();
  const { fetchContacts, setActiveChat } = useChatStore();
  const [loading, setLoading] = useState(null);

  const handleBlock = async () => {
    setLoading('block');
    try {
      const { data } = await api.post(`/users/block/${chatUser._id}`);
      toast.success(data.message);
      onClose();
      fetchContacts();
    } catch {
      toast.error('Block failed.');
    } finally {
      setLoading(null);
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm('Clear all messages? This cannot be undone.')) return;
    setLoading('clear');
    try {
      await api.delete(`/users/clear-chat/${chatUser._id}`);
      toast.success('Chat cleared.');
      onClose();
      setActiveChat(null);
      fetchContacts();
    } catch {
      toast.error('Failed to clear chat.');
    } finally {
      setLoading(null);
    }
  };

  const options = [
    {
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      label:  'View Profile',
      action: () => { navigate(`/profile/${chatUser.username}`); onClose(); },
      color:  '#d0d0e0',
      key:    'profile',
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
      label:   'Block User',
      action:  handleBlock,
      color:   '#f87171',
      key:     'block',
      danger:  true,
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      label:  'Clear Chat',
      action: handleClearChat,
      color:  '#f87171',
      key:    'clear',
      danger: true,
    },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="absolute top-full right-0 mt-1.5 z-50 py-1 rounded-2xl
                   overflow-hidden animate-scale-in min-w-[200px]"
        style={{
          background: 'rgba(13,13,20,0.99)',
          border:     '1px solid rgba(255,255,255,0.08)',
          boxShadow:  '0 20px 60px rgba(0,0,0,0.7)',
        }}
      >
        {/* Top shimmer */}
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)',
          marginBottom: 4,
        }} />

        {/* Header */}
        <div
          className="flex items-center gap-2.5 px-4 py-2 mb-1"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center
                       text-[11px] font-bold"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #4338ca)',
              color:      '#fff',
            }}
          >
            {(chatUser.username?.[0] || '?').toUpperCase()}
          </div>
          <div>
            <p className="text-[12px] font-semibold" style={{ color: '#d0d0e0' }}>
              @{chatUser.username}
            </p>
          </div>
        </div>

        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={opt.action}
            disabled={loading === opt.key}
            className="w-full flex items-center gap-3 px-4 py-2.5
                       text-[13px] transition-colors disabled:opacity-50"
            style={{ color: opt.color }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = opt.danger
                ? 'rgba(239,68,68,0.06)'
                : 'rgba(255,255,255,0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {loading === opt.key ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : opt.icon}
            <span className="font-medium">{opt.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}