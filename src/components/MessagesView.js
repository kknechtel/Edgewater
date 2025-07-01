import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const MessagesView = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeChannel, setActiveChannel] = useState('general');
  const [showChannels, setShowChannels] = useState(false);
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
      author: user.display_name || user.first_name || user.email,
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
      return `${diffHours}h ago`;
    } else if (diffMins > 0) {
      return `${diffMins}m ago`;
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

  const styles = {
    container: {
      height: 'calc(100vh - 60px)',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f9fafb',
      position: 'relative'
    },
    header: {
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      padding: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
    },
    channelButton: {
      backgroundColor: '#f3f4f6',
      border: '1px solid #e5e7eb',
      borderRadius: '0.75rem',
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#111827',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      minHeight: '44px'
    },
    messagesContainer: {
      flex: 1,
      overflowY: 'auto',
      padding: '1rem',
      WebkitOverflowScrolling: 'touch'
    },
    message: {
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem'
    },
    messageBubble: {
      maxWidth: '85%',
      borderRadius: '0.75rem',
      padding: '0.75rem',
      wordWrap: 'break-word'
    },
    messageAvatar: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      backgroundColor: '#0891b2',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      fontSize: '0.875rem',
      flexShrink: 0
    },
    inputContainer: {
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e5e7eb',
      padding: '1rem',
      display: 'flex',
      gap: '0.75rem',
      alignItems: 'center'
    },
    input: {
      flex: 1,
      padding: '0.75rem',
      border: '1px solid #e5e7eb',
      borderRadius: '0.75rem',
      fontSize: '1rem',
      outline: 'none',
      minHeight: '44px'
    },
    sendButton: {
      backgroundColor: '#0891b2',
      color: 'white',
      border: 'none',
      borderRadius: '0.75rem',
      padding: '0 1.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      minHeight: '44px',
      minWidth: '80px',
      transition: 'all 0.2s'
    },
    channelModal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'flex-end',
      zIndex: 1000
    },
    channelSheet: {
      backgroundColor: '#ffffff',
      width: '100%',
      maxHeight: '70vh',
      borderRadius: '1rem 1rem 0 0',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch'
    },
    channelHeader: {
      padding: '1.5rem',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    channelItem: {
      padding: '1rem 1.5rem',
      borderBottom: '1px solid #f3f4f6',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  };

  const currentChannel = channels.find(c => c.id === activeChannel);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '0.25rem'
          }}>
            {currentChannel?.name}
          </h2>
          <p style={{
            fontSize: '0.75rem',
            color: '#6b7280'
          }}>
            {currentChannel?.description}
          </p>
        </div>
        <button
          style={styles.channelButton}
          onClick={() => setShowChannels(true)}
        >
          <span>📋</span>
          <span>Channels</span>
        </button>
      </div>

      {/* Messages */}
      <div style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>💬</div>
            <p style={{ fontSize: '0.875rem' }}>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.authorId === user?.id;
            const initials = msg.author.split(' ').map(n => n[0]).join('').toUpperCase();
            
            return (
              <div
                key={msg.id}
                style={{
                  ...styles.message,
                  flexDirection: isOwnMessage ? 'row-reverse' : 'row'
                }}
              >
                {!isOwnMessage && (
                  <div style={{
                    ...styles.messageAvatar,
                    backgroundColor: msg.authorId === 'admin' ? '#f59e0b' : '#0891b2'
                  }}>
                    {initials}
                  </div>
                )}
                <div>
                  {!isOwnMessage && (
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.25rem',
                      marginLeft: '0.25rem'
                    }}>
                      {msg.author}
                    </div>
                  )}
                  <div style={{
                    ...styles.messageBubble,
                    backgroundColor: isOwnMessage ? '#0891b2' : '#ffffff',
                    color: isOwnMessage ? '#ffffff' : '#111827',
                    border: isOwnMessage ? 'none' : '1px solid #e5e7eb',
                    marginLeft: isOwnMessage ? 'auto' : '0'
                  }}>
                    <div style={{ marginBottom: '0.25rem' }}>
                      {msg.message}
                    </div>
                    <div style={{
                      fontSize: '0.625rem',
                      opacity: 0.7
                    }}>
                      {formatTimestamp(msg.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} style={styles.inputContainer}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={`Message ${currentChannel?.name || ''}`}
          style={styles.input}
          onFocus={(e) => {
            e.target.style.borderColor = '#0891b2';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
          }}
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          style={{
            ...styles.sendButton,
            opacity: newMessage.trim() ? 1 : 0.5,
            cursor: newMessage.trim() ? 'pointer' : 'not-allowed'
          }}
          onMouseEnter={(e) => {
            if (newMessage.trim()) {
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Send
        </button>
      </form>

      {/* Channel Selection Modal */}
      {showChannels && (
        <div
          style={styles.channelModal}
          onClick={() => setShowChannels(false)}
        >
          <div
            style={styles.channelSheet}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.channelHeader}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#111827'
              }}>
                Select Channel
              </h3>
              <button
                onClick={() => setShowChannels(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  color: '#6b7280',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}
              >
                ×
              </button>
            </div>
            
            <div>
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  style={{
                    ...styles.channelItem,
                    backgroundColor: activeChannel === channel.id ? '#ecfeff' : 'transparent'
                  }}
                  onClick={() => {
                    setActiveChannel(channel.id);
                    setShowChannels(false);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = activeChannel === channel.id ? '#ecfeff' : 'transparent';
                  }}
                >
                  <div>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '0.25rem'
                    }}>
                      {channel.name}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#6b7280'
                    }}>
                      {channel.description}
                    </div>
                  </div>
                  {getMessageCount(channel.id) > 0 && (
                    <span style={{
                      backgroundColor: '#0891b2',
                      color: 'white',
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '1rem',
                      fontWeight: '600'
                    }}>
                      {getMessageCount(channel.id)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesView;