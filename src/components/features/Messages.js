import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../services/notificationService';

const Messages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [activeChatView, setActiveChatView] = useState('list'); // 'list', 'chat', 'new'
  const [newMessageType, setNewMessageType] = useState('direct'); // 'direct', 'group', 'all'
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messageStorage, setMessageStorage] = useState(new Map());
  const [unreadCounts, setUnreadCounts] = useState(new Map());

  // Load messages from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('beach_club_messages');
    const savedUnread = localStorage.getItem('beach_club_unread');
    
    if (savedMessages) {
      try {
        const messagesMap = new Map(JSON.parse(savedMessages));
        setMessageStorage(messagesMap);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    }
    
    if (savedUnread) {
      try {
        const unreadMap = new Map(JSON.parse(savedUnread));
        setUnreadCounts(unreadMap);
      } catch (error) {
        console.error('Error loading unread counts:', error);
      }
    }
  }, []);

  // Save messages to localStorage
  const saveMessages = (messagesMap) => {
    localStorage.setItem('beach_club_messages', JSON.stringify([...messagesMap]));
    setMessageStorage(messagesMap);
  };

  const saveUnreadCounts = (unreadMap) => {
    localStorage.setItem('beach_club_unread', JSON.stringify([...unreadMap]));
    setUnreadCounts(unreadMap);
  };

  // Enhanced conversations with different types
  const getConversations = () => [
    { 
      id: 1, 
      name: "🏖️ All Members", 
      type: 'broadcast',
      lastMessage: "Welcome new members to the beach club!", 
      time: "5m ago", 
      unread: 1,
      participants: ['everyone'],
      description: "Announcements for all beach club members"
    },
    { 
      id: 2, 
      name: "🧹 Beach Cleanup Crew", 
      type: 'group',
      lastMessage: "See you all Saturday at 8am!", 
      time: "2m ago", 
      unread: 2,
      participants: ['sarah_beach', 'mike_waves', 'jen_clean', 'tom_eco'],
      description: "Weekly beach cleanup coordination"
    },
    { 
      id: 3, 
      name: "🏄 Surf Club", 
      type: 'group',
      lastMessage: "Waves are perfect today! 6-8ft clean", 
      time: "1h ago", 
      unread: 0,
      participants: ['brad_surfer', 'kelly_waves', 'nash_shred'],
      description: "Daily surf conditions and meetups"
    },
    { 
      id: 4, 
      name: "🎵 Event Planning", 
      type: 'group',
      lastMessage: "Band confirmed for next week - The Tidal Waves!", 
      time: "3h ago", 
      unread: 5,
      participants: ['event_manager', 'band_booker', 'stage_tech'],
      description: "Coordinating beach club events and entertainment"
    },
    {
      id: 5,
      name: "Sarah Mitchell",
      type: 'direct',
      lastMessage: "Thanks for organizing the bags tournament!",
      time: "1d ago",
      unread: 0,
      participants: ['sarah_beach'],
      description: "Direct message"
    },
    {
      id: 6,
      name: "Mike Johnson", 
      type: 'direct',
      lastMessage: "Hey, want to play some bags later?",
      time: "2d ago",
      unread: unreadCounts.get(6) || 0,
      participants: ['mike_waves'],
      description: "Direct message"
    }
  ];

  // Get conversations with dynamic unread counts
  const conversations = getConversations().map(conv => ({
    ...conv,
    unread: unreadCounts.get(conv.id) || 0
  }));

  // Mock users data
  const mockUsers = [
    { id: 'sarah_beach', name: 'Sarah Mitchell', status: 'online', role: 'member', avatar: '👩‍🏄' },
    { id: 'mike_waves', name: 'Mike Johnson', status: 'online', role: 'member', avatar: '🏄‍♂️' },
    { id: 'jen_clean', name: 'Jennifer Davis', status: 'away', role: 'admin', avatar: '🌊' },
    { id: 'tom_eco', name: 'Tom Wilson', status: 'offline', role: 'member', avatar: '🐚' },
    { id: 'brad_surfer', name: 'Brad Cooper', status: 'online', role: 'member', avatar: '🤙' },
    { id: 'kelly_waves', name: 'Kelly Rodriguez', status: 'online', role: 'member', avatar: '🏖️' },
    { id: 'nash_shred', name: 'Nash Thompson', status: 'away', role: 'member', avatar: '🌴' },
    { id: 'event_manager', name: 'Alex Rivera', status: 'online', role: 'admin', avatar: '🎪' },
    { id: 'band_booker', name: 'Sam Chen', status: 'offline', role: 'member', avatar: '🎸' },
    { id: 'stage_tech', name: 'Jordan Blake', status: 'online', role: 'member', avatar: '🎤' }
  ];

  useEffect(() => {
    setAllUsers(mockUsers);
    setOnlineUsers(mockUsers.filter(u => u.status === 'online'));
  }, []);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    const currentChat = conversations.find(c => c.id === activeChat);
    if (!currentChat) return;

    const newMessage = {
      id: Date.now(),
      content: chatInput,
      senderId: user?.id || 'current_user',
      senderName: user?.first_name || 'You',
      timestamp: new Date().toISOString(),
      chatId: activeChat
    };

    // Add message to storage
    const updatedStorage = new Map(messageStorage);
    const chatMessages = updatedStorage.get(activeChat) || [];
    chatMessages.push(newMessage);
    updatedStorage.set(activeChat, chatMessages);
    saveMessages(updatedStorage);

    // Simulate message delivery notification
    notificationService.showToast(`Message sent to ${currentChat.name}`, 'success', 2000);
    
    setChatInput('');
  };

  const handleCreateNewMessage = () => {
    if (!newMessageText.trim()) return;
    
    const messageData = {
      id: Date.now(),
      type: newMessageType,
      recipients: selectedUsers,
      content: newMessageText,
      senderId: user?.id || 'current_user',
      senderName: user?.first_name || 'You',
      timestamp: new Date().toISOString()
    };
    
    // For broadcast messages, add to All Members chat
    if (newMessageType === 'all') {
      const updatedStorage = new Map(messageStorage);
      const allMembersMessages = updatedStorage.get(1) || [];
      allMembersMessages.push(messageData);
      updatedStorage.set(1, allMembersMessages);
      saveMessages(updatedStorage);
      
      // Show notification
      notificationService.showNotification('Message Sent', {
        body: `Broadcast message sent to all members`,
        icon: '📢'
      });
    } else {
      // Handle direct/group messages
      console.log('Creating new conversation for:', messageData);
    }
    
    setNewMessageText('');
    setSelectedUsers([]);
    setActiveChatView('list');
    
    notificationService.showToast('Message sent successfully!', 'success');
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'online': return '#10b981';
      case 'away': return '#f59e0b';
      case 'offline': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getChatTypeIcon = (type) => {
    switch(type) {
      case 'broadcast': return '📢';
      case 'group': return '👥';
      case 'direct': return '💬';
      default: return '💬';
    }
  };

  // Chat List View
  if (activeChatView === 'list') {
    return (
      <div style={{ padding: '1rem', paddingBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>
            💭 Messages
          </h2>
          <button
            onClick={() => setActiveChatView('new')}
            style={{
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            ✉️ New Message
          </button>
        </div>

        {/* Online Users Bar */}
        <div style={{
          backgroundColor: 'white',
          padding: '1rem',
          borderRadius: '0.75rem',
          marginBottom: '1rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', fontWeight: '600', color: '#10b981' }}>
            🟢 Online Now ({onlineUsers.length})
          </h3>
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem'
          }}>
            {onlineUsers.map(user => (
              <div
                key={user.id}
                onClick={() => {
                  // Start direct chat with this user
                  const existingChat = conversations.find(c => 
                    c.type === 'direct' && c.participants.includes(user.id)
                  );
                  if (existingChat) {
                    setActiveChat(existingChat.id);
                    setActiveChatView('chat');
                  } else {
                    setSelectedUsers([user.id]);
                    setNewMessageType('direct');
                    setActiveChatView('new');
                  }
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  minWidth: 'fit-content',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{
                  position: 'relative',
                  fontSize: '2rem'
                }}>
                  {user.avatar}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '12px',
                    height: '12px',
                    backgroundColor: getStatusColor(user.status),
                    borderRadius: '50%',
                    border: '2px solid white'
                  }} />
                </div>
                <span style={{
                  fontSize: '0.625rem',
                  fontWeight: '500',
                  textAlign: 'center',
                  maxWidth: '60px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {user.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Conversations List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => {
                setActiveChat(conv.id);
                setActiveChatView('chat');
              }}
              style={{
                backgroundColor: 'white',
                padding: '1rem',
                borderRadius: '0.75rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                border: conv.type === 'broadcast' ? '2px solid #fbbf24' : 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{
                width: '3rem',
                height: '3rem',
                backgroundColor: conv.type === 'broadcast' ? '#fef3c7' : '#e5e7eb',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                {getChatTypeIcon(conv.type)}
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
                    fontWeight: '600',
                    color: conv.type === 'broadcast' ? '#92400e' : '#1f2937'
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
                  <div style={{ flex: 1 }}>
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
                    {conv.type !== 'direct' && (
                      <p style={{
                        margin: '0.125rem 0 0 0',
                        fontSize: '0.625rem',
                        color: '#9ca3af'
                      }}>
                        {conv.participants.length === 1 && conv.participants[0] === 'everyone' 
                          ? 'All members' 
                          : `${conv.participants.length} members`}
                      </p>
                    )}
                  </div>
                  {conv.unread > 0 && (
                    <span style={{
                      backgroundColor: conv.type === 'broadcast' ? '#f59e0b' : '#8b5cf6',
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
      </div>
    );
  }

  // New Message View
  if (activeChatView === 'new') {
    return (
      <div style={{ padding: '1rem', paddingBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <button
            onClick={() => setActiveChatView('list')}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            ←
          </button>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>
            ✉️ New Message
          </h2>
        </div>

        {/* Message Type Selector */}
        <div style={{
          backgroundColor: 'white',
          padding: '1rem',
          borderRadius: '0.75rem',
          marginBottom: '1rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: '600' }}>
            Message Type
          </h3>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            {[
              { id: 'direct', label: '💬 Direct Message', desc: 'Send to specific person' },
              { id: 'group', label: '👥 Group Message', desc: 'Send to multiple people' },
              { id: 'all', label: '📢 All Members', desc: 'Broadcast to everyone' }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => {
                  setNewMessageType(type.id);
                  if (type.id === 'all') {
                    setSelectedUsers(['everyone']);
                  } else {
                    setSelectedUsers([]);
                  }
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: `2px solid ${newMessageType === type.id ? '#8b5cf6' : '#e5e7eb'}`,
                  borderRadius: '0.5rem',
                  backgroundColor: newMessageType === type.id ? '#f3e8ff' : 'white',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  {type.label}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  {type.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recipients */}
        {newMessageType !== 'all' && (
          <div style={{
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '0.75rem',
            marginBottom: '1rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: '600' }}>
              {newMessageType === 'direct' ? 'Send To' : 'Select Recipients'}
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '0.5rem',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {allUsers.map(user => (
                <div
                  key={user.id}
                  onClick={() => {
                    if (newMessageType === 'direct') {
                      setSelectedUsers([user.id]);
                    } else {
                      toggleUserSelection(user.id);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    border: `2px solid ${selectedUsers.includes(user.id) ? '#8b5cf6' : '#e5e7eb'}`,
                    backgroundColor: selectedUsers.includes(user.id) ? '#f3e8ff' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ position: 'relative', fontSize: '1.5rem' }}>
                    {user.avatar}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: '8px',
                      height: '8px',
                      backgroundColor: getStatusColor(user.status),
                      borderRadius: '50%',
                      border: '1px solid white'
                    }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {user.status} • {user.role}
                    </div>
                  </div>
                  {selectedUsers.includes(user.id) && (
                    <span style={{ color: '#8b5cf6', fontSize: '1.25rem' }}>✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message Input */}
        <div style={{
          backgroundColor: 'white',
          padding: '1rem',
          borderRadius: '0.75rem',
          marginBottom: '1rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: '600' }}>
            Message
          </h3>
          <textarea
            value={newMessageText}
            onChange={(e) => setNewMessageText(e.target.value)}
            placeholder={newMessageType === 'all' ? 'Write your announcement...' : 'Type your message...'}
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '0.75rem',
              border: '2px solid #e5e7eb',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleCreateNewMessage}
          disabled={!newMessageText.trim() || (newMessageType !== 'all' && selectedUsers.length === 0)}
          style={{
            width: '100%',
            padding: '1rem',
            backgroundColor: (!newMessageText.trim() || (newMessageType !== 'all' && selectedUsers.length === 0)) ? '#d1d5db' : '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '0.75rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: (!newMessageText.trim() || (newMessageType !== 'all' && selectedUsers.length === 0)) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          ✈️ Send Message
          {selectedUsers.length > 0 && newMessageType !== 'all' && (
            <span style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '0.125rem 0.5rem',
              borderRadius: '1rem',
              fontSize: '0.75rem'
            }}>
              to {selectedUsers.length}
            </span>
          )}
        </button>
      </div>
    );
  }

  // Individual Chat View
  const currentChat = conversations.find(c => c.id === activeChat);
  if (activeChatView === 'chat' && currentChat) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        paddingBottom: '4rem'
      }}>
        {/* Chat Header */}
        <div style={{
          backgroundColor: 'white',
          padding: '1rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <button
            onClick={() => setActiveChatView('list')}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            ←
          </button>
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            backgroundColor: currentChat.type === 'broadcast' ? '#fef3c7' : '#e5e7eb',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem'
          }}>
            {getChatTypeIcon(currentChat.type)}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
              {currentChat.name}
            </h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>
              {currentChat.description}
            </p>
          </div>
        </div>

        {/* Messages Area */}
        <div style={{
          flex: 1,
          padding: '1rem',
          overflowY: 'auto',
          backgroundColor: '#f9fafb'
        }}>
          {(() => {
            const chatMessages = messageStorage.get(activeChat) || [];
            
            if (chatMessages.length === 0) {
              return (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  minHeight: '200px'
                }}>
                  <div style={{
                    backgroundColor: '#f3f4f6',
                    padding: '2rem',
                    borderRadius: '1rem',
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    textAlign: 'center',
                    maxWidth: '300px'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</div>
                    <p style={{ margin: 0 }}>No messages yet. Start the conversation!</p>
                  </div>
                </div>
              );
            }
            
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {chatMessages.map((message) => {
                  const isOwnMessage = message.senderId === (user?.id || 'current_user');
                  
                  return (
                    <div key={message.id} style={{
                      display: 'flex',
                      justifyContent: isOwnMessage ? 'flex-end' : 'flex-start'
                    }}>
                      <div style={{
                        maxWidth: '70%',
                        backgroundColor: isOwnMessage ? '#3b82f6' : 'white',
                        color: isOwnMessage ? 'white' : '#374151',
                        padding: '0.75rem 1rem',
                        borderRadius: isOwnMessage ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        {!isOwnMessage && (
                          <div style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            marginBottom: '0.25rem',
                            color: isOwnMessage ? 'rgba(255,255,255,0.8)' : '#6b7280'
                          }}>
                            {message.senderName}
                          </div>
                        )}
                        <div style={{ marginBottom: '0.25rem' }}>
                          {message.content}
                        </div>
                        <div style={{
                          fontSize: '0.625rem',
                          color: isOwnMessage ? 'rgba(255,255,255,0.7)' : '#9ca3af',
                          textAlign: 'right'
                        }}>
                          {new Date(message.timestamp).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Message Input */}
        <div style={{
          backgroundColor: 'white',
          padding: '1rem',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-end'
        }}>
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '2px solid #e5e7eb',
              borderRadius: '1rem',
              fontSize: '0.875rem',
              resize: 'none',
              minHeight: '20px',
              maxHeight: '100px',
              fontFamily: 'inherit'
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!chatInput.trim()}
            style={{
              padding: '0.75rem',
              backgroundColor: chatInput.trim() ? '#8b5cf6' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              fontSize: '1.25rem',
              cursor: chatInput.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '3rem',
              height: '3rem'
            }}
          >
            ✈️
          </button>
        </div>
      </div>
    );
  }

  return null; // This should never be reached
};

export default Messages;