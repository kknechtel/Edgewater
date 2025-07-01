import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const MusicView = () => {
  const { user } = useAuth();
  const [bands, setBands] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    genre: '',
    date: '',
    time: '',
    rating: 0,
    review: ''
  });

  // Sample band data
  const sampleBands = [
    { id: 1, name: 'The Beach Bums', genre: 'Rock', date: '2025-07-04', time: '7:00 PM', rating: 4.5, reviews: 12 },
    { id: 2, name: 'Surf Riders', genre: 'Reggae', date: '2025-07-11', time: '6:30 PM', rating: 4.8, reviews: 8 },
    { id: 3, name: 'Coastal Groove', genre: 'Jazz', date: '2025-07-18', time: '8:00 PM', rating: 4.2, reviews: 5 },
    { id: 4, name: 'Sand Dollar Band', genre: 'Country', date: '2025-07-25', time: '7:30 PM', rating: 3.9, reviews: 15 },
    { id: 5, name: 'High Tide', genre: 'Blues', date: '2025-08-01', time: '7:00 PM', rating: 4.6, reviews: 10 }
  ];

  useEffect(() => {
    // Load bands from localStorage
    const saved = localStorage.getItem('beach_bands');
    if (saved) {
      setBands(JSON.parse(saved));
    } else {
      // Initialize with sample data
      setBands(sampleBands);
      localStorage.setItem('beach_bands', JSON.stringify(sampleBands));
    }
  }, []);

  const handleAddBand = (e) => {
    e.preventDefault();
    
    const newBand = {
      id: Date.now(),
      ...formData,
      rating: 0,
      reviews: 0,
      addedBy: user.display_name || user.email
    };

    const updatedBands = [...bands, newBand];
    setBands(updatedBands);
    localStorage.setItem('beach_bands', JSON.stringify(updatedBands));
    
    setFormData({ name: '', genre: '', date: '', time: '', rating: 0, review: '' });
    setShowAddForm(false);
  };

  const handleRateBand = (bandId, rating) => {
    const updatedBands = bands.map(band => {
      if (band.id === bandId) {
        const newReviews = band.reviews + 1;
        const newRating = ((band.rating * band.reviews) + rating) / newReviews;
        return { ...band, rating: newRating, reviews: newReviews };
      }
      return band;
    });
    
    setBands(updatedBands);
    localStorage.setItem('beach_bands', JSON.stringify(updatedBands));
  };

  const getFilteredBands = () => {
    let filtered = bands;
    
    if (searchTerm) {
      filtered = filtered.filter(band => 
        band.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        band.genre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filter === 'upcoming') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(band => band.date >= today);
    } else if (filter === 'top-rated') {
      filtered = filtered.filter(band => band.rating >= 4);
    }
    
    return filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <>
        {'⭐'.repeat(fullStars)}
        {hasHalfStar && '✨'}
      </>
    );
  };

  const filteredBands = getFilteredBands();

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          🎸 Beach Music Guide
        </h1>
        <p style={{ color: '#666' }}>Discover and rate the best bands at the beach</p>
      </div>

      {/* Search and Filter */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="Search bands..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: '1',
            minWidth: '200px',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '1rem'
          }}
        />
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '1rem',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
        >
          <option value="all">All Bands</option>
          <option value="upcoming">Upcoming Shows</option>
          <option value="top-rated">Top Rated (4+ ⭐)</option>
        </select>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            backgroundColor: '#2196F3',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          {showAddForm ? '❌ Cancel' : '➕ Add Band'}
        </button>
      </div>

      {/* Add Band Form */}
      {showAddForm && (
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            Add New Band
          </h2>
          
          <form onSubmit={handleAddBand}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Band Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Genre
                </label>
                <input
                  type="text"
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  required
                  placeholder="Rock, Jazz, etc."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Time
                </label>
                <input
                  type="text"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                  placeholder="7:00 PM"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>
            
            <button
              type="submit"
              style={{
                marginTop: '1.5rem',
                backgroundColor: '#2196F3',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Add Band
            </button>
          </form>
        </div>
      )}

      {/* Bands Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {filteredBands.map((band) => (
          <div
            key={band.id}
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}
          >
            <div style={{ 
              backgroundColor: '#2196F3',
              color: 'white',
              padding: '1rem',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                {band.name}
              </h3>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                {band.genre}
              </div>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  📅 {new Date(band.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div style={{ color: '#666' }}>
                  🕐 {band.time}
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingTop: '1rem',
                borderTop: '1px solid #eee'
              }}>
                <div>
                  <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                    {getRatingStars(band.rating)}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>
                    {band.rating.toFixed(1)} ({band.reviews} reviews)
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRateBand(band.id, star)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        opacity: 0.5,
                        transition: 'opacity 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.opacity = 1}
                      onMouseLeave={(e) => e.target.style.opacity = 0.5}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBands.length === 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center',
          color: '#666'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎵</div>
          <p>No bands found matching your criteria.</p>
        </div>
      )}

      {/* Music Tips */}
      <div style={{
        marginTop: '3rem',
        backgroundColor: '#e3f2fd',
        padding: '2rem',
        borderRadius: '8px'
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
          🎵 Beach Music Tips
        </h3>
        <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
          <li>Bring a blanket or low beach chair for comfortable seating</li>
          <li>Most shows start around sunset - arrive early for best spots</li>
          <li>Support local bands by tipping - they play for the love of music!</li>
          <li>Dancing on the beach is encouraged - kick off your shoes!</li>
          <li>Check weather forecast - some shows may be cancelled for storms</li>
        </ul>
      </div>
    </div>
  );
};

export default MusicView;