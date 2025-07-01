import React, { useState } from 'react';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  // Demo conversations
  const conversations = [
    { id: 1, name: "Beach Cleanup Crew", lastMessage: "See you all Saturday!", time: "2m ago", unread: 2 },
    { id: 2, name: "Surf Club", lastMessage: "Waves are perfect today!", time: "1h ago", unread: 0 },
    { id: 3, name: "Event Planning", lastMessage: "Band confirmed for next week", time: "3h ago", unread: 5 },
  ];

  return (
    <div style={{ padding: '1rem', paddingBottom: '2rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>
          Messages
        </h2>
        <button
          style={{
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          + New Chat
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {conversations.map(conv => (
          <div
            key={conv.id}
            onClick={() => setActiveChat(conv.id)}
            style={{
              backgroundColor: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              transform: activeChat === conv.id ? 'scale(0.98)' : 'scale(1)'
            }}
          >
            <div style={{
              width: '3rem',
              height: '3rem',
              backgroundColor: '#e5e7eb',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              💬
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.25rem'
              }}>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '1rem', 
                  fontWeight: '600' 
                }}>
                  {conv.name}
                </h3>
                <span style={{
                  fontSize: '0.75rem',
                  color: '#6b7280'
                }}>
                  {conv.time}
                </span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.875rem', 
                  color: '#6b7280',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {conv.lastMessage}
                </p>
                {conv.unread > 0 && (
                  <span style={{
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    minWidth: '1.5rem',
                    textAlign: 'center'
                  }}>
                    {conv.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '1.5rem',
        backgroundColor: '#fef3c7',
        padding: '1rem',
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        color: '#92400e'
      }}>
        <strong>Coming Soon:</strong> Real-time messaging with fellow beach club members!
      </div>
    </div>
  );
};

export default Messages;