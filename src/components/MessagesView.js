import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const MessagesView = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeChannel, setActiveChannel] = useState('general');
  const messagesEndRef = useRef(null);

  const channels = [
    { id: 'general', name: '💬 General', description: 'General chat for everyone' },
    { id: 'events', name: '📅 Events', description: 'Discuss upcoming events' },
    { id: 'surf', name: '🏄 Surf Talk', description: 'Surf conditions and tips' },
    { id: 'music', name: '🎸 Music', description: 'Band discussions' },
    { id: 'bags', name: '🎯 Bags', description: 'Bags game coordination' }
  ];

  // Sample messages
  const sampleMessages = {
    general: [
      { id: 1, author: 'Beach Admin', message: 'Welcome to Edgewater Beach Chat! 🏖️', timestamp: new Date(Date.now() - 3600000).toISOString(), authorId: 'admin' },
      { id: 2, author: 'Surf Rider', message: 'Anyone up for volleyball tomorrow?', timestamp: new Date(Date.now() - 1800000).toISOString(), authorId: 'user2' },
      { id: 3, author: 'Beach Lover', message: 'Count me in! What time?', timestamp: new Date(Date.now() - 900000).toISOString(), authorId: 'user3' }
    ],
    events: [
      { id: 4, author: 'Event Coordinator', message: 'Don\'t forget about the sandcastle competition this Saturday!', timestamp: new Date(Date.now() - 7200000).toISOString(), authorId: 'admin' }
    ],
    surf: [
      { id: 5, author: 'Wave Watcher', message: 'Waves looking good for tomorrow morning! 3-4ft clean', timestamp: new Date(Date.now() - 3600000).toISOString(), authorId: 'user4' }
    ],
    music: [],
    bags: []
  };

  useEffect(() => {
    // Load messages from localStorage
    const saved = localStorage.getItem(`beach_messages_${activeChannel}`);
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      // Initialize with sample data
      const channelSamples = sampleMessages[activeChannel] || [];
      setMessages(channelSamples);
      if (channelSamples.length > 0) {
        localStorage.setItem(`beach_messages_${activeChannel}`, JSON.stringify(channelSamples));
      }
    }
  }, [activeChannel]);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      author: user.display_name || user.email,
      authorId: user.id,
      message: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    localStorage.setItem(`beach_messages_${activeChannel}`, JSON.stringify(updatedMessages));
    
    setNewMessage('');
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays > 0) {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMins > 0) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const getMessageCount = (channelId) => {
    const saved = localStorage.getItem(`beach_messages_${channelId}`);
    if (saved) {
      return JSON.parse(saved).length;
    }
    return (sampleMessages[channelId] || []).length;
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 100px)', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Channels Sidebar */}
      <div style={{
        width: '250px',
        backgroundColor: 'white',
        borderRight: '1px solid #ddd',
        overflowY: 'auto'
      }}>
        <div style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Channels
          </h2>
          
          {channels.map((channel) => (
            <div
              key={channel.id}
              onClick={() => setActiveChannel(channel.id)}
              style={{
                padding: '1rem',
                marginBottom: '0.5rem',
                backgroundColor: activeChannel === channel.id ? '#e3f2fd' : 'transparent',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '0.25rem'
              }}>
                <div style={{ fontWeight: '600' }}>{channel.name}</div>
                {getMessageCount(channel.id) > 0 && (
                  <span style={{
                    backgroundColor: '#2196F3',
                    color: 'white',
                    fontSize: '0.75rem',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '12px'
                  }}>
                    {getMessageCount(channel.id)}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                {channel.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>
        {/* Channel Header */}
        <div style={{
          backgroundColor: 'white',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #ddd'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>
            {channels.find(c => c.id === activeChannel)?.name}
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#666' }}>
            {channels.find(c => c.id === activeChannel)?.description}
          </p>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem'
        }}>
          {messages.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: '#666',
              padding: '3rem'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  marginBottom: '1.5rem',
                  display: 'flex',
                  flexDirection: msg.authorId === user.id ? 'row-reverse' : 'row'
                }}
              >
                <div style={{
                  maxWidth: '70%',
                  backgroundColor: msg.authorId === user.id ? '#2196F3' : 'white',
                  color: msg.authorId === user.id ? 'white' : '#333',
                  padding: '1rem',
                  borderRadius: '8px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                  <div style={{
                    fontWeight: '600',
                    marginBottom: '0.25rem',
                    fontSize: '0.875rem'
                  }}>
                    {msg.author}
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    {msg.message}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    opacity: 0.8
                  }}>
                    {formatTimestamp(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form
          onSubmit={handleSendMessage}
          style={{
            backgroundColor: 'white',
            padding: '1rem 1.5rem',
            borderTop: '1px solid #ddd',
            display: 'flex',
            gap: '1rem'
          }}
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message #${activeChannel}`}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            style={{
              backgroundColor: '#2196F3',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
              opacity: newMessage.trim() ? 1 : 0.6
            }}
          >
            Send
          </button>
        </form>
      </div>

      {/* Mobile Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .chat-container {
            flex-direction: column;
          }
          
          .channels-sidebar {
            width: 100% !important;
            height: auto !important;
            border-right: none !important;
            border-bottom: 1px solid #ddd;
          }
        }
      `}</style>
    </div>
  );
};

export default MessagesView;