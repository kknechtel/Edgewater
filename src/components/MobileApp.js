import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import EnhancedCalendarView from './EnhancedCalendarView';
import SasqWatch from './features/SasqWatch';
import Photos from './features/Photos';
import Messages from './features/Messages';
import BagsView from './views/BagsView';
import HomeView from './features/HomeView';

const MobileApp = () => {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'calendar', label: 'Events', icon: '🏖️' },
    { id: 'bags', label: 'Cornhole', icon: '🎯' },
    { id: 'sasqwatch', label: 'SasqWatch', icon: '🦶' },
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
      backgroundColor: '#f0f9ff',
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
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
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
            <span style={{ fontSize: '1.25rem' }}>{tab.icon}</span>
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
    </div>
  );
};

export default MobileApp;