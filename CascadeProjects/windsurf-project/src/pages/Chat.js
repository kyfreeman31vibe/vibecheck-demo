import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMessages } from '../hooks/useMessages';
import { ArrowLeft, Send } from 'lucide-react';

function formatMsgTime(dateStr) {
  if (!dateStr) return '';
  var d = new Date(dateStr);
  var h = d.getHours();
  var m = d.getMinutes();
  var ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return h + ':' + (m < 10 ? '0' : '') + m + ' ' + ampm;
}

export function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button type="button" className="btn ghost small" style={{ padding: '6px 8px' }} onClick={() => navigate('/app/messages')}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.1rem' }}>Chat</h2>
            <p className="subtitle" style={{ fontSize: '0.75rem' }}>{loading ? 'Loading...' : messages.length + ' messages'}</p>
          </div>
        </div>
      </header>
      <div className="chat-thread glass" ref={threadRef}>
        {messages.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '40px 16px' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>👋</div>
            <p style={{ marginBottom: 4 }}>No messages yet</p>
            <p className="caption">Say hello to start the conversation!</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={
              msg.from === 'me' ? 'chat-message chat-message-me' : 'chat-message chat-message-them'
            }
          >
            <span>{msg.content}</span>
            {msg.createdAt && <div style={{ fontSize: '0.65rem', opacity: 0.5, marginTop: 3, textAlign: msg.from === 'me' ? 'right' : 'left' }}>{formatMsgTime(msg.createdAt)}</div>}
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
        <button className="btn primary" type="button" onClick={handleSend} disabled={sending || !draft.trim()} style={{ padding: '10px 14px' }}>
          {sending ? <span className="btn-spinner" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}
