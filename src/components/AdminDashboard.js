import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserInvitation from './UserInvitation';

const AdminDashboard = () => {
  const { isAdmin, getAllUsers, updateUserAdmin, getAdminStats } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'inactive', 'admin'
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isAdmin()) {
      loadData();
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, statsData] = await Promise.all([
        getAllUsers(),
        getAdminStats()
      ]);
      setUsers(usersData.users);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await updateUserAdmin(userId, { is_active: !currentStatus });
      await loadData(); // Reload to get updated data
    } catch (error) {
      console.error('Failed to update user status:', error);
      alert('Failed to update user status');
    }
  };

  const handleToggleAdmin = async (userId, currentAdminStatus) => {
    if (window.confirm(`Are you sure you want to ${currentAdminStatus ? 'remove' : 'grant'} admin privileges?`)) {
      try {
        await updateUserAdmin(userId, { is_admin: !currentAdminStatus });
        await loadData();
      } catch (error) {
        console.error('Failed to update admin status:', error);
        alert('Failed to update admin status');
      }
    }
  };

  const handleInviteSuccess = (message) => {
    setSuccessMessage(message);
    loadData(); // Refresh user list
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 5000);
  };

  const getFilteredUsers = () => {
    switch (filter) {
      case 'active':
        return users.filter(u => u.is_active);
      case 'inactive':
        return users.filter(u => !u.is_active);
      case 'admin':
        return users.filter(u => u.is_admin);
      default:
        return users;
    }
  };

  if (!isAdmin()) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Unauthorized</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '1.5rem',
        borderRadius: '0.75rem',
        marginBottom: '1.5rem'
      }}>
        <h1 style={{
          fontSize: '1.875rem',
          fontWeight: '700',
          marginBottom: '0.5rem'
        }}>
          🛡️ Admin Dashboard
        </h1>
        <p style={{ opacity: 0.9 }}>
          Manage users and view system statistics
        </p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <StatCard
            title="Total Users"
            value={stats.total_users}
            icon="👥"
            color="#3b82f6"
          />
          <StatCard
            title="Active Users"
            value={stats.active_users}
            icon="✅"
            color="#10b981"
          />
          <StatCard
            title="Total Events"
            value={stats.total_events}
            icon="📅"
            color="#f59e0b"
          />
          <StatCard
            title="Sasquatch Sightings"
            value={stats.total_sightings}
            icon="👁️"
            color="#8b5cf6"
          />
          <StatCard
            title="Bags Games"
            value={stats.total_bags_games}
            icon="🎯"
            color="#ec4899"
          />
          <StatCard
            title="Logged In Today"
            value={stats.users_logged_in_today}
            icon="📊"
            color="#14b8a6"
          />
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div style={{
          backgroundColor: '#d1fae5',
          color: '#065f46',
          padding: '0.75rem 1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>✅</span>
          {successMessage}
        </div>
      )}

      {/* User Management */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Filter Bar */}
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '1rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
            User Management
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => setShowInviteModal(true)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem'
              }}
            >
              <span>👥</span>
              Invite User
            </button>
            {['all', 'active', 'inactive', 'admin'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '0.375rem 0.75rem',
                  backgroundColor: filter === f ? '#3b82f6' : 'white',
                  color: filter === f ? 'white' : '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* User List */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                  User
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                  Email
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600' }}>
                  Status
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600' }}>
                  Role
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600' }}>
                  Stats
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600' }}>
                  Last Login
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {getFilteredUsers().map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.display_name}
                          style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          borderRadius: '50%',
                          backgroundColor: '#e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: '#6b7280'
                        }}>
                          {user.display_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: '500' }}>{user.display_name}</div>
                        {user.beach_member_since && (
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            Member since {new Date(user.beach_member_since).getFullYear()}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                    {user.email}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: user.is_active ? '#d1fae5' : '#fee2e2',
                      color: user.is_active ? '#065f46' : '#991b1b',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    {user.is_admin && (
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        Admin
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                      <span>🎯 {user.bags_wins}W - {user.bags_losses}L</span>
                      <span>📅 {user.events_created} events</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
                    {user.last_login ? 
                      new Date(user.last_login).toLocaleDateString() : 
                      'Never'
                    }
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button
                        onClick={() => setSelectedUser(user)}
                        style={{
                          padding: '0.375rem 0.75rem',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                        style={{
                          padding: '0.375rem 0.75rem',
                          backgroundColor: user.is_active ? '#ef4444' : '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      {!user.is_admin && (
                        <button
                          onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                          style={{
                            padding: '0.375rem 0.75rem',
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          Make Admin
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {/* User Invitation Modal */}
      {showInviteModal && (
        <UserInvitation
          onClose={() => setShowInviteModal(false)}
          onSuccess={handleInviteSuccess}
        />
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderLeft: `4px solid ${color}`
  }}>
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '0.5rem'
    }}>
      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{title}</span>
      <span style={{ fontSize: '1.5rem' }}>{icon}</span>
    </div>
    <div style={{
      fontSize: '2rem',
      fontWeight: '700',
      color: color
    }}>
      {value.toLocaleString()}
    </div>
  </div>
);

// User Detail Modal
const UserDetailModal = ({ user, onClose }) => (
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
    zIndex: 50
  }}>
    <div style={{
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      padding: '2rem',
      maxWidth: '600px',
      width: '90%',
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>
          User Details
        </h2>
        <button
          onClick={onClose}
          style={{
            padding: '0.5rem',
            backgroundColor: '#f3f4f6',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '1.25rem',
            lineHeight: '1'
          }}
        >
          ×
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Profile Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.display_name}
              style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              width: '4rem',
              height: '4rem',
              borderRadius: '50%',
              backgroundColor: '#e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#6b7280'
            }}>
              {user.display_name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>
              {user.display_name}
            </h3>
            <p style={{ color: '#6b7280' }}>{user.email}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem'
        }}>
          <InfoItem label="User ID" value={user.id} />
          <InfoItem label="Status" value={user.is_active ? 'Active' : 'Inactive'} />
          <InfoItem label="Role" value={user.is_admin ? 'Admin' : 'Member'} />
          <InfoItem label="Member Since" value={user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'} />
          <InfoItem label="Last Login" value={user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'} />
          <InfoItem label="Beach Member Since" value={user.beach_member_since ? new Date(user.beach_member_since).getFullYear() : 'N/A'} />
        </div>

        {/* Stats Section */}
        <div>
          <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>
            Activity Stats
          </h4>
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            padding: '1rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.75rem'
          }}>
            <div>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Bags Record</span>
              <p style={{ fontWeight: '600' }}>
                {user.bags_wins}W - {user.bags_losses}L ({user.bags_win_rate}%)
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Tournament Wins</span>
              <p style={{ fontWeight: '600' }}>{user.bags_tournament_wins}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Events Created</span>
              <p style={{ fontWeight: '600' }}>{user.events_created}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Sasquatch Sightings</span>
              <p style={{ fontWeight: '600' }}>{user.sasquatch_sightings}</p>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        {user.bio && (
          <div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Bio
            </h4>
            <p style={{ color: '#374151', lineHeight: '1.5' }}>{user.bio}</p>
          </div>
        )}

        {/* Favorite Band */}
        {user.favorite_band && (
          <div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Favorite Band
            </h4>
            <p style={{ color: '#374151' }}>{user.favorite_band}</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

// Info Item Component
const InfoItem = ({ label, value }) => (
  <div>
    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{label}</span>
    <p style={{ fontWeight: '500' }}>{value}</p>
  </div>
);

export default AdminDashboard;