import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const MainApp = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#3b82f6',
        color: 'white',
        padding: '1rem 2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
            🏖️ Edgewater Beach Club
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Welcome, {user?.name || user?.email}!</span>
            <button
              onClick={logout}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {/* Calendar Card */}
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600' }}>
              📅 Event Calendar
            </h2>
            <p style={{ color: '#6b7280', margin: '0 0 1rem 0' }}>
              Manage beach events, parties, and gatherings
            </p>
            <button style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}>
              View Calendar
            </button>
          </div>

          {/* SasqWatch Card */}
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600' }}>
              👁️ SasqWatch
            </h2>
            <p style={{ color: '#6b7280', margin: '0 0 1rem 0' }}>
              Report sasquatch sightings with credibility ratings
            </p>
            <button style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}>
              Report Sighting
            </button>
          </div>

          {/* Photos Card */}
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600' }}>
              📸 Beach Photos
            </h2>
            <p style={{ color: '#6b7280', margin: '0 0 1rem 0' }}>
              Share and view beach memories from the club
            </p>
            <button style={{
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}>
              View Gallery
            </button>
          </div>

          {/* Messages Card */}
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600' }}>
              💬 Community Messages
            </h2>
            <p style={{ color: '#6b7280', margin: '0 0 1rem 0' }}>
              Connect with other beach club members
            </p>
            <button style={{
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}>
              Open Messages
            </button>
          </div>
        </div>

        {/* Success Message */}
        <div style={{
          marginTop: '2rem',
          backgroundColor: '#d1fae5',
          border: '2px solid #34d399',
          color: '#065f46',
          padding: '1rem',
          borderRadius: '0.5rem',
          textAlign: 'center'
        }}>
          🎉 <strong>Login Successful!</strong> Welcome to the Edgewater Beach Club community app!
        </div>
      </main>
    </div>
  );
};

export default MainApp;