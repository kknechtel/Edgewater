import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { notificationService } from '../services/notificationService';
import EnhancedCalendarView from './EnhancedCalendarView';
import SasqWatch from './SasqWatchView';
import Photos from './PhotosView';
import Messages from './MessagesView';
import BagsView from './BagsView';
import HomeView from './HomeView';
import UserProfile from './UserProfile';
import AdminDashboard from './AdminDashboard';
import MoreView from './MoreView';

const MobileApp = () => {
  const { logout, user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('home');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    // Initialize notifications
    notificationService.init();
    
    // Check for unread messages
    checkUnreadMessages();
    
    // Set up periodic check for new messages
    const messageCheckTimer = setInterval(checkUnreadMessages, 30000); // Check every 30 seconds
    
    return () => clearInterval(messageCheckTimer);
  }, []);

  const checkUnreadMessages = () => {
    try {
      const savedUnread = localStorage.getItem('beach_club_unread');
      if (savedUnread) {
        const unreadMap = new Map(JSON.parse(savedUnread));
        const totalUnread = Array.from(unreadMap.values()).reduce((sum, count) => sum + count, 0);
        setUnreadMessages(totalUnread);
      }
    } catch (error) {
      console.error('Error checking unread messages:', error);
    }
  };

  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'calendar', label: 'Events', icon: '📅' },
    { id: 'bags', label: 'Bags', icon: '🎯' },
    { id: 'messages', label: 'Chat', icon: '💬' },
    { id: 'more', label: 'More', icon: '⚙️' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView setActiveTab={setActiveTab} />;
      case 'calendar':
        return <EnhancedCalendarView />;
      case 'bags':
        return <BagsView />;
      case 'sasqwatch':
        return <SasqWatch />;
      case 'messages':
        return <Messages />;
      case 'admin':
        return user?.is_admin ? <AdminDashboard /> : <HomeView setActiveTab={setActiveTab} />;
      case 'more':
        return <MoreView setActiveTab={setActiveTab} />;
      case 'profile':
        return <UserProfile />;
      case 'photos':
        return <Photos />;
      case 'music':
        return <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Music & Bands</h2>
          <p>Band guide coming soon!</p>
        </div>;
      case 'weather':
        return <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Weather Details</h2>
          <p>Extended weather view coming soon!</p>
        </div>;
      case 'dinner':
        return <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Dinner</h2>
          <p>Dinner reservations coming soon!</p>
        </div>;
      default:
        return <HomeView setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f9fafb',
      margin: 0,
      padding: 0
    }}>
      {/* Main Content */}
      <main style={{
        flex: 1,
        paddingBottom: '5rem', // Account for fixed bottom nav
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}>
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '0.5rem 0',
        boxShadow: '0 -1px 3px 0 rgb(0 0 0 / 0.1)',
        zIndex: 1000
      }}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0.5rem',
                cursor: 'pointer',
                color: isActive ? '#0891b2' : '#6b7280',
                textDecoration: 'none',
                background: 'none',
                border: 'none',
                flex: 1,
                minWidth: 0,
                transition: 'color 0.2s',
                position: 'relative'
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '40px',
                  height: '3px',
                  backgroundColor: '#0891b2',
                  borderRadius: '0 0 3px 3px'
                }} />
              )}
              
              <span style={{
                fontSize: '1.5rem',
                marginBottom: '0.25rem',
                display: 'block',
                position: 'relative'
              }}>
                {tab.icon}
                {tab.id === 'messages' && unreadMessages > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-8px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    borderRadius: '50%',
                    minWidth: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.625rem',
                    fontWeight: '600',
                    padding: '0 4px'
                  }}>
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </span>
                )}
              </span>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: isActive ? '600' : '400'
              }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* User Profile Modal */}
      {showProfile && (
        <UserProfile onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
};

export default MobileApp;