import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { useNotificationStore } from '../store/useNotificationStore';
import Sidebar from '../components/home/Sidebar';
import ChatPanel from '../components/chat/ChatPanel';
import EmptyChatPanel from '../components/chat/EmptyChatPanel';
import LinkedAccountsSwitcher from '../components/home/LinkedAccountsSwitcher';

export default function HomePage() {
  const { userId }              = useParams(); // grabs ID if user navigates to /chat/:userId
  const navigate                = useNavigate();
  const { user }                = useAuthStore();
  const { fetchContacts }       = useChatStore();
  const { fetchNotifications }  = useNotificationStore();
  
  const [showSwitcher, setShowSwitcher] = useState(false);
  // Automatically set the active chat if there's a userId in the URL
  const [activeChatId, setActiveChatId] = useState(userId || null);

  useEffect(() => {
    fetchContacts();
    fetchNotifications();
  }, [fetchContacts, fetchNotifications]);

  // If the URL changes (e.g. from search), update the active chat
  useEffect(() => {
    if (userId) {
      setActiveChatId(userId);
    }
  }, [userId]);

  const handleSelectChat = (contactId) => {
    setActiveChatId(contactId);
    // Optional: Update the URL to reflect the open chat for easy sharing/refreshing
    navigate(`/chat/${contactId}`, { replace: true }); 
  };

  const handleCloseChat = () => {
    setActiveChatId(null);
    navigate('/', { replace: true });
  };

  return (
    <div
      className="h-[100dvh] flex overflow-hidden relative"
      style={{ background: '#0a0a0f' }}
    >
      {/* ── Ambient orbs ── */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
        <div style={{
          position: 'absolute', top: '-10%', left: '-5%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', right: '30%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }} />
      </div>

      {/* ── LEFT SIDEBAR ── */}
      {/* ADDED: w-full md:w-auto to take full width on mobile, and hidden logic to disappear when a chat is open */}
      <div className={`relative z-10 h-full flex-shrink-0 w-full md:w-auto ${activeChatId ? 'hidden md:block' : 'block'}`}>
        <Sidebar
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onSwitchAccount={() => setShowSwitcher(true)}
          user={user}
        />
      </div>

      {/* ── RIGHT CHAT PANEL ── */}
      {/* ADDED: hidden md:flex so it hides on mobile when NO chat is selected, but always shows on desktop */}
      <div className={`flex-1 flex-col min-w-0 relative z-10 bg-[#0a0a0f] ${!activeChatId ? 'hidden md:flex' : 'flex'}`}>
        {activeChatId ? (
          <ChatPanel
            key={activeChatId} // Forces remount when chat changes
            chatUserId={activeChatId}
            onClose={handleCloseChat}
          />
        ) : (
          <EmptyChatPanel />
        )}
      </div>

      {showSwitcher && (
        <LinkedAccountsSwitcher onClose={() => setShowSwitcher(false)} />
      )}
    </div>
  );
}