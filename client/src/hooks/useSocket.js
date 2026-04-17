import { useEffect, useRef, useCallback } from 'react';
import { useSocket as useSocketContext } from '../context/SocketContext';

/**
 * Convenience hook for consuming socket events
 * with automatic cleanup on unmount.
 */
export const useSocketEvent = (event, handler) => {
  const { socket } = useSocketContext();
  const handlerRef = useRef(handler);

  // Always use latest handler without re-subscribing
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!socket || !event) return;

    const listener = (...args) => handlerRef.current?.(...args);
    socket.on(event, listener);

    return () => {
      socket.off(event, listener);
    };
  }, [socket, event]);
};

/**
 * Emit a socket event safely (no-op if socket not connected)
 */
export const useSocketEmit = () => {
  const { socket, isConnected } = useSocketContext();

  const emit = useCallback(
    (event, data) => {
      if (!socket || !isConnected) {
        console.warn(`Socket not connected. Cannot emit: ${event}`);
        return false;
      }
      socket.emit(event, data);
      return true;
    },
    [socket, isConnected]
  );

  return emit;
};

export { useSocketContext as useSocket };