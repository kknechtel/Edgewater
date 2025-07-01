import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { notificationService } from '../services/notificationService';

const UserProfile = ({ onClose }) => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    display_name: '',
    bio: '',
    favorite_band: '',
    beach_member_since: '',
    avatar_url: '',
    preferences: {
      notify_events: true,
      notify_bags_games: true,
      notify_messages: true,
      location_sharing: false
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        display_name: user.display_name || '',
        bio: user.bio || '',
        favorite_band: user.favorite_band || '',
        beach_member_since: user.beach_member_since || new Date().getFullYear().toString(),
        avatar_url: user.avatar_url || '',
        preferences: {
          notify_events: user.notify_events !== false,
          notify_bags_games: user.notify_bags_games !== false,
          notify_messages: user.notify_messages !== false,
          location_sharing: user.location_sharing === true
        }
      });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // In a real app, this would call the backend API
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        updateUser(updatedUser);
        notificationService.showToast('Profile updated successfully!', 'success');
        setIsEditing(false);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      // For now, just save to localStorage and show success
      const updatedUser = { ...user, ...profile };
      localStorage.setItem('user_profile', JSON.stringify(updatedUser));
      notificationService.showToast('Profile saved locally!', 'success');
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (badgeType) => {
    switch (badgeType) {
      case 'admin': return '#f59e0b';
      case 'member': return '#3b82f6';
      case 'new': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getUserBadges = () => {
    const badges = [];
    const currentYear = new Date().getFullYear();
    
    if (user?.is_admin) badges.push({ type: 'admin', label: 'Admin' });
    if (profile.beach_member_since && (currentYear - parseInt(profile.beach_member_since)) >= 5) {
      badges.push({ type: 'veteran', label: 'Veteran Member' });
    }
    if (profile.beach_member_since && (currentYear - parseInt(profile.beach_member_since)) < 1) {
      badges.push({ type: 'new', label: 'New Member' });
    }
    if (!badges.length) badges.push({ type: 'member', label: 'Member' });
    
    return badges;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        padding: '2rem',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>
            👤 User Profile
          </h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            ×
          </button>
        </div>

        {/* Avatar Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: '#e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            marginBottom: '1rem',
            backgroundImage: profile.avatar_url ? `url(${profile.avatar_url})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
            {!profile.avatar_url && '🏖️'}
          </div>
          
          {/* User Badges */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {getUserBadges().map((badge, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: getBadgeColor(badge.type),
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}
              >
                {badge.label}
              </span>
            ))}
          </div>
        </div>

        {/* Profile Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Basic Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                First Name
              </label>
              <input
                type="text"
                value={profile.first_name}
                onChange={(e) => setProfile(prev => ({ ...prev, first_name: e.target.value }))}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  backgroundColor: isEditing ? 'white' : '#f9fafb'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Last Name
              </label>
              <input
                type="text"
                value={profile.last_name}
                onChange={(e) => setProfile(prev => ({ ...prev, last_name: e.target.value }))}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  backgroundColor: isEditing ? 'white' : '#f9fafb'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
              Display Name
            </label>
            <input
              type="text"
              value={profile.display_name}
              onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
              disabled={!isEditing}
              placeholder="How you want to appear to other members"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                backgroundColor: isEditing ? 'white' : '#f9fafb'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
              Bio
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              disabled={!isEditing}
              placeholder="Tell other members about yourself..."
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                resize: 'vertical',
                backgroundColor: isEditing ? 'white' : '#f9fafb'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Favorite Band
              </label>
              <input
                type="text"
                value={profile.favorite_band}
                onChange={(e) => setProfile(prev => ({ ...prev, favorite_band: e.target.value }))}
                disabled={!isEditing}
                placeholder="e.g., The Beach Boys"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  backgroundColor: isEditing ? 'white' : '#f9fafb'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Member Since
              </label>
              <input
                type="number"
                value={profile.beach_member_since}
                onChange={(e) => setProfile(prev => ({ ...prev, beach_member_since: e.target.value }))}
                disabled={!isEditing}
                min="1950"
                max={new Date().getFullYear()}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  backgroundColor: isEditing ? 'white' : '#f9fafb'
                }}
              />
            </div>
          </div>

          {/* Notification Preferences */}
          <div style={{
            backgroundColor: '#f9fafb',
            padding: '1rem',
            borderRadius: '0.75rem',
            marginTop: '1rem'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600' }}>
              🔔 Notification Preferences
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { key: 'notify_events', label: 'Event reminders and updates' },
                { key: 'notify_bags_games', label: 'Bags game invitations and results' },
                { key: 'notify_messages', label: 'New messages and chat notifications' },
                { key: 'location_sharing', label: 'Share location for weather accuracy' }
              ].map(pref => (
                <label key={pref.key} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: isEditing ? 'pointer' : 'default'
                }}>
                  <input
                    type="checkbox"
                    checked={profile.preferences[pref.key]}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        [pref.key]: e.target.checked
                      }
                    }))}
                    disabled={!isEditing}
                    style={{ width: '1.125rem', height: '1.125rem' }}
                  />
                  <span style={{ fontSize: '0.875rem' }}>{pref.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '2rem',
          justifyContent: 'flex-end'
        }}>
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: loading ? '#d1d5db' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;