import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

let socket = null;

export function useSocket() {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!socket) {
      socket = io(SOCKET_URL, {
        transports: ['websocket'],
        autoConnect: true,
      });

      socket.on('connect', () => {
        console.log('[Socket] Connected:', socket.id);
      });
      socket.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected:', reason);
      });
      socket.on('connect_error', (err) => {
        console.error('[Socket] Error:', err.message);
      });
    }
    socketRef.current = socket;

    return () => {
      // Keep socket alive across renders; only disconnect on app unmount
    };
  }, []);

  const joinRoom = useCallback((username, room) => {
    socketRef.current?.emit('user:join', { username, room });
  }, []);

  const sendMessage = useCallback((text, room) => {
    socketRef.current?.emit('message:send', { text, room });
  }, []);

  const emitTypingStart = useCallback((room) => {
    socketRef.current?.emit('typing:start', { room });
  }, []);

  const emitTypingStop = useCallback((room) => {
    socketRef.current?.emit('typing:stop', { room });
  }, []);

  const on = useCallback((event, handler) => {
    socketRef.current?.on(event, handler);
  }, []);

  const off = useCallback((event, handler) => {
    socketRef.current?.off(event, handler);
  }, []);

  return {
    socket: socketRef.current,
    joinRoom,
    sendMessage,
    emitTypingStart,
    emitTypingStop,
    on,
    off,
  };
}
