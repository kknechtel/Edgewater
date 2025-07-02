import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getMobileOptimizedStyles } from '../utils/mobileStyles';

const MoreView = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [showLumaModal, setShowLumaModal] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

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

  const mobileStyles = getMobileOptimizedStyles();
  
  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#f0f9ff',
    paddingBottom: '6rem'
  };

  const headerStyle = {
    backgroundColor: '#ffffff',
    padding: mobileStyles.spacing.md,
    textAlign: 'center',
    borderBottom: '2px solid #0891b2',
    boxShadow: '0 2px 8px rgba(8, 145, 178, 0.2)'
  };

  const cardStyle = {
    ...mobileStyles.card,
    marginBottom: mobileStyles.spacing.lg,
    border: '1px solid #e5e7eb'
  };

  const cardTitleStyle = {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: mobileStyles.spacing.lg,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: '#111827'
  };

  const featureButtonStyle = {
    backgroundColor: '#ffffff',
    border: '2px solid #e5e7eb',
    borderRadius: '1rem',
    padding: mobileStyles.spacing.lg,
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: mobileStyles.spacing.md,
    minHeight: '120px',
    width: '100%',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
  };

  const bigButtonStyle = {
    width: '100%',
    minHeight: '72px',
    backgroundColor: '#0891b2',
    color: 'white',
    border: 'none',
    borderRadius: '1rem',
    fontSize: '1.25rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginBottom: mobileStyles.spacing.md,
    boxShadow: '0 4px 16px rgba(8, 145, 178, 0.3)',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem'
  };

  const styles = {
    comingSoonCard: {
      backgroundColor: '#ffffff',
      border: '2px dashed #e5e7eb',
      borderRadius: '1rem',
      padding: mobileStyles.spacing.lg,
      display: 'flex',
      alignItems: 'center',
      gap: mobileStyles.spacing.md,
      marginBottom: mobileStyles.spacing.md,
      opacity: 0.8,
      transition: 'all 0.2s',
      cursor: 'default',
      minHeight: '80px'
    },
    comingSoonIcon: {
      fontSize: '3rem',
      minWidth: '72px',
      textAlign: 'center'
    },
    comingSoonContent: {
      flex: 1
    },
    comingSoonTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '0.5rem'
    },
    comingSoonDesc: {
      fontSize: '1rem',
      color: '#6b7280',
      lineHeight: 1.5
    },
    comingSoonBadge: {
      backgroundColor: '#8b5cf6',
      color: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '1rem',
      fontSize: '0.875rem',
      fontWeight: '600'
    }
  };

  const handleFeatureClick = (feature) => {
    if (feature.id === 'lumalocator') {
      setShowLumaModal(true);
    }
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: '#111827',
          marginBottom: '0.5rem'
        }}>
          ⚙️ More
        </h1>
        <p style={{
          fontSize: '1rem',
          color: '#6b7280'
        }}>
          Features, settings & info
        </p>
      </div>

      {/* Main Content */}
      <div style={{ padding: mobileStyles.spacing.md }}>
        {/* Main Features */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>
            <span>🎯</span> Features
          </h2>
          
          <div>
            {mainFeatures.map(feature => (
              <button
                key={feature.id}
                style={featureButtonStyle}
                onClick={() => setActiveTab(feature.tab)}
                onTouchStart={(e) => {
                  e.currentTarget.style.transform = 'scale(0.98)';
                  e.currentTarget.style.borderColor = '#0891b2';
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = '#0891b2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                <div style={{ fontSize: '2.5rem' }}>{feature.icon}</div>
                <div style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#111827'
                }}>{feature.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Coming Soon Section */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>
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
                onTouchStart={(e) => {
                  if (feature.special) {
                    e.currentTarget.style.transform = 'scale(0.98)';
                  }
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
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
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>
            <span>📱</span> App Info
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '1rem', color: '#4b5563' }}>
              <strong>Version:</strong> 2.0.0
            </div>
            <div style={{ fontSize: '1rem', color: '#4b5563' }}>
              <strong>Beach Location:</strong> Sea Bright, NJ
            </div>
            {user && (
              <div style={{ fontSize: '1rem', color: '#4b5563' }}>
                <strong>Logged in as:</strong> {user.display_name || user.first_name || user.email}
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: mobileStyles.spacing.md, marginTop: mobileStyles.spacing.lg }}>
            <button
              style={{
                ...bigButtonStyle,
                backgroundColor: '#10b981',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
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
              style={bigButtonStyle}
              onTouchStart={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
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

      {/* Floating Quick Actions Button */}
      <button
        onClick={() => setShowQuickActions(!showQuickActions)}
        style={{
          position: 'fixed',
          bottom: '6rem',
          right: '1rem',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: showQuickActions ? '#ef4444' : '#8b5cf6',
          color: 'white',
          border: 'none',
          fontSize: '1.5rem',
          boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          transition: 'all 0.2s'
        }}
        onTouchStart={(e) => {
          e.currentTarget.style.transform = 'scale(0.95)';
        }}
        onTouchEnd={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        aria-label="Quick actions"
      >
        {showQuickActions ? '✕' : '⚡'}
      </button>

      {/* Quick Actions Menu */}
      {showQuickActions && (
        <div style={{
          position: 'fixed',
          bottom: '11rem',
          right: '1rem',
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
          padding: mobileStyles.spacing.md,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          zIndex: 99,
          minWidth: '200px',
          border: '1px solid #e5e7eb'
        }}>
          <button
            onClick={() => {
              setActiveTab('profile');
              setShowQuickActions(false);
            }}
            style={{
              width: '100%',
              minHeight: '56px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: mobileStyles.spacing.sm,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              color: '#374151'
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            👤 Profile
          </button>
          
          <button
            onClick={() => {
              setActiveTab('sasqwatch');
              setShowQuickActions(false);
            }}
            style={{
              width: '100%',
              minHeight: '56px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: mobileStyles.spacing.sm,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              color: '#374151'
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            👣 SasqWatch
          </button>
          
          <button
            onClick={() => {
              setActiveTab('photos');
              setShowQuickActions(false);
            }}
            style={{
              width: '100%',
              minHeight: '56px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              color: '#374151'
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            📸 Photos
          </button>
        </div>
      )}

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
                padding: '1rem 2rem',
                borderRadius: '1rem',
                fontSize: '1.125rem',
                fontWeight: '700',
                cursor: 'pointer',
                width: '100%',
                minHeight: '60px',
                transition: 'all 0.2s'
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
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