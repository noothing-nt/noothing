import { create } from 'zustand';
import { io } from 'socket.io-client';
import { useChatStore } from './useChatStore';
import { useNotificationStore } from './useNotificationStore';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const useSocketStore = create((set, get) => ({
  socket: null,
  onlineUsers: new Set(),

  connect: () => {
    const { socket } = get();

    // ✅ CRITICAL: If socket already exists and is connected, do NOT create
    // a new one. This is what caused duplicate listeners and the x4 badge bug.
    if (socket?.connected) return;

    // ✅ If socket exists but is disconnected, fully destroy it first
    // so old listeners are wiped before we attach new ones
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
    }

    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    // ✅ Attach ALL listeners exactly once right after creation
    registerListeners(newSocket);

    set({ socket: newSocket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.removeAllListeners(); // ✅ wipe all listeners before disconnecting
      socket.disconnect();
    }
    set({ socket: null, onlineUsers: new Set() });
  },

  emit: (event, data) => {
    const { socket } = get();
    socket?.emit(event, data);
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// All socket listeners live here — defined ONCE, never re-registered
// ─────────────────────────────────────────────────────────────────────────────
function registerListeners(socket) {

  // ── Connection ────────────────────────────────────────
  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.warn('Socket disconnected:', reason);
  });

  // ── Online / Offline ──────────────────────────────────
  socket.on('user:online', ({ userId }) => {
    useSocketStore.setState((state) => {
      const next = new Set(state.onlineUsers);
      next.add(userId);
      return { onlineUsers: next };
    });
    useChatStore.getState().updateContactOnlineStatus(userId, true);
  });

  socket.on('user:offline', ({ userId, lastSeen }) => {
    useSocketStore.setState((state) => {
      const next = new Set(state.onlineUsers);
      next.delete(userId);
      return { onlineUsers: next };
    });
    useChatStore.getState().updateContactOnlineStatus(userId, false, lastSeen);
  });

  // ── Messages ──────────────────────────────────────────
  socket.on('message:receive', (message) => {
    const chatStore  = useChatStore.getState();
    const notifStore = useNotificationStore.getState();

    // Always add to the message list
    chatStore.receiveMessage(message);

    // Normalize sender ID
    const senderId = (
      message.sender?._id ?? message.sender ?? message.senderId
    )?.toString();

    // Check if we are actively looking at this chat RIGHT NOW
    const activeChatId = chatStore.activeChat?._id?.toString();

    if (activeChatId && activeChatId === senderId) {
      // ✅ Chat is open — clear badge, do NOT increment
      notifStore.markChatRead(senderId);
    } else {
      // ✅ Chat is closed — increment badge by exactly 1
      notifStore.incrementUnread(senderId);
    }
  });

  socket.on('message:sent', (message) => {
    useChatStore.getState().confirmSentMessage(message);
  });

  socket.on('message:deleted', ({ messageId }) => {
    useChatStore.getState().markMessageDeleted(messageId);
  });

  socket.on('message:edited', ({ messageId, text, editedAt }) => {
    useChatStore.getState().updateMessage(messageId, { text, isEdited: true, editedAt });
  });

  socket.on('message:read', ({ messageIds }) => {
    useChatStore.getState().markMessagesRead(messageIds);
  });

  socket.on('contacts:reorder', ({ userId, lastMessage, timestamp }) => {
    useChatStore.getState().reorderContacts(userId, lastMessage, timestamp);
  });

  // ── Typing ────────────────────────────────────────────
  socket.on('typing:start', ({ userId }) => {
    useChatStore.getState().setTyping(userId, true);
  });

  socket.on('typing:stop', ({ userId }) => {
    useChatStore.getState().setTyping(userId, false);
  });

  // ── Reactions ─────────────────────────────────────────
  socket.on('reaction:updated', ({ messageId, reactions }) => {
    useChatStore.getState().updateMessage(messageId, { reactions });
  });

  // ── Non-message Notifications (friend requests etc.) ──
  socket.on('notification:new', (notif) => {
    const chatStore  = useChatStore.getState();
    const notifStore = useNotificationStore.getState();

    const activeChatId = chatStore.activeChat?._id?.toString();
    const senderId = (
      notif.senderId ?? notif.from ?? notif.userId
    )?.toString();

    // Suppress if we are already in that chat
    if (activeChatId && senderId && activeChatId === senderId) {
      notifStore.markChatRead(senderId);
      return;
    }

    // Only handle non-message type here (messages handled in message:receive)
    if (notif.type !== 'message') {
      notifStore.addNotification(notif);
    }
  });

  // ── Calls ─────────────────────────────────────────────
  socket.on('call:incoming', (data) => {
    useChatStore.getState().setIncomingCall(data);
  });

  socket.on('call:accepted', (data) => {
    useChatStore.getState().setCallAccepted(data);
  });

  socket.on('call:rejected', () => {
    useChatStore.getState().clearCall();
    toast('Call rejected', { icon: '📵' });
  });

  socket.on('call:ended', () => {
    useChatStore.getState().clearCall();
  });

  // ── Block Events ──────────────────────────────────────
  socket.on('user:blocked_by', ({ blockerId }) => {
    toast('A user blocked you.', { icon: '🚫' });
    useChatStore.getState().updateContactOnlineStatus(blockerId, false);
  });

  // ── Admin: Account Banned ─────────────────────────────
  socket.on('account:banned', ({ reason }) => {
    toast.error(`Your account has been banned: ${reason}`);
    setTimeout(() => {
      window.location.href = '/auth';
    }, 3000);
  });
}