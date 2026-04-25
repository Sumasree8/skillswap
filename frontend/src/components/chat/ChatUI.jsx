import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../hooks/useChat';
import { Avatar, Spinner } from '../ui';
import { timeAgo } from '../../utils/helpers';

export const ChatUI = ({ room, otherUser }) => {
  const { user } = useAuth();
  const { messages, loading, typingUsers, sendMessage, sendTyping } = useChat(room);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
    sendTyping(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-ink-5 text-sm">No messages yet. Say hello!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
          if (msg.type === 'system') {
            return (
              <div key={msg._id} className="text-center">
                <span className="text-xs text-ink-5 bg-surface-2 px-3 py-1 rounded-full">{msg.content}</span>
              </div>
            );
          }
          return (
            <div key={msg._id} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
              {!isMe && <Avatar user={msg.sender} size="sm" className="mt-1 shrink-0" />}
              <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? 'bg-accent text-white rounded-tr-sm'
                      : 'bg-surface-2 text-ink-1 rounded-tl-sm border border-surface-3'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-ink-5 px-1">
                  {timeAgo(msg.createdAt)}
                </span>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex gap-2.5 items-center">
            <Avatar user={otherUser} size="sm" />
            <div className="bg-surface-2 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-ink-4 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-surface-2 px-4 py-3">
        <div className="flex gap-2 items-end">
          <textarea
            className="input flex-1 resize-none py-2.5 text-sm min-h-[42px] max-h-32"
            rows={1}
            placeholder="Type a message…"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              sendTyping(e.target.value.length > 0);
            }}
            onKeyDown={handleKeyDown}
          />
          <button
            className="btn-primary px-4 py-2.5 shrink-0"
            onClick={handleSend}
            disabled={!input.trim()}
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
};
