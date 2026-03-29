import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useMessages } from '../hooks/useMessages';

export function Chat() {
  const { id } = useParams();
  const { messages, loading, sendMessage } = useMessages(id);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const inputRef = useRef(null);
  const threadRef = useRef(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 50);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setDraft('');
    await sendMessage(trimmed);
    setSending(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="page chat-page">
      <header className="page-header">
        <div>
          <h2>Chat</h2>
          <p className="subtitle">{loading ? 'Loading...' : `${messages.length} messages`}</p>
        </div>
      </header>
      <div className="chat-thread glass" ref={threadRef}>
        {messages.length === 0 && !loading && (
          <p className="caption" style={{ textAlign: 'center', padding: 16 }}>
            No messages yet. Say hello!
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={
              msg.from === 'me' ? 'chat-message chat-message-me' : 'chat-message chat-message-them'
            }
          >
            <span>{msg.content}</span>
          </div>
        ))}
      </div>
      <div
        className="chat-input-row"
        onClick={() => {
          if (inputRef.current) inputRef.current.focus();
        }}
      >
        <input
          className="input"
          type="text"
          placeholder="Type a message..."
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="btn primary" type="button" onClick={handleSend} disabled={sending}>
          Send
        </button>
      </div>
    </div>
  );
}
