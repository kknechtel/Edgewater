import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const PhotosView = () => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: ''
  });

  // Sample photos
  const samplePhotos = [
    {
      id: 1,
      title: 'Sunset at the Beach',
      description: 'Beautiful sunset captured last evening',
      url: 'https://source.unsplash.com/800x600/?beach,sunset',
      uploadedBy: 'Beach Lover',
      uploadedAt: new Date().toISOString(),
      likes: 15,
      comments: []
    },
    {
      id: 2,
      title: 'Sandcastle Competition',
      description: 'Amazing creations from today\'s competition',
      url: 'https://source.unsplash.com/800x600/?sandcastle',
      uploadedBy: 'Sandy Artist',
      uploadedAt: new Date(Date.now() - 86400000).toISOString(),
      likes: 23,
      comments: []
    },
    {
      id: 3,
      title: 'Morning Surf Session',
      description: 'Perfect waves this morning!',
      url: 'https://source.unsplash.com/800x600/?surfing,beach',
      uploadedBy: 'Wave Rider',
      uploadedAt: new Date(Date.now() - 172800000).toISOString(),
      likes: 31,
      comments: []
    }
  ];

  useEffect(() => {
    // Load photos from localStorage
    const saved = localStorage.getItem('beach_photos');
    if (saved) {
      setPhotos(JSON.parse(saved));
    } else {
      // Initialize with sample data
      setPhotos(samplePhotos);
      localStorage.setItem('beach_photos', JSON.stringify(samplePhotos));
    }
  }, []);

  const handleUpload = (e) => {
    e.preventDefault();
    
    const newPhoto = {
      id: Date.now(),
      ...formData,
      uploadedBy: user.display_name || user.email,
      uploadedAt: new Date().toISOString(),
      likes: 0,
      comments: [],
      likedBy: []
    };

    const updatedPhotos = [newPhoto, ...photos];
    setPhotos(updatedPhotos);
    localStorage.setItem('beach_photos', JSON.stringify(updatedPhotos));
    
    setFormData({ title: '', description: '', url: '' });
    setShowUploadForm(false);
  };

  const handleLike = (photoId) => {
    const updatedPhotos = photos.map(photo => {
      if (photo.id === photoId) {
        const likedBy = photo.likedBy || [];
        const userLiked = likedBy.includes(user.id);
        
        if (userLiked) {
          return {
            ...photo,
            likes: photo.likes - 1,
            likedBy: likedBy.filter(id => id !== user.id)
          };
        } else {
          return {
            ...photo,
            likes: photo.likes + 1,
            likedBy: [...likedBy, user.id]
          };
        }
      }
      return photo;
    });
    
    setPhotos(updatedPhotos);
    localStorage.setItem('beach_photos', JSON.stringify(updatedPhotos));
  };

  const handleComment = (photoId, comment) => {
    const updatedPhotos = photos.map(photo => {
      if (photo.id === photoId) {
        return {
          ...photo,
          comments: [...(photo.comments || []), {
            id: Date.now(),
            text: comment,
            author: user.display_name || user.email,
            timestamp: new Date().toISOString()
          }]
        };
      }
      return photo;
    });
    
    setPhotos(updatedPhotos);
    localStorage.setItem('beach_photos', JSON.stringify(updatedPhotos));
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diff = now - then;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 7) return then.toLocaleDateString();
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          📸 Beach Photos
        </h1>
        <p style={{ color: '#666' }}>Share and enjoy photos from our beach community</p>
      </div>

      {/* Upload Button */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
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
          {showUploadForm ? '❌ Cancel' : '📸 Upload Photo'}
        </button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            Upload New Photo
          </h2>
          
          <form onSubmit={handleUpload}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Photo URL
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                required
                placeholder="https://example.com/photo.jpg"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
              <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                Tip: Use image hosting services like Imgur or direct image URLs
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Give your photo a title"
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
                placeholder="Tell us about this photo..."
                rows={3}
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
              Upload Photo
            </button>
          </form>
        </div>
      )}

      {/* Photo Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {photos.map((photo) => (
          <div
            key={photo.id}
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}
          >
            <img
              src={photo.url}
              alt={photo.title}
              onClick={() => setSelectedPhoto(photo)}
              style={{
                width: '100%',
                height: '250px',
                objectFit: 'cover',
                cursor: 'pointer'
              }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
              }}
            />
            
            <div style={{ padding: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                {photo.title}
              </h3>
              
              {photo.description && (
                <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
                  {photo.description}
                </p>
              )}
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                fontSize: '0.875rem',
                color: '#666',
                marginBottom: '1rem'
              }}>
                <span>by {photo.uploadedBy}</span>
                <span>{getTimeAgo(photo.uploadedAt)}</span>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingTop: '1rem',
                borderTop: '1px solid #eee'
              }}>
                <button
                  onClick={() => handleLike(photo.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'none',
                    border: 'none',
                    color: photo.likedBy?.includes(user.id) ? '#e91e63' : '#666',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  {photo.likedBy?.includes(user.id) ? '❤️' : '🤍'} {photo.likes}
                </button>
                
                <button
                  onClick={() => setSelectedPhoto(photo)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'none',
                    border: 'none',
                    color: '#666',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  💬 {photo.comments?.length || 0}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
          }}
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflow: 'auto',
              width: '100%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.title}
              style={{
                width: '100%',
                height: 'auto'
              }}
            />
            
            <div style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {selectedPhoto.title}
              </h2>
              
              {selectedPhoto.description && (
                <p style={{ color: '#666', marginBottom: '1rem' }}>
                  {selectedPhoto.description}
                </p>
              )}
              
              <div style={{ 
                fontSize: '0.875rem',
                color: '#666',
                marginBottom: '1.5rem'
              }}>
                by {selectedPhoto.uploadedBy} • {getTimeAgo(selectedPhoto.uploadedAt)}
              </div>
              
              {/* Comments */}
              <div style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
                  Comments ({selectedPhoto.comments?.length || 0})
                </h3>
                
                {selectedPhoto.comments?.map((comment) => (
                  <div key={comment.id} style={{ marginBottom: '1rem' }}>
                    <div style={{ fontWeight: '500' }}>{comment.author}</div>
                    <div style={{ color: '#666', fontSize: '0.875rem' }}>
                      {comment.text}
                    </div>
                    <div style={{ color: '#999', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      {getTimeAgo(comment.timestamp)}
                    </div>
                  </div>
                ))}
                
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const comment = e.target.comment.value;
                    if (comment) {
                      handleComment(selectedPhoto.id, comment);
                      e.target.comment.value = '';
                    }
                  }}
                  style={{ marginTop: '1rem' }}
                >
                  <input
                    name="comment"
                    type="text"
                    placeholder="Add a comment..."
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '1rem'
                    }}
                  />
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotosView;