import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/designSystem.css';

const MoreView = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [showLumaModal, setShowLumaModal] = useState(false);

  const mainFeatures = [
    { id: 'music', label: 'Music', icon: '🎸', tab: 'music' },
    { id: 'photos', label: 'Photos', icon: '📸', tab: 'photos' },
    { id: 'bags', label: 'Bags', icon: '🎯', tab: 'bags' },
    { id: 'weather', label: 'Weather', icon: '🌊', tab: 'weather' },
    { id: 'dinner', label: 'Dinner', icon: '🍽️', tab: 'dinner' },
    { id: 'profile', label: 'Profile Settings', icon: '👤', tab: 'profile' }
  ];

  const comingSoonFeatures = [
    {
      id: 'lumalocator',
      title: 'LumaLocator',
      icon: '🔦',
      desc: 'Track bioluminescent plankton blooms for magical night swims',
      classified: true
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

  const handleFeatureClick = (feature) => {
    if (feature.id === 'lumalocator') {
      setShowLumaModal(true);
    }
  };

  return (
    <div style={{ 
      backgroundColor: 'var(--bg-secondary)', 
      minHeight: '100vh',
      paddingBottom: '5rem'
    }}>
      {/* Header */}
      <div className="card" style={{ 
        borderRadius: 0,
        marginBottom: 0,
        boxShadow: 'var(--shadow)',
        padding: 'var(--space-6)'
      }}>
        <h1 className="text-2xl font-bold text-primary">More</h1>
        <p className="text-sm text-muted">
          All features & settings
        </p>
      </div>

      {/* Main Content */}
      <div style={{ padding: 'var(--space-4)' }}>
        {/* Main Features */}
        <div className="card">
          <h2 className="card-title">
            <span>🎯</span> Features
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'var(--space-3)'
          }}>
            {mainFeatures.map(feature => (
              <button
                key={feature.id}
                className="card"
                style={{
                  padding: 'var(--space-4)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: '1px solid var(--gray-200)',
                  transition: 'all var(--transition)'
                }}
                onClick={() => setActiveTab(feature.tab)}
              >
                <div style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
                  {feature.icon}
                </div>
                <div className="text-sm font-medium">{feature.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="card" style={{ marginTop: 'var(--space-4)' }}>
          <h2 className="card-title">
            <span>✨</span> Coming Soon
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {comingSoonFeatures.map(feature => (
              <div
                key={feature.id}
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '2px dashed var(--gray-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-4)',
                  opacity: 0.8,
                  transition: 'all var(--transition)',
                  cursor: feature.classified ? 'pointer' : 'default'
                }}
                onClick={() => handleFeatureClick(feature)}
                className="hover:opacity-100 hover:border-primary"
              >
                <div style={{ 
                  fontSize: 'var(--text-3xl)', 
                  minWidth: '60px',
                  textAlign: 'center'
                }}>
                  {feature.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 className="text-base font-semibold text-primary mb-1">
                    {feature.title}
                    {feature.classified && (
                      <span style={{
                        marginLeft: 'var(--space-2)',
                        fontSize: 'var(--text-xs)',
                        backgroundColor: 'var(--danger)',
                        color: 'var(--white)',
                        padding: '0.125rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        verticalAlign: 'middle'
                      }}>
                        CLASSIFIED
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-muted">
                    {feature.desc}
                  </p>
                </div>
                <span style={{
                  backgroundColor: 'var(--purple)',
                  color: 'var(--white)',
                  padding: 'var(--space-1) var(--space-3)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-semibold)'
                }}>
                  Soon
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* App Info */}
        <div className="card" style={{ marginTop: 'var(--space-4)' }}>
          <h2 className="card-title">
            <span>📱</span> App Info
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div className="text-sm text-secondary">
              <strong>Version:</strong> 2.0.0
            </div>
            <div className="text-sm text-secondary">
              <strong>Beach Location:</strong> Sea Bright, NJ
            </div>
            {user && (
              <div className="text-sm text-secondary">
                <strong>Logged in as:</strong> {user.display_name || user.first_name || user.email}
              </div>
            )}
          </div>
          
          <button
            className="btn btn-primary"
            style={{ marginTop: 'var(--space-4)', width: '100%' }}
            onClick={() => {
              if ('share' in navigator) {
                navigator.share({
                  title: 'Edgewater Beach Club',
                  text: 'Check out the Edgewater Beach Club app!',
                  url: window.location.origin
                });
              }
            }}
          >
            Share App
          </button>
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
          padding: 'var(--space-4)',
          zIndex: 'var(--z-modal)'
        }}
        onClick={() => setShowLumaModal(false)}>
          <div className="card" style={{
            maxWidth: '400px',
            width: '100%',
            padding: 'var(--space-6)',
            textAlign: 'center'
          }}
          onClick={(e) => e.stopPropagation()}>
            <div style={{ 
              fontSize: '4rem', 
              marginBottom: 'var(--space-4)',
              filter: 'brightness(0) invert(1)',
              backgroundColor: 'black',
              width: '80px',
              height: '80px',
              margin: '0 auto var(--space-4)',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              🔦
            </div>
            
            <h2 className="text-xl font-bold mb-4">
              PROJECT LUMALOC
            </h2>
            
            <div style={{
              backgroundColor: 'var(--danger)',
              color: 'var(--white)',
              padding: 'var(--space-2)',
              borderRadius: 'var(--radius)',
              marginBottom: 'var(--space-4)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-bold)'
            }}>
              LEVEL 5 CLEARANCE REQUIRED
            </div>
            
            <p className="text-sm text-secondary mb-4">
              This feature is part of the National Oceanic Defense Initiative (NODI). 
              Bioluminescent tracking data is collected for "recreational purposes only" 
              and definitely not for monitoring underwater movements of [REDACTED].
            </p>
            
            <p className="text-xs text-muted mb-4">
              By accessing this feature, you consent to passive monitoring by the 
              Department of Aquatic Phenomena. Your location data will be used to 
              enhance "plankton prediction algorithms."
            </p>
            
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setShowLumaModal(false)}
              >
                Deny Access
              </button>
              <button
                className="btn"
                style={{ 
                  flex: 1, 
                  backgroundColor: 'var(--danger)',
                  color: 'var(--white)'
                }}
                onClick={() => {
                  alert('ACCESS DENIED\n\nInsufficient clearance level.\nThis incident has been reported.');
                  setShowLumaModal(false);
                }}
              >
                Request Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoreView;