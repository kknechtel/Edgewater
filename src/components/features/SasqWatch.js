import React, { useState, useEffect } from 'react';

const SasqWatch = () => {
  // Fun sasquatch animation states - more cartoonish
  const sasquatchEmojis = ['🦍', '🐻', '👹', '🧌', '🦧', '👺'];
  const [currentEmoji, setCurrentEmoji] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEmoji(prev => (prev + 1) % sasquatchEmojis.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [sasquatchEmojis.length]);
  const [sightings, setSightings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddSighting, setShowAddSighting] = useState(false);
  const [newSighting, setNewSighting] = useState({
    location: '',
    description: '',
    credibility_rating: 5,
    number_of_witnesses: 1,
    time_of_day: 'day',
    weather_conditions: '',
    sasquatch_behavior: '',
    evidence_type: 'visual'
  });

  useEffect(() => {
    fetchSightings();
  }, []);

  const fetchSightings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/sasqwatch', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSightings(data);
      }
    } catch (error) {
      console.error('Error fetching sightings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSighting = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/sasqwatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSighting)
      });
      if (response.ok) {
        setShowAddSighting(false);
        fetchSightings();
        setNewSighting({
          location: '',
          description: '',
          credibility_rating: 5,
          number_of_witnesses: 1,
          time_of_day: 'day',
          weather_conditions: '',
          sasquatch_behavior: '',
          evidence_type: 'visual'
        });
      }
    } catch (error) {
      console.error('Error adding sighting:', error);
    }
  };

  const getCredibilityColor = (rating) => {
    if (rating >= 8) return '#10b981';
    if (rating >= 5) return '#f59e0b';
    return '#ef4444';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Scanning for sasquatch activity...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', paddingBottom: '2rem' }}>
      {/* Fun Sasquatch Header */}
      <div style={{
        backgroundColor: '#065f46',
        color: 'white',
        padding: '1rem',
        borderRadius: '0.5rem',
        marginBottom: '1rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '20px',
          fontSize: '3rem',
          opacity: 0.3,
          transform: 'rotate(15deg)'
        }}>
          👣
        </div>
        <div style={{
          fontSize: '4rem',
          margin: '0.5rem 0',
          animation: 'bounce 2s infinite'
        }}>
          {sasquatchEmojis[currentEmoji]}
        </div>
        <h2 style={{ 
          margin: '0 0 0.5rem 0', 
          fontSize: '1.5rem', 
          fontWeight: '600',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          🌲 SasqWatch Alert System 🌲
        </h2>
        <p style={{ 
          margin: 0, 
          fontSize: '0.875rem', 
          opacity: 0.9,
          fontStyle: 'italic'
        }}>
          "Keeping the beach cryptid-aware since 2025"
        </p>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
          Recent Sightings
        </h3>
        <button
          onClick={() => setShowAddSighting(!showAddSighting)}
          style={{
            backgroundColor: '#065f46',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          {showAddSighting ? '❌ Cancel' : '🚨 Report Sighting'}
        </button>
      </div>

      {showAddSighting && (
        <form onSubmit={handleAddSighting} style={{
          backgroundColor: 'white',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <input
            type="text"
            placeholder="Location (e.g., North Beach, Near Pier)"
            value={newSighting.location}
            onChange={(e) => setNewSighting({...newSighting, location: e.target.value})}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
          
          <textarea
            placeholder="Describe what you saw..."
            value={newSighting.description}
            onChange={(e) => setNewSighting({...newSighting, description: e.target.value})}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              minHeight: '4rem',
              boxSizing: 'border-box',
              resize: 'vertical'
            }}
          />

          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
              Credibility Rating: {newSighting.credibility_rating}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={newSighting.credibility_rating}
              onChange={(e) => setNewSighting({...newSighting, credibility_rating: parseInt(e.target.value)})}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                Witnesses
              </label>
              <input
                type="number"
                min="1"
                value={newSighting.number_of_witnesses}
                onChange={(e) => setNewSighting({...newSighting, number_of_witnesses: parseInt(e.target.value)})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                Time of Day
              </label>
              <select
                value={newSighting.time_of_day}
                onChange={(e) => setNewSighting({...newSighting, time_of_day: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              >
                <option value="dawn">Dawn</option>
                <option value="day">Day</option>
                <option value="dusk">Dusk</option>
                <option value="night">Night</option>
              </select>
            </div>
          </div>

          <input
            type="text"
            placeholder="Weather conditions"
            value={newSighting.weather_conditions}
            onChange={(e) => setNewSighting({...newSighting, weather_conditions: e.target.value})}
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />

          <input
            type="text"
            placeholder="Sasquatch behavior (e.g., walking, hiding, dancing)"
            value={newSighting.sasquatch_behavior}
            onChange={(e) => setNewSighting({...newSighting, sasquatch_behavior: e.target.value})}
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />

          <select
            value={newSighting.evidence_type}
            onChange={(e) => setNewSighting({...newSighting, evidence_type: e.target.value})}
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          >
            <option value="visual">Visual Sighting</option>
            <option value="footprint">Footprint</option>
            <option value="sound">Strange Sounds</option>
            <option value="smell">Unusual Smell</option>
            <option value="other">Other Evidence</option>
          </select>

          <button
            type="submit"
            style={{
              width: '100%',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            Submit Report
          </button>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sightings.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            padding: '3rem 1rem',
            borderRadius: '0.5rem',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No sightings reported</p>
            <p style={{ fontSize: '0.875rem' }}>Keep your eyes peeled! 👀</p>
          </div>
        ) : (
          sightings.map(sighting => (
            <div key={sighting.id} style={{
              backgroundColor: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Credibility indicator */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                backgroundColor: getCredibilityColor(sighting.credibility_rating),
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderBottomLeftRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                {sighting.credibility_rating}/10
              </div>

              <div style={{ marginBottom: '0.5rem', paddingRight: '3rem' }}>
                <h3 style={{ 
                  margin: '0 0 0.25rem 0', 
                  fontSize: '1.125rem', 
                  fontWeight: '600' 
                }}>
                  📍 {sighting.location}
                </h3>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.875rem', 
                  color: '#6b7280'
                }}>
                  {formatDate(sighting.sighting_date)}
                </p>
              </div>
              
              <p style={{ 
                margin: '0.5rem 0', 
                fontSize: '0.875rem', 
                color: '#4b5563' 
              }}>
                {sighting.description}
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.5rem',
                marginTop: '0.75rem',
                fontSize: '0.75rem',
                color: '#6b7280'
              }}>
                <div style={{
                  backgroundColor: '#f3f4f6',
                  padding: '0.5rem',
                  borderRadius: '0.25rem'
                }}>
                  <strong>👥 Witnesses:</strong> {sighting.number_of_witnesses}
                </div>
                <div style={{
                  backgroundColor: '#f3f4f6',
                  padding: '0.5rem',
                  borderRadius: '0.25rem'
                }}>
                  <strong>🕐 Time:</strong> {sighting.time_of_day}
                </div>
                {sighting.weather_conditions && (
                  <div style={{
                    backgroundColor: '#f3f4f6',
                    padding: '0.5rem',
                    borderRadius: '0.25rem'
                  }}>
                    <strong>🌤️ Weather:</strong> {sighting.weather_conditions}
                  </div>
                )}
                {sighting.evidence_type && (
                  <div style={{
                    backgroundColor: '#f3f4f6',
                    padding: '0.5rem',
                    borderRadius: '0.25rem'
                  }}>
                    <strong>🔍 Evidence:</strong> {sighting.evidence_type}
                  </div>
                )}
              </div>

              {sighting.sasquatch_behavior && (
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem',
                  backgroundColor: '#fef3c7',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem'
                }}>
                  <strong>🦶 Behavior:</strong> {sighting.sasquatch_behavior}
                </div>
              )}

              <div style={{
                marginTop: '0.5rem',
                fontSize: '0.75rem',
                color: '#9ca3af',
                textAlign: 'right'
              }}>
                Reported by {sighting.reporter?.name || 'Anonymous'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SasqWatch;