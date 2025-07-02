import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getMobileOptimizedStyles } from '../utils/mobileStyles';

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

  const mobileStyles = getMobileOptimizedStyles();

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
      comments: [],
      likedBy: []
    },
    {
      id: 2,
      title: 'Sandcastle Competition',
      description: 'Amazing creations from today\'s competition',
      url: 'https://source.unsplash.com/800x600/?sandcastle',
      uploadedBy: 'Sandy Artist',
      uploadedAt: new Date(Date.now() - 86400000).toISOString(),
      likes: 23,
      comments: [],
      likedBy: []
    },
    {
      id: 3,
      title: 'Morning Surf Session',
      description: 'Perfect waves this morning!',
      url: 'https://source.unsplash.com/800x600/?surfing,beach',
      uploadedBy: 'Wave Rider',
      uploadedAt: new Date(Date.now() - 172800000).toISOString(),
      likes: 31,
      comments: [],
      likedBy: []
    }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('beach_photos');
    if (saved) {
      setPhotos(JSON.parse(saved));
    } else {
      setPhotos(samplePhotos);
      localStorage.setItem('beach_photos', JSON.stringify(samplePhotos));
    }
  }, []);

  const handleUpload = (e) => {
    e.preventDefault();
    
    const newPhoto = {
      id: Date.now(),
      ...formData,
      uploadedBy: user?.display_name || user?.email || 'Anonymous',
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
        const userId = user?.id || 'anonymous';
        const userLiked = likedBy.includes(userId);
        
        if (userLiked) {
          return {
            ...photo,
            likes: photo.likes - 1,
            likedBy: likedBy.filter(id => id !== userId)
          };
        } else {
          return {
            ...photo,
            likes: photo.likes + 1,
            likedBy: [...likedBy, userId]
          };
        }
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
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

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
    marginBottom: mobileStyles.spacing.md,
    overflow: 'hidden',
    border: '1px solid #e5e7eb'
  };

  const bigButtonStyle = {
    width: '100%',
    minHeight: '60px',
    backgroundColor: '#0891b2',
    color: 'white',
    border: 'none',
    borderRadius: '1rem',
    fontSize: '1.25rem',
    fontWeight: '700',
    cursor: 'pointer',
    margin: mobileStyles.spacing.sm,
    boxShadow: '0 4px 16px rgba(8, 145, 178, 0.3)',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  };

  const actionButtonStyle = {
    minHeight: '56px',
    minWidth: '56px',
    border: 'none',
    borderRadius: '1rem',
    fontSize: '1.25rem',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
    padding: '0 1rem'
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
          📸 Beach Photos
        </h1>
        <p style={{
          fontSize: '1rem',
          color: '#6b7280'
        }}>
          Share moments from the beach
        </p>
      </div>

      {/* Upload Button */}
      <div style={{ padding: mobileStyles.spacing.md }}>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          style={{
            ...bigButtonStyle,
            backgroundColor: showUploadForm ? '#ef4444' : '#10b981',
            boxShadow: showUploadForm ? 
              '0 4px 16px rgba(239, 68, 68, 0.3)' : 
              '0 4px 16px rgba(16, 185, 129, 0.3)'
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.transform = 'scale(0.98)';
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {showUploadForm ? '❌ Cancel Upload' : '📸 Share Photo'}
        </button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div style={{ padding: mobileStyles.spacing.md }}>
          <div style={cardStyle}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: mobileStyles.spacing.lg,
              color: '#111827',
              textAlign: 'center'
            }}>
              📤 Share Your Photo
            </h2>
            
            <form onSubmit={handleUpload}>
              <div style={{ marginBottom: mobileStyles.spacing.lg }}>
                <label style={{
                  display: 'block',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  marginBottom: mobileStyles.spacing.sm,
                  color: '#374151'
                }}>
                  Photo URL
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  required
                  placeholder="Paste image URL here"
                  style={{
                    width: '100%',
                    minHeight: '56px',
                    padding: mobileStyles.spacing.md,
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: mobileStyles.spacing.lg }}>
                <label style={{
                  display: 'block',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  marginBottom: mobileStyles.spacing.sm,
                  color: '#374151'
                }}>
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="What's in this photo?"
                  style={{
                    width: '100%',
                    minHeight: '56px',
                    padding: mobileStyles.spacing.md,
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: mobileStyles.spacing.lg }}>
                <label style={{
                  display: 'block',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  marginBottom: mobileStyles.spacing.sm,
                  color: '#374151'
                }}>
                  Description (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell us about this moment..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: mobileStyles.spacing.md,
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="submit"
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
              >
                🚀 Share Photo
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Photos Feed */}
      <div style={{ padding: mobileStyles.spacing.md }}>
        {photos.length === 0 ? (
          <div style={cardStyle}>
            <div style={{
              textAlign: 'center',
              padding: mobileStyles.spacing.xl,
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📸</div>
              <p style={{ fontSize: '1rem' }}>No photos yet. Be the first to share!</p>
            </div>
          </div>
        ) : (
          photos.map((photo) => (
            <div key={photo.id} style={cardStyle}>
              {/* Photo Header */}
              <div style={{
                padding: mobileStyles.spacing.md,
                borderBottom: '1px solid #f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '0.25rem'
                  }}>
                    {photo.title}
                  </h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280'
                  }}>
                    by {photo.uploadedBy} • {getTimeAgo(photo.uploadedAt)}
                  </p>
                </div>
              </div>

              {/* Photo Image */}
              <div
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  style={{
                    width: '100%',
                    height: '300px',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x600/e5e7eb/6b7280?text=Image+Not+Found';
                  }}
                />
              </div>

              {/* Photo Description */}
              {photo.description && (
                <div style={{
                  padding: mobileStyles.spacing.md,
                  borderBottom: '1px solid #f3f4f6'
                }}>
                  <p style={{
                    fontSize: '1rem',
                    color: '#374151',
                    lineHeight: '1.5'
                  }}>
                    {photo.description}
                  </p>
                </div>
              )}

              {/* Photo Actions */}
              <div style={{
                padding: mobileStyles.spacing.md,
                display: 'flex',
                gap: mobileStyles.spacing.md,
                alignItems: 'center'
              }}>
                <button
                  onClick={() => handleLike(photo.id)}
                  style={{
                    ...actionButtonStyle,
                    backgroundColor: photo.likedBy?.includes(user?.id || 'anonymous') ? '#fef2f2' : '#f8fafc',
                    color: photo.likedBy?.includes(user?.id || 'anonymous') ? '#dc2626' : '#6b7280',
                    border: photo.likedBy?.includes(user?.id || 'anonymous') ? '2px solid #dc2626' : '2px solid #e5e7eb'
                  }}
                  onTouchStart={(e) => {
                    e.currentTarget.style.transform = 'scale(0.95)';
                  }}
                  onTouchEnd={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {photo.likedBy?.includes(user?.id || 'anonymous') ? '❤️' : '🤍'} {photo.likes}
                </button>
                
                <button
                  onClick={() => setSelectedPhoto(photo)}
                  style={{
                    ...actionButtonStyle,
                    backgroundColor: '#f8fafc',
                    color: '#6b7280',
                    border: '2px solid #e5e7eb'
                  }}
                  onTouchStart={(e) => {
                    e.currentTarget.style.transform = 'scale(0.95)';
                  }}
                  onTouchEnd={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  💬 {photo.comments?.length || 0}
                </button>
              </div>
            </div>
          ))
        )}
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
            backgroundColor: 'rgba(0,0,0,0.9)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column'
          }}
          onClick={() => setSelectedPhoto(null)}
        >
          {/* Close Button */}
          <div style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            zIndex: 1001
          }}>
            <button
              onClick={() => setSelectedPhoto(null)}
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                fontSize: '1.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.transform = 'scale(0.95)';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ✕
            </button>
          </div>

          {/* Photo */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.title}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
          </div>

          {/* Photo Info */}
          <div
            style={{
              backgroundColor: 'white',
              padding: mobileStyles.spacing.md,
              maxHeight: '40vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
              color: '#111827'
            }}>
              {selectedPhoto.title}
            </h2>
            
            {selectedPhoto.description && (
              <p style={{
                color: '#6b7280',
                marginBottom: '1rem',
                fontSize: '1rem',
                lineHeight: '1.5'
              }}>
                {selectedPhoto.description}
              </p>
            )}
            
            <div style={{
              fontSize: '0.875rem',
              color: '#9ca3af',
              marginBottom: '1rem'
            }}>
              by {selectedPhoto.uploadedBy} • {getTimeAgo(selectedPhoto.uploadedAt)}
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: mobileStyles.spacing.md,
              marginBottom: '1rem'
            }}>
              <button
                onClick={() => handleLike(selectedPhoto.id)}
                style={{
                  ...actionButtonStyle,
                  backgroundColor: selectedPhoto.likedBy?.includes(user?.id || 'anonymous') ? '#fef2f2' : '#f8fafc',
                  color: selectedPhoto.likedBy?.includes(user?.id || 'anonymous') ? '#dc2626' : '#6b7280',
                  border: selectedPhoto.likedBy?.includes(user?.id || 'anonymous') ? '2px solid #dc2626' : '2px solid #e5e7eb'
                }}
                onTouchStart={(e) => {
                  e.currentTarget.style.transform = 'scale(0.95)';
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {selectedPhoto.likedBy?.includes(user?.id || 'anonymous') ? '❤️' : '🤍'} {selectedPhoto.likes}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Upload Button */}
      <button
        onClick={() => setShowUploadForm(true)}
        style={{
          position: 'fixed',
          bottom: '6rem',
          right: '1rem',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#10b981',
          color: 'white',
          border: 'none',
          fontSize: '1.5rem',
          boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
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
        aria-label="Upload photo"
      >
        📸
      </button>
    </div>
  );
};

export default PhotosView;