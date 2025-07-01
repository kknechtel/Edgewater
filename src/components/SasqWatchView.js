import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const SasqWatchView = () => {
  const { user } = useAuth();
  const [sightings, setSightings] = useState([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [formData, setFormData] = useState({
    location: '',
    description: '',
    credibility: 5,
    photo: null
  });

  useEffect(() => {
    // Load sightings from localStorage
    const saved = localStorage.getItem('sasquatch_sightings');
    if (saved) {
      setSightings(JSON.parse(saved));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newSighting = {
      id: Date.now(),
      ...formData,
      reporter: user.display_name || user.email,
      reporterId: user.id,
      timestamp: new Date().toISOString(),
      verified: false
    };

    const updatedSightings = [newSighting, ...sightings];
    setSightings(updatedSightings);
    localStorage.setItem('sasquatch_sightings', JSON.stringify(updatedSightings));
    
    setFormData({ location: '', description: '', credibility: 5, photo: null });
    setShowReportForm(false);
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diff = now - then;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const getCredibilityStars = (rating) => {
    return '⭐'.repeat(Math.min(rating, 5));
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          👁️ SasqWatch
        </h1>
        <p style={{ color: '#666' }}>Report and track sasquatch sightings in the area</p>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4CAF50' }}>
            {sightings.length}
          </div>
          <div style={{ color: '#666' }}>Total Sightings</div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2196F3' }}>
            {sightings.filter(s => new Date(s.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
          </div>
          <div style={{ color: '#666' }}>This Week</div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FF9800' }}>
            {sightings.filter(s => s.credibility >= 4).length}
          </div>
          <div style={{ color: '#666' }}>High Credibility</div>
        </div>
      </div>

      {/* Report Button */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => setShowReportForm(!showReportForm)}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          {showReportForm ? '❌ Cancel' : '👁️ Report Sighting'}
        </button>
      </div>

      {/* Report Form */}
      {showReportForm && (
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            Report a Sighting
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                placeholder="Where did you see it?"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="Describe what you saw..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Credibility Rating
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.credibility}
                  onChange={(e) => setFormData({ ...formData, credibility: parseInt(e.target.value) })}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: '1.5rem' }}>
                  {getCredibilityStars(formData.credibility)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Submit Report
            </button>
          </form>
        </div>
      )}

      {/* Sightings List */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
          Recent Sightings
        </h2>
        
        {sightings.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            padding: '3rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center',
            color: '#666'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👀</div>
            <p>No sightings reported yet. Be the first!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sightings.map((sighting) => (
              <div
                key={sighting.id}
                style={{
                  backgroundColor: 'white',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                      📍 {sighting.location}
                    </h3>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                      Reported by {sighting.reporter} • {getTimeAgo(sighting.timestamp)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                      {getCredibilityStars(sighting.credibility)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>
                      Credibility
                    </div>
                  </div>
                </div>
                
                <p style={{ lineHeight: '1.6', color: '#333' }}>
                  {sighting.description}
                </p>
                
                {sighting.verified && (
                  <div style={{
                    marginTop: '1rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: '#e8f5e9',
                    color: '#2e7d32',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '4px',
                    fontSize: '0.875rem'
                  }}>
                    ✅ Verified Sighting
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sasquatch Facts */}
      <div style={{
        marginTop: '3rem',
        backgroundColor: '#f5f5f5',
        padding: '2rem',
        borderRadius: '8px'
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
          🦶 Sasquatch Facts
        </h3>
        <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
          <li>Also known as Bigfoot, Sasquatch is typically described as 6-10 feet tall</li>
          <li>Most sightings occur in the Pacific Northwest, but reports come from all over North America</li>
          <li>Common signs include large footprints (hence "Bigfoot"), tree structures, and howling sounds</li>
          <li>The Patterson-Gimlin film from 1967 remains the most famous alleged footage</li>
          <li>Hampton Beach has had 3 reported sightings in the past decade</li>
        </ul>
      </div>
    </div>
  );
};

export default SasqWatchView;