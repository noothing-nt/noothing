import { create } from 'zustand';
import api from '../lib/axios';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  unreadByUser: {}, // key is always senderId string

  fetchNotifications: async () => {
    try {
      const { data } = await api.get('/messages/notifications');
      const unreadByUser = {};

      data.forEach((n) => {
        // ✅ Always normalize to a single consistent key
        const id = (n.sender?._id ?? n.senderId ?? n.chatId)?.toString();
        if (id) unreadByUser[id] = (unreadByUser[id] || 0) + 1;
      });

      set({
        notifications: data,
        unreadCount: data.length,
        unreadByUser,
      });
    } catch (e) {
      console.error('fetchNotifications error:', e);
    }
  },

  // ✅ Called by socket store when a message arrives and chat is NOT open
  incrementUnread: (senderId) => {
    if (!senderId) return;
    const id = senderId.toString();
    set((state) => ({
      unreadByUser: {
        ...state.unreadByUser,
        [id]: (state.unreadByUser[id] || 0) + 1,
      },
      unreadCount: state.unreadCount + 1,
    }));
  },

  // ✅ addNotification for non-message notifications (friend requests, etc.)
  addNotification: (notif) => {
    // Normalize the sender key consistently
    const id = (notif.senderId ?? notif.sender?._id ?? notif.chatId)?.toString();
    if (!id) return;

    set((state) => ({
      notifications: [notif, ...state.notifications],
      unreadCount: state.unreadCount + 1,
      unreadByUser: {
        ...state.unreadByUser,
        [id]: (state.unreadByUser[id] || 0) + 1,
      },
    }));
  },

  // ✅ INSTANT local clear first, then sync to server in background
  markChatRead: (userId) => {
    if (!userId) return;
    const id = userId.toString();

    // 1. Wipe badge from UI immediately — no waiting for API
    set((state) => {
      const count = state.unreadByUser[id] || 0;
      if (count === 0) return state; // nothing to clear, skip re-render

      const { [id]: _, ...rest } = state.unreadByUser;
      return {
        unreadCount: Math.max(0, state.unreadCount - count),
        unreadByUser: rest,
        notifications: state.notifications.filter((n) => {
          const nid = (n.senderId ?? n.sender?._id ?? n.chatId)?.toString();
          return nid !== id;
        }),
      };
    });

    // 2. Tell server in background — failure is silent (badge is already cleared)
    api.post('/messages/notifications/read', { chatId: id }).catch(() => {});
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0, unreadByUser: {} });
    api.post('/messages/notifications/read/all').catch(() => {});
  },
}));