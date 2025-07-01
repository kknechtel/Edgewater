import React, { useState } from 'react';

const Photos = () => {
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Placeholder photos for demo
  const demoPhotos = [
    { id: 1, caption: "Sunset at the beach", likes: 23, date: "2024-01-15" },
    { id: 2, caption: "Beach party last weekend!", likes: 45, date: "2024-01-14" },
    { id: 3, caption: "Perfect waves today 🌊", likes: 67, date: "2024-01-13" },
  ];

  return (
    <div style={{ padding: '1rem', paddingBottom: '2rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>
          Beach Photos
        </h2>
        <button
          style={{
            backgroundColor: '#f59e0b',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          + Upload Photo
        </button>
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '1rem'
        }}>
          📸
        </div>
        <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
          Photo sharing coming soon!
        </p>
        <p style={{ fontSize: '0.875rem' }}>
          Share your beach memories with the community
        </p>
      </div>

      {/* Demo photo grid */}
      <div style={{
        marginTop: '1.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '0.5rem'
      }}>
        {demoPhotos.map(photo => (
          <div key={photo.id} style={{
            aspectRatio: '1',
            backgroundColor: '#e5e7eb',
            borderRadius: '0.5rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
              color: 'white',
              padding: '0.5rem',
              fontSize: '0.75rem'
            }}>
              <p style={{ margin: '0 0 0.25rem 0' }}>{photo.caption}</p>
              <p style={{ margin: 0 }}>❤️ {photo.likes}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Photos;