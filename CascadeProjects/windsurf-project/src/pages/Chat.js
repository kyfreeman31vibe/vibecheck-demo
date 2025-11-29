import React from 'react';
import { useParams } from 'react-router-dom';

const mockMessages = [
  { id: 1, from: 'them', text: 'Hey! What are you listening to lately?' },
  { id: 2, from: 'me', text: "A lot of lo-fi and indie, you?" },
  { id: 3, from: 'them', text: 'Same! I can send you a playlist.' },
];

export function Chat() {
  const { id } = useParams();

  return (
    <div className="page chat-page">
      <header className="page-header">
        <div>
          <h2>Chat with Match #{id}</h2>
          <p className="subtitle">Real-time messaging mocked in UI</p>
        </div>
      </header>
      <div className="chat-thread glass">
        {mockMessages.map((msg) => (
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
        <input className="input" placeholder="Type a message (demo only)" />
        <button className="btn primary">Send</button>
      </div>
    </div>
  );
}
