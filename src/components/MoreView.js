import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const MoreView = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [showLumaModal, setShowLumaModal] = useState(false);

  const mainFeatures = [
    { id: 'music', label: 'Music', icon: '🎸', tab: 'music' },
    { id: 'photos', label: 'Photos', icon: '📸', tab: 'photos' },
    { id: 'sasqwatch', label: 'SasqWatch', icon: '👣', tab: 'sasqwatch' },
    { id: 'weather', label: 'Weather', icon: '🌊', tab: 'weather' },
    { id: 'dinner', label: 'Dinner', icon: '🍽️', tab: 'dinner' },
    { id: 'profile', label: 'Profile Settings', icon: '👤', tab: 'profile' },
    ...(user?.is_admin ? [{ id: 'admin', label: 'Admin Dashboard', icon: '👑', tab: 'admin' }] : [])
  ];

  const comingSoonFeatures = [
    {
      id: 'lumalocator',
      title: 'LumaLocator',
      icon: '🔦',
      desc: 'Track where the Luma family is when they\'re mysteriously never at the beach',
      special: true
    },
    {
      id: 'lobster-alert',
      title: 'Lobster Roll Alert',
      icon: '🦞',
      desc: 'Real-time notifications when fresh lobster rolls hit the beach shacks'
    },
    {
      id: 'sandcastle-judge',
      title: 'Sandcastle Judge',
      icon: '🏰',
      desc: 'AI-powered sandcastle rating system with weekly competitions'
    },
    {
      id: 'jetty-jump',
      title: 'Jetty Jump Tracker',
      icon: '🌀',
      desc: 'Log your jetty jumps and compete for the summer championship'
    },
    {
      id: 'pizza-predictor',
      title: 'Boardwalk Pizza Predictor',
      icon: '🍕',
      desc: 'Know exactly when the fresh pies come out at every boardwalk spot'
    },
    {
      id: 'shark-spotter',
      title: 'Shark Week Spotter',
      icon: '🦈',
      desc: 'Community-driven shark and dolphin sighting map with verified reports'
    }
  ];

  const styles = {
    container: {
      minHeight: '100vh',
      paddingBottom: '5rem',
      backgroundColor: '#f9fafb'
    },
    header: {
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      padding: '1.5rem',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
    },
    title: {
      fontSize: '1.75rem',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '0.5rem'
    },
    subtitle: {
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    content: {
      padding: '1rem'
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '0.75rem',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      padding: '1.5rem',
      marginBottom: '1rem'
    },
    cardTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: '#111827'
    },
    featureGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '0.75rem'
    },
    featureButton: {
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '0.75rem',
      padding: '1rem',
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'all 0.2s',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem'
    },
    featureIcon: {
      fontSize: '2rem'
    },
    featureLabel: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#111827'
    },
    comingSoonCard: {
      backgroundColor: '#ffffff',
      border: '2px dashed #e5e7eb',
      borderRadius: '0.75rem',
      padding: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '0.75rem',
      opacity: 0.8,
      transition: 'all 0.2s',
      cursor: 'default'
    },
    comingSoonIcon: {
      fontSize: '2.5rem',
      minWidth: '60px',
      textAlign: 'center'
    },
    comingSoonContent: {
      flex: 1
    },
    comingSoonTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '0.25rem'
    },
    comingSoonDesc: {
      fontSize: '0.875rem',
      color: '#6b7280',
      lineHeight: 1.4
    },
    comingSoonBadge: {
      backgroundColor: '#8b5cf6',
      color: 'white',
      padding: '0.25rem 0.75rem',
      borderRadius: '1rem',
      fontSize: '0.75rem',
      fontWeight: '600'
    }
  };

  const handleFeatureClick = (feature) => {
    if (feature.id === 'lumalocator') {
      setShowLumaModal(true);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>More</h1>
        <p style={styles.subtitle}>All features & settings</p>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        {/* Main Features */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            <span>🎯</span> Features
          </h2>
          
          <div style={styles.featureGrid}>
            {mainFeatures.map(feature => (
              <button
                key={feature.id}
                style={styles.featureButton}
                onClick={() => setActiveTab(feature.tab)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={styles.featureIcon}>{feature.icon}</div>
                <div style={styles.featureLabel}>{feature.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Coming Soon Section */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            <span>✨</span> Coming Soon
          </h2>
          
          <div>
            {comingSoonFeatures.map(feature => (
              <div
                key={feature.id}
                style={{
                  ...styles.comingSoonCard,
                  cursor: feature.special ? 'pointer' : 'default',
                  borderColor: feature.special ? '#8b5cf6' : '#e5e7eb'
                }}
                onClick={() => handleFeatureClick(feature)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                  if (feature.special) {
                    e.currentTarget.style.borderColor = '#8b5cf6';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                  e.currentTarget.style.borderColor = feature.special ? '#8b5cf6' : '#e5e7eb';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={styles.comingSoonIcon}>{feature.icon}</div>
                <div style={styles.comingSoonContent}>
                  <h3 style={styles.comingSoonTitle}>
                    {feature.title}
                    {feature.special && (
                      <span style={{
                        marginLeft: '0.5rem',
                        fontSize: '0.75rem',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '1rem',
                        verticalAlign: 'middle'
                      }}>
                        TOP SECRET
                      </span>
                    )}
                  </h3>
                  <p style={styles.comingSoonDesc}>{feature.desc}</p>
                </div>
                <span style={styles.comingSoonBadge}>Soon</span>
              </div>
            ))}
          </div>
        </div>

        {/* App Info */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            <span>📱</span> App Info
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
              <strong>Version:</strong> 2.0.0
            </div>
            <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
              <strong>Beach Location:</strong> Sea Bright, NJ
            </div>
            {user && (
              <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                <strong>Logged in as:</strong> {user.display_name || user.first_name || user.email}
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onClick={() => {
                // Check if browser supports PWA installation
                if ('serviceWorker' in navigator) {
                  // For iOS Safari
                  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
                    alert('To install this app:\n\n1. Tap the Share button (⎋)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to install the app');
                  }
                  // For Android Chrome
                  else if (window.matchMedia('(display-mode: browser)').matches) {
                    alert('To install this app:\n\n1. Tap the menu button (⋮)\n2. Tap "Add to Home screen"\n3. Tap "Add" to install the app');
                  }
                  // For other browsers
                  else {
                    alert('To install this app:\n\n1. Look for an "Install" or "Add to Home Screen" option in your browser menu\n2. Follow the prompts to install the app on your device');
                  }
                } else {
                  alert('App installation is not supported in this browser.');
                }
              }}
            >
              <span>📱</span>
              Install as App
            </button>
            
            <button
              style={{
                backgroundColor: '#0891b2',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onClick={() => {
                if ('share' in navigator) {
                  navigator.share({
                    title: 'Edgewater Beach Club',
                    text: 'Check out the Edgewater Beach Club app!',
                    url: window.location.origin
                  });
                } else {
                  // Fallback for browsers without Web Share API
                  navigator.clipboard.writeText(window.location.origin).then(() => {
                    alert('App link copied to clipboard!');
                  }).catch(() => {
                    alert(`Share this link: ${window.location.origin}`);
                  });
                }
              }}
            >
              <span>🔗</span>
              Share App
            </button>
          </div>
        </div>
      </div>

      {/* LumaLocator Modal */}
      {showLumaModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 1000
        }}
        onClick={() => setShowLumaModal(false)}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '0.75rem',
            padding: '2rem',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
          }}
          onClick={(e) => e.stopPropagation()}>
            <div style={{ 
              fontSize: '4rem', 
              marginBottom: '1rem'
            }}>
              🔦
            </div>
            
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '1rem',
              color: '#111827'
            }}>
              LumaLocator™
            </h2>
            
            <div style={{
              backgroundColor: '#fef3c7',
              color: '#92400e',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              FAMILY TRACKING SYSTEM
            </div>
            
            <p style={{
              fontSize: '0.875rem',
              color: '#4b5563',
              marginBottom: '1rem',
              lineHeight: 1.5
            }}>
              Advanced GPS tracking technology to locate the elusive Luma family 
              who somehow are never at the beach when you need them.
            </p>
            
            <div style={{
              backgroundColor: '#f3f4f6',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: '#111827'
              }}>
                Last Known Sightings:
              </h3>
              <ul style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                textAlign: 'left',
                listStyle: 'none',
                padding: 0
              }}>
                <li>• "Just left for the store" (3 hours ago)</li>
                <li>• "Be there in 5 minutes" (45 minutes ago)</li>
                <li>• "On our way!" (Status: Still at home)</li>
              </ul>
            </div>
            
            <button
              style={{
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%'
              }}
              onClick={() => {
                alert('TRACKING INITIATED...\n\nError: Lumas have disabled location services.\n\nLast message: "Almost there!"');
                setShowLumaModal(false);
              }}
            >
              Activate Tracker
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoreView;