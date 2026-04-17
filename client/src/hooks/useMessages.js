import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import api from '../api/axios';

export const useMessages = (chat, currentUser) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { socket } = useSocket();

  const chatId = chat?._id;
  const isRoom = chat?.isRoom;

  // Fetch messages
  const fetchMessages = useCallback(async (pageNum = 1) => {
    if (!chat) return;
    setLoading(true);
    try {
      const endpoint = isRoom
        ? `/messages/room/${chatId}?page=${pageNum}`
        : `/messages/dm/${chatId}?page=${pageNum}`;

      const { data } = await api.get(endpoint);
      if (data.length < 50) setHasMore(false);

      setMessages((prev) =>
        pageNum === 1 ? data : [...data, ...prev]
      );
    } catch (err) {
      console.error('Fetch messages error:', err);
    } finally {
      setLoading(false);
    }
  }, [chat, chatId, isRoom]);

  // Initial load & reset on chat change
  useEffect(() => {
    setMessages([]);
    setPage(1);
    setHasMore(true);
    fetchMessages(1);
  }, [chatId]);

  // Load more (pagination)
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMessages(nextPage);
    }
  }, [loading, hasMore, page, fetchMessages]);

  // Socket events
  useEffect(() => {
    if (!socket || !chat) return;

    const handleReceive = (msg) => {
      const relevantDM = !isRoom && (
        msg.sender?._id === chatId || msg.recipient === chatId
      );
      const relevantRoom = isRoom && msg.room === chatId;

      if (relevantDM || relevantRoom) {
        setMessages((prev) => [...prev, msg]);

        // Send read receipt
        if (msg.sender?._id !== currentUser._id) {
          socket.emit('messages:read', {
            senderId: msg.sender._id,
            messageIds: [msg._id],
          });
        }
      }
    };

    const handleSent = (msg) => {
      // Replace optimistic message with real one using tempId
      setMessages((prev) =>
        prev.map((m) => (m.tempId === msg.tempId ? msg : m))
      );
    };

    const handleDeleted = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, isDeleted: true, text: '', image: { url: '', publicId: '' } }
            : m
        )
      );
    };

    const handleEdited = ({ messageId, text, editedAt }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, text, isEdited: true, editedAt } : m
        )
      );
    };

    const handleRead = ({ messageIds }) => {
      setMessages((prev) =>
        prev.map((m) =>
          messageIds.includes(m._id) ? { ...m, status: 'read' } : m
        )
      );
    };

    const handleViewOnceDestroyed = ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    };

    socket.on('message:receive', handleReceive);
    socket.on('message:sent', handleSent);
    socket.on('message:deleted', handleDeleted);
    socket.on('message:edited', handleEdited);
    socket.on('messages:read', handleRead);
    socket.on('message:viewOnceDestroyed', handleViewOnceDestroyed);

    return () => {
      socket.off('message:receive', handleReceive);
      socket.off('message:sent', handleSent);
      socket.off('message:deleted', handleDeleted);
      socket.off('message:edited', handleEdited);
      socket.off('messages:read', handleRead);
      socket.off('message:viewOnceDestroyed', handleViewOnceDestroyed);
    };
  }, [socket, chat, chatId, isRoom, currentUser]);

  const addOptimisticMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  return { messages, loading, hasMore, loadMore, addOptimisticMessage };
};