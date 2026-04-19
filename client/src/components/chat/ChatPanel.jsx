import { useEffect, useRef, useState, useCallback } from 'react';
import { useChatStore }          from '../../store/useChatStore';
import { useAuthStore }          from '../../store/useAuthStore';
import { useSocketStore }        from '../../store/useSocketStore';
import { useNotificationStore }  from '../../store/useNotificationStore';
import ChatPanelHeader           from './ChatPanelHeader';
import MessageList               from './MessageList';
import MessageInput              from './MessageInput';
import api                       from '../../lib/axios';

export default function ChatPanel({ chatUserId, onClose }) {
  const { user }         = useAuthStore();
  const { emit }         = useSocketStore();
  const { markChatRead } = useNotificationStore();

  const {
    setActiveChat,
    fetchMessages,
    messages,
    isLoadingMessages,
    loadMoreMessages,
    hasMoreMessages,
    incomingCall,
  } = useChatStore();

  const [chatUser, setChatUser]   = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const containerRef     = useRef(null);
  const messagesEndRef   = useRef(null);
  const prevScrollHeight = useRef(0);
  const isPaginating     = useRef(false);  // useRef NOT useState — avoids re-render loops
  const isFirstLoad      = useRef(true);   // tracks first load to always scroll bottom

  // ─── 1. Load chat user ONCE ──────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoadingUser(true);
        const { data } = await api.get(`/users/${chatUserId}`);
        if (!mounted) return;
        setChatUser(data);
        setActiveChat(data);
      } catch {
        if (mounted) onClose?.();
      } finally {
        if (mounted) setLoadingUser(false);
      }
    };
    load();
    return () => {
      mounted = false;
      setActiveChat(null);
    };
  }, [chatUserId]); // ✅ minimal deps — no function deps that change every render

  // ─── 2. Fetch messages + clear badge ONCE when chat opens ────────────────
  useEffect(() => {
    if (!chatUserId) return;
    isFirstLoad.current = true;
    fetchMessages(chatUserId, 1);
    markChatRead(chatUserId); // ✅ fires ONCE on open, NOT on every message update
  }, [chatUserId]); // ✅ only re-runs if you switch to a different user

  // ─── 3. Scroll logic — ONLY scroll to bottom when appropriate ────────────
  useEffect(() => {
    if (!messages.length) return;

    // If we just loaded older messages via pagination, do NOT scroll to bottom
    if (isPaginating.current) return;

    // On first load OR when a new message arrives (user near bottom), scroll down
    messagesEndRef.current?.scrollIntoView({ behavior: isFirstLoad.current ? 'auto' : 'smooth' });
    isFirstLoad.current = false;
  }, [messages]); // ✅ depends on messages object, not .length — catches new arrivals

  // ─── 4. Mark messages as read (safe — no state updates inside) ───────────
  useEffect(() => {
    if (!messages.length) return;
    const unreadIds = messages
      .filter((m) => {
        const sid = m.sender?._id ?? m.sender;
        return (
          sid?.toString() !== user._id?.toString() &&
          m.status !== 'read' &&
          !m._isOptimistic
        );
      })
      .map((m) => m._id);

    if (unreadIds.length > 0) {
      // emit does NOT update React state, so this cannot cause a re-render loop ✅
      emit('message:read', { messageIds: unreadIds, senderId: chatUserId });
    }
  }, [messages]); // ✅ safe — emit is a stable socket function, not a state setter

  // ─── 5. Pagination on scroll to top ──────────────────────────────────────
  const handleScroll = useCallback(async () => {
    const el = containerRef.current;
    if (!el || !hasMoreMessages || isLoadingMessages || isPaginating.current) return;

    if (el.scrollTop === 0) {
      isPaginating.current   = true;
      prevScrollHeight.current = el.scrollHeight;

      await loadMoreMessages();

      // Restore scroll position so viewport doesn't jump ✅
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop =
            containerRef.current.scrollHeight - prevScrollHeight.current;
        }
        isPaginating.current = false;
      });
    }
  }, [hasMoreMessages, isLoadingMessages, loadMoreMessages]);

  // ─── Render ───────────────────────────────────────────────────────────────
  if (loadingUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full animate-spin border-2 border-indigo-500/20 border-t-indigo-500" />
          <p className="text-[12px] text-[#404050]">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!chatUser) return null;

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f]">
      <ChatPanelHeader chatUser={chatUser} onClose={onClose} />

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3"
      >
        {isLoadingMessages && (
          <div className="flex justify-center py-3">
            <div className="w-5 h-5 rounded-full animate-spin border-2 border-indigo-500/20 border-t-indigo-500" />
          </div>
        )}

        <MessageList
          messages={messages}
          currentUserId={user._id}
          chatUserId={chatUserId}
        />

        {/* Scroll anchor */}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      <MessageInput chatUserId={chatUserId} chatUser={chatUser} />

    </div>
  );
}