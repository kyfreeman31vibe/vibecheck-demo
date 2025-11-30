import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const initialMessages = [];

const demoReplies = [
  "Love that. I'll queue some tracks for us.",
  "Nice pick – that totally fits your vibe.",
  "We should build a shared playlist around that.",
  "Okay, I'm sending you a mix that matches that energy.",
];

export function Chat() {
  const { id } = useParams();
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState('');
  const [pendingReply, setPendingReply] = useState(false);

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      {
        id: prev.length ? prev[prev.length - 1].id + 1 : 1,
        from: 'me',
        text: trimmed,
      },
    ]);
    setDraft('');

    if (!pendingReply) {
      setPendingReply(true);
      const replyText = demoReplies[Math.floor(Math.random() * demoReplies.length)];

      window.setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length ? prev[prev.length - 1].id + 1 : 1,
            from: 'them',
            text: replyText,
          },
        ]);
        setPendingReply(false);
      }, 900);
    }
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
          <h2>Chat with Match #{id}</h2>
          <p className="subtitle">Real-time messaging mocked in UI</p>
        </div>
      </header>
      <div className="chat-thread glass">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={
              msg.from === 'me' ? 'chat-message chat-message-me' : 'chat-message chat-message-them'
            }
          >
            <span>{msg.text}</span>
          </div>
        ))}
      </div>
      <div className="chat-input-row">
        <input
          className="input"
          placeholder="Type a message (demo only)"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="btn primary" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
}
