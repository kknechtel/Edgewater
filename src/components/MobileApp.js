import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { notificationService } from '../services/notificationService';\nimport { initializeBands, initializeTournaments, initializeEvents } from '../initializeData';
import EnhancedCalendarView from './EnhancedCalendarView';
import SasqWatch from './features/SasqWatch';
import Photos from './features/Photos';
import Messages from './features/Messages';
import BagsView from './BagsView';
import HomeView from './features/HomeView';
import UserProfile from './UserProfile';

const MobileApp = () => {
  const { logout, user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('home');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

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
    { id: 'calendar', label: 'Events', icon: '🏖️' },
    { id: 'bags', label: 'Bags', icon: '🎯' },
    { id: 'sasqwatch', label: 'SasqWatch', icon: '👣' },
    { id: 'messages', label: 'Chat', icon: '💭' },
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
      default:
        return <HomeView setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: isDarkMode ? '#0f172a' : '#f0f9ff',
      color: isDarkMode ? '#f1f5f9' : '#111827',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    }}>
      {/* Header - Only show on non-home pages */}
      {activeTab !== 'home' && (
        <header style={{
          backgroundColor: '#0891b2',
          color: 'white',
          padding: '1rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '1.25rem', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🏖️ Clubbers
          </h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={toggleTheme}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: 'none',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                fontSize: '1.25rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            {user ? (
              <>
                <button
                  onClick={() => setShowProfile(true)}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  👤 Profile
                </button>
                <button
                  onClick={logout}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => window.location.href = '/login'}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Login
              </button>
            )}
          </div>
        </header>
      )}

      {/* Main Content */}
      <main style={{
        flex: 1,
        paddingTop: activeTab === 'home' ? 0 : '4rem', // No padding for home
        paddingBottom: '4rem', // Account for fixed bottom nav
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}>
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav style={{
        backgroundColor: isDarkMode ? '#1e293b' : 'white',
        borderTop: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0.5rem 0',
        zIndex: 1000,
        boxShadow: '0 -2px 4px rgba(0,0,0,0.05)'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.125rem',
              padding: '0.375rem 0.25rem',
              border: 'none',
              background: 'none',
              color: activeTab === tab.id ? '#0891b2' : '#6b7280',
              fontSize: '0.625rem',
              fontWeight: activeTab === tab.id ? '600' : '400',
              transition: 'color 0.2s',
              minWidth: 0,
              maxWidth: '20%' // For 5 tabs
            }}
          >
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <span style={{ fontSize: '1.25rem' }}>{tab.icon}</span>
              {tab.id === 'messages' && unreadMessages > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-8px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.625rem',
                  fontWeight: '600',
                  border: '2px solid white'
                }}>
                  {unreadMessages > 99 ? '99+' : unreadMessages}
                </span>
              )}
            </div>
            <span style={{ 
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {tab.label}
            </span>
          </button>
        ))}
      </nav>

      {/* User Profile Modal */}
      {showProfile && (
        <UserProfile onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
};

export default MobileApp;