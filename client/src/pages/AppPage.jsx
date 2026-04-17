import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useVisibility } from '../hooks/useVisibility';
import Sidebar from '../components/sidebar/Sidebar';
import ChatWindow from '../components/chat/ChatWindow';
import EmptyState from '../components/shared/EmptyState';
import IncomingCall from '../components/shared/IncomingCall';
import api from '../api/axios';

export default function AppPage() {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [activeChat, setActiveChat] = useState(() => {
    try {
      const saved = sessionStorage.getItem('noothing_active_chat');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isMobileChatOpen, setIsMobileChatOpen] = useState(!!activeChat);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (activeChat) {
      sessionStorage.setItem('noothing_active_chat', JSON.stringify(activeChat));
    } else {
      sessionStorage.removeItem('noothing_active_chat');
    }
  }, [activeChat]);

  useEffect(() => {
    if (!socket) return;

    socket.on('user:online', ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    socket.on('user:offline', ({ userId }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    return () => {
      socket.off('user:online');
      socket.off('user:offline');
    };
  }, [socket]);

  const handleVisibilityRestore = useCallback(() => {
    if (activeChat?.isRoom && socket) {
      socket.emit('room:join', activeChat._id);
    }
  }, [activeChat, socket]);

  useVisibility(handleVisibilityRestore);

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
    setIsMobileChatOpen(true);
    if (chat.isRoom && socket) {
      socket.emit('room:join', chat._id);
    }
  };

  const handleBack = () => {
    setIsMobileChatOpen(false);
    if (activeChat?.isRoom && socket) {
      socket.emit('room:leave', activeChat._id);
    }
  };

  return (
    <div className="flex h-[100dvh] bg-void overflow-hidden relative">
      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <div className={`flex-shrink-0 w-full md:w-[340px] lg:w-[380px] border-r border-border flex flex-col ${isMobileChatOpen ? 'hidden md:flex' : 'flex'}`}>
        <Sidebar
          activeChat={activeChat}
          onSelectChat={handleSelectChat}
          onlineUsers={onlineUsers}
          currentUser={user}
        />
      </div>

      {/* ── CHAT WINDOW ──────────────────────────────────── */}
      <div className={`flex-1 flex flex-col ${isMobileChatOpen ? 'flex' : 'hidden md:flex'}`}>
        {activeChat ? (
          <ChatWindow
            chat={activeChat}
            currentUser={user}
            onBack={handleBack}
            onlineUsers={onlineUsers}
          />
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Global incoming call overlay */}
      <IncomingCall />
    </div>
  );
}