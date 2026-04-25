import { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket } from '../services/socket';
import api from '../services/api';

export const useChat = (room) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeout = useRef(null);

  // Load history
  useEffect(() => {
    if (!room) return;
    setLoading(true);
    api.get(`/messages/${room}`)
      .then(({ data }) => setMessages(data.messages || []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [room]);

  // Socket listeners
  useEffect(() => {
    if (!room) return;
    const socket = getSocket();
    if (!socket) return;

    socket.emit('chat:join', { room });

    const onMessage = (msg) => setMessages((prev) => [...prev, msg]);
    const onTyping = ({ userId, isTyping }) => {
      setTypingUsers((prev) =>
        isTyping ? [...new Set([...prev, userId])] : prev.filter((id) => id !== userId)
      );
    };

    socket.on('chat:message', onMessage);
    socket.on('chat:typing', onTyping);

    return () => {
      socket.emit('chat:leave', { room });
      socket.off('chat:message', onMessage);
      socket.off('chat:typing', onTyping);
    };
  }, [room]);

  const sendMessage = useCallback((content) => {
    const socket = getSocket();
    if (!socket || !content.trim()) return;
    socket.emit('chat:message', { room, content });
  }, [room]);

  const sendTyping = useCallback((isTyping) => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('chat:typing', { room, isTyping });
    if (isTyping) {
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socket.emit('chat:typing', { room, isTyping: false });
      }, 2000);
    }
  }, [room]);

  return { messages, loading, typingUsers, sendMessage, sendTyping };
};
