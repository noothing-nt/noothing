import { create } from 'zustand';
import api from '../lib/axios';

export const useChatStore = create((set, get) => ({
  contacts:          [],
  messages:          [],
  activeChat:        null,
  isLoadingMessages: false,
  isLoadingContacts: false,
  typingUsers:       {},
  incomingCall:      null,
  currentCall:       null,
  hasMoreMessages:   true,
  currentPage:       1,
  replyTo:           null,

  // ── Contacts ─────────────────────────────────────────
  fetchContacts: async () => {
    set({ isLoadingContacts: true });
    try {
      const { data } = await api.get('/users/contacts');
      set({ contacts: data, isLoadingContacts: false });
    } catch {
      set({ isLoadingContacts: false });
    }
  },

  setActiveChat: (user) => {
    set({
      activeChat:      user,
      messages:        [],
      currentPage:     1,
      hasMoreMessages: true,
      replyTo:         null,
    });
  },

  // ── Messages ─────────────────────────────────────────
  fetchMessages: async (userId, page = 1) => {
    set({ isLoadingMessages: true });
    try {
      const { data } = await api.get(`/messages/dm/${userId}?page=${page}`);
      set((state) => ({
        messages:        page === 1 ? data : [...data, ...state.messages],
        isLoadingMessages: false,
        hasMoreMessages: data.length === 50,
        currentPage:     page,
      }));
    } catch {
      set({ isLoadingMessages: false });
    }
  },

  loadMoreMessages: async () => {
    const { activeChat, currentPage, hasMoreMessages, isLoadingMessages } = get();
    if (!activeChat || !hasMoreMessages || isLoadingMessages) return;
    await get().fetchMessages(activeChat._id, currentPage + 1);
  },

  // Optimistic send
  sendMessage: (messageData) => {
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const optimisticMsg = {
      _id:           tempId,
      ...messageData,
      status:        'sent',
      createdAt:     new Date().toISOString(),
      _isOptimistic: true,
    };
    set((state) => ({ messages: [...state.messages, optimisticMsg] }));
    return tempId;
  },

  confirmSentMessage: (message) => {
    set((state) => {
      const recipientId = message.recipient?._id || message.recipient;
      const msgs = state.messages.map((m) => {
        if (
          m._isOptimistic &&
          (m.recipient === recipientId?.toString() || m.recipientId === recipientId?.toString())
        ) {
          return message;
        }
        return m;
      });
      return { messages: msgs };
    });
  },

  receiveMessage: (message) => {
    const { activeChat } = get();
    const senderId = message.sender?._id || message.sender;
    if (activeChat?._id?.toString() === senderId?.toString()) {
      set((state) => {
        // Avoid duplicates
        const exists = state.messages.some((m) => m._id === message._id);
        if (exists) return state;
        return { messages: [...state.messages, message] };
      });
    }
  },

  markMessageDeleted: (messageId) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m._id === messageId
          ? { ...m, isDeleted: true, text: '', image: null, file: null, sticker: null }
          : m
      ),
    }));
  },

  updateMessage: (messageId, updates) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m._id === messageId ? { ...m, ...updates } : m
      ),
    }));
  },

  markMessagesRead: (messageIds) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        messageIds.includes(m._id) ? { ...m, status: 'read' } : m
      ),
    }));
  },

  // ── Reply To ─────────────────────────────────────────
  setReplyTo: (replyData) => {
    set({ replyTo: replyData });
  },

  clearReplyTo: () => {
    set({ replyTo: null });
  },

  // ── Contacts Reorder ─────────────────────────────────
  reorderContacts: (userId, lastMessage, timestamp) => {
    set((state) => {
      const contactExists = state.contacts.some(
        (c) => c._id?.toString() === userId?.toString()
      );

      let updated;
      if (contactExists) {
        updated = state.contacts.map((c) =>
          c._id?.toString() === userId?.toString()
            ? { ...c, lastMessage, lastMessageAt: timestamp }
            : c
        );
      } else {
        // New contact — will be populated on next fetchContacts
        updated = [...state.contacts];
      }

      return {
        contacts: updated.sort((a, b) => {
          const aT = a.lastMessageAt || a.lastMessage?.createdAt || 0;
          const bT = b.lastMessageAt || b.lastMessage?.createdAt || 0;
          return new Date(bT) - new Date(aT);
        }),
      };
    });
  },

  updateContactOnlineStatus: (userId, isOnline, lastSeen = null) => {
    set((state) => ({
      contacts: state.contacts.map((c) =>
        c._id?.toString() === userId?.toString()
          ? { ...c, isOnline, ...(lastSeen ? { lastSeen } : {}) }
          : c
      ),
      activeChat:
        state.activeChat?._id?.toString() === userId?.toString()
          ? { ...state.activeChat, isOnline, ...(lastSeen ? { lastSeen } : {}) }
          : state.activeChat,
    }));
  },

  // ── Typing ───────────────────────────────────────────
  setTyping: (userId, isTyping) => {
    set((state) => ({
      typingUsers: { ...state.typingUsers, [userId]: isTyping },
    }));
  },

  // ── Calls ────────────────────────────────────────────
  setIncomingCall:  (callData) => set({ incomingCall: callData }),
  setCallAccepted:  (callData) => set({ currentCall: callData, incomingCall: null }),
  clearCall:        ()         => set({ incomingCall: null, currentCall: null }),
}));