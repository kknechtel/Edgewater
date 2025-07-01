import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuth = () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (savedToken && savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setToken(savedToken);
          console.log('User restored from localStorage:', userData);
        } catch (error) {
          console.error('Failed to restore user from localStorage:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Starting login...');
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (response.ok && data.access_token) {
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
        setUser(data.user);
        console.log('Login successful, user set:', data.user);
        console.log('AuthContext user state should now be:', data.user);
        return { success: true };
      } else {
        console.log('Login failed:', data);
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const googleSignIn = async (googleData) => {
    try {
      // Frontend-only Google authentication
      const { token } = googleData;
      
      // Decode the JWT token to get user info
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      const user = {
        id: payload.sub,
        email: payload.email,
        first_name: payload.given_name,
        last_name: payload.family_name,
        display_name: payload.name,
        avatar_url: payload.picture,
        is_admin: true, // Make all Google users admin for now
        is_active: true
      };

      // Store in localStorage for persistence
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setToken(token);
      setUser(user);
      
      console.log('User signed in:', user);
      return { success: true };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    console.log('User logged out');
  };

  // Admin functions for user management
  const getAllUsers = async () => {
    // Frontend-only: get users from localStorage
    const users = JSON.parse(localStorage.getItem('allUsers') || '[]');
    
    // If no users exist, create entry for current user
    if (users.length === 0 && user) {
      const currentUserEntry = {
        ...user,
        is_admin: true, // Make current user admin
        is_active: true,
        created_at: new Date().toISOString()
      };
      users.push(currentUserEntry);
      localStorage.setItem('allUsers', JSON.stringify(users));
    }
    
    return { users };
  };

  const updateUserAdmin = async (userId, updates) => {
    // Frontend-only: update users in localStorage
    const users = JSON.parse(localStorage.getItem('allUsers') || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      localStorage.setItem('allUsers', JSON.stringify(users));
    }
    return { success: true };
  };

  const getAdminStats = async () => {
    // Frontend-only: calculate stats from localStorage
    const users = JSON.parse(localStorage.getItem('allUsers') || '[]');
    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.is_active).length,
      adminUsers: users.filter(u => u.is_admin).length,
      eventsCreated: 15,
      gamesPlayed: 42
    };
  };

  const inviteUser = async (invitationData) => {
    // Frontend-only: simulate user invitation
    const users = JSON.parse(localStorage.getItem('allUsers') || '[]');
    
    // Check if user already exists
    if (users.some(u => u.email === invitationData.email)) {
      return { success: false, error: 'User with this email already exists' };
    }
    
    const newUser = {
      id: Date.now().toString(),
      email: invitationData.email,
      first_name: invitationData.firstName,
      last_name: invitationData.lastName,
      display_name: invitationData.displayName,
      is_admin: invitationData.isAdmin || false,
      is_active: true,
      created_at: new Date().toISOString(),
      tempPassword: Math.random().toString(36).slice(-8) // Generate random temp password
    };
    
    users.push(newUser);
    localStorage.setItem('allUsers', JSON.stringify(users));
    
    return { 
      success: true, 
      data: {
        message: 'User invited successfully',
        tempPassword: newUser.tempPassword,
        user: newUser
      }
    };
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };

  const isAdmin = () => {
    return user?.is_admin === true;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    googleSignIn,
    logout,
    getAllUsers,
    updateUserAdmin,
    getAdminStats,
    inviteUser,
    updateUser,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};