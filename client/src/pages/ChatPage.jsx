import { useEffect, useRef, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatStore }  from '../store/useChatStore';
import { useAuthStore }  from '../store/useAuthStore';
import { useSocketStore } from '../store/useSocketStore';
import { useNotificationStore } from '../store/useNotificationStore';
import ChatHeader   from '../components/chat/ChatHeader';
import MessageList  from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';
import IncomingCall from '../components/chat/IncomingCall';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import api from '../lib/axios';

export default function ChatPage() {
  const { userId } = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuthStore();
  const { emit }   = useSocketStore();
  const { markChatRead } = useNotificationStore();
  const {
    activeChat, setActiveChat, fetchMessages,
    messages, isLoadingMessages, incomingCall,
    loadMoreMessages, hasMoreMessages,
  } = useChatStore();

  const [chatUser, setChatUser]     = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const messagesEndRef = useRef(null);
  const containerRef   = useRef(null);
  const prevScrollHeight = useRef(0);

  // Fetch chat user info
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoadingUser(true);
        const { data } = await api.get(`/users/${userId}`);
        setChatUser(data);
        setActiveChat(data);
      } catch {
        navigate('/');
      } finally {
        setLoadingUser(false);
      }
    };
    loadUser();

    return () => setActiveChat(null);
  }, [userId]);

  // Fetch messages on mount
  useEffect(() => {
    if (userId) {
      fetchMessages(userId, 1);
      markChatRead(userId);
    }
  }, [userId]);

  // Auto scroll to bottom on new messages (only page 1)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 200;
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  // Preserve scroll position when loading older messages
  useEffect(() => {
    const container = containerRef.current;
    if (!container || isLoadingMessages) return;
    const newScrollHeight = container.scrollHeight;
    container.scrollTop = newScrollHeight - prevScrollHeight.current;
    prevScrollHeight.current = newScrollHeight;
  }, [messages]);

  // Mark messages as read
  useEffect(() => {
    if (!messages.length) return;
    const unreadIds = messages
      .filter((m) => {
        const senderId = m.sender?._id || m.sender;
        return senderId?.toString() !== user._id?.toString()
          && m.status !== 'read'
          && !m._isOptimistic;
      })
      .map((m) => m._id);

    if (unreadIds.length > 0) {
      emit('message:read', { messageIds: unreadIds, senderId: userId });
    }
  }, [messages]);

  // Infinite scroll — load older messages on scroll to top
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (container.scrollTop === 0 && hasMoreMessages && !isLoadingMessages) {
      prevScrollHeight.current = container.scrollHeight;
      loadMoreMessages();
    }
  }, [hasMoreMessages, isLoadingMessages, loadMoreMessages]);

  if (loadingUser) return <LoadingSpinner fullScreen />;
  if (!chatUser)   return null;

  return (
    <div className="h-screen bg-[#080808] flex flex-col max-w-md mx-auto relative">
      <ChatHeader chatUser={chatUser} />

      {/* Messages */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 py-2 space-y-1"
      >
        {isLoadingMessages && (
          <div className="flex justify-center py-3">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <MessageList
          messages={messages}
          currentUserId={user._id}
          chatUserId={userId}
        />
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput chatUserId={userId} chatUser={chatUser} />

      {/* Incoming Call Overlay */}
      {incomingCall && <IncomingCall callData={incomingCall} />}
    </div>
  );
}