import React, { useState, useMemo } from 'react';
import { bandGuideData } from '../../data/bandGuideData';

const Music = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showOnlyRecommended, setShowOnlyRecommended] = useState(false);

  // Filter bands based on search and category
  const filteredBands = useMemo(() => {
    let bands = [];
    
    if (selectedCategory === 'all') {
      bands = bandGuideData.categories.flatMap(cat => 
        cat.bands.map(band => ({ ...band, category: cat.name }))
      );
    } else {
      const category = bandGuideData.categories.find(cat => cat.id === selectedCategory);
      if (category) {
        bands = category.bands.map(band => ({ ...band, category: category.name }));
      }
    }

    // Apply search filter
    if (searchTerm) {
      bands = bands.filter(band => 
        band.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        band.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        band.vibe?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        band.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply recommendation filter
    if (showOnlyRecommended) {
      bands = bands.filter(band => band.rating >= 4);
    }

    return bands;
  }, [searchTerm, selectedCategory, showOnlyRecommended]);

  const getRatingColor = (rating) => {
    if (rating >= 5) return '#10b981';
    if (rating >= 4) return '#3b82f6';
    if (rating >= 3) return '#f59e0b';
    if (rating >= 2) return '#ef4444';
    return '#6b7280';
  };

  const getRatingEmoji = (rating) => {
    if (rating >= 5) return '🌟';
    if (rating >= 4) return '⭐';
    if (rating >= 3) return '✨';
    if (rating >= 2) return '💫';
    return '⚡';
  };

  return (
    <div style={{ padding: '1rem', paddingBottom: '2rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>
          🎸 Band Guide 2025
        </h2>
      </div>

      {/* Search and Filters */}
      <div style={{
        backgroundColor: 'white',
        padding: '1rem',
        borderRadius: '0.5rem',
        marginBottom: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <input
          type="text"
          placeholder="Search bands, genres, venues..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              flex: 1,
              minWidth: '150px',
              padding: '0.5rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
          >
            <option value="all">All Categories</option>
            {bandGuideData.categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name.replace(/[⭐👍⚠️🎸❌]/g, '').trim()}
              </option>
            ))}
          </select>
          
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            padding: '0.5rem'
          }}>
            <input
              type="checkbox"
              checked={showOnlyRecommended}
              onChange={(e) => setShowOnlyRecommended(e.target.checked)}
            />
            Only 4+ ⭐
          </label>
        </div>
      </div>

      {/* Quick Reference */}
      {!searchTerm && selectedCategory === 'all' && (
        <div style={{
          backgroundColor: '#f0f9ff',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem'
        }}>
          <h3 style={{ 
            margin: '0 0 0.75rem 0', 
            fontSize: '1.125rem', 
            fontWeight: '600' 
          }}>
            {bandGuideData.quickReference.title}
          </h3>
          {bandGuideData.quickReference.sections.map((section, index) => (
            <div key={index} style={{ marginBottom: '0.5rem' }}>
              <strong style={{ fontSize: '0.875rem', color: '#1e40af' }}>
                {section.title}:
              </strong>
              <p style={{ 
                margin: '0.25rem 0 0 0', 
                fontSize: '0.813rem', 
                color: '#4b5563' 
              }}>
                {section.bands.join(', ')}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Band List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredBands.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            padding: '3rem 1rem',
            borderRadius: '0.5rem',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
              No bands found
            </p>
            <p style={{ fontSize: '0.875rem' }}>
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          filteredBands.map((band, index) => (
            <div key={index} style={{
              backgroundColor: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              borderLeft: `4px solid ${getRatingColor(band.rating)}`
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '0.5rem'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    margin: '0 0 0.25rem 0', 
                    fontSize: '1.125rem', 
                    fontWeight: '600' 
                  }}>
                    {band.name}
                  </h3>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '0.813rem', 
                    color: '#0891b2',
                    fontWeight: '500'
                  }}>
                    {band.date} • {band.time}
                  </p>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '1.25rem'
                }}>
                  {getRatingEmoji(band.rating)}
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: getRatingColor(band.rating)
                  }}>
                    {band.rating}/5
                  </span>
                </div>
              </div>
              
              <p style={{ 
                margin: '0.5rem 0', 
                fontSize: '0.875rem', 
                color: '#4b5563' 
              }}>
                {band.description}
              </p>

              {band.vibe && (
                <p style={{ 
                  margin: '0.5rem 0', 
                  fontSize: '0.813rem', 
                  color: '#6b7280',
                  fontStyle: 'italic'
                }}>
                  "{band.vibe}"
                </p>
              )}

              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginTop: '0.75rem'
              }}>
                {band.tags?.map((tag, i) => (
                  <span key={i} style={{
                    backgroundColor: '#e0e7ff',
                    color: '#3730a3',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    {tag}
                  </span>
                ))}
                {band.weddingBand === true && (
                  <span style={{
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    Wedding Band
                  </span>
                )}
              </div>

              {(band.regularVenues || band.socialMedia || band.reviews) && (
                <div style={{
                  marginTop: '0.75rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid #e5e7eb',
                  fontSize: '0.75rem',
                  color: '#6b7280'
                }}>
                  {band.regularVenues && (
                    <div>📍 {band.regularVenues}</div>
                  )}
                  {band.socialMedia && (
                    <div>📱 {band.socialMedia}</div>
                  )}
                  {band.reviews && (
                    <div>⭐ {band.reviews}</div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Final Recommendation */}
      {!searchTerm && selectedCategory === 'all' && (
        <div style={{
          marginTop: '1.5rem',
          backgroundColor: '#4c1d95',
          color: 'white',
          padding: '1rem',
          borderRadius: '0.5rem'
        }}>
          <h3 style={{ 
            margin: '0 0 0.5rem 0', 
            fontSize: '1.125rem', 
            fontWeight: '600' 
          }}>
            {bandGuideData.finalRecommendation.title}
          </h3>
          <p style={{ 
            margin: 0, 
            fontSize: '0.813rem', 
            lineHeight: '1.5' 
          }}>
            {bandGuideData.finalRecommendation.text}
          </p>
        </div>
      )}
    </div>
  );
};

export default Music;