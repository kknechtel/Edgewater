import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Authentication
  async register(userData) {
    try {
      const response = await api.post('/api/auth/register', userData);
      return {
        token: response.data.access_token,
        user: response.data.user
      };
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  },

  async login(email, password) {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      return {
        token: response.data.access_token,
        user: response.data.user
      };
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  },

  async googleLogin(token) {
    try {
      const response = await api.post('/api/auth/google', { token });
      return {
        token: response.data.access_token,
        user: response.data.user
      };
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Google login failed');
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/api/auth/me');
      return response.data.user;
    } catch (error) {
      console.error('Get current user failed:', error);
      return null;
    }
  },

  // Profile Management
  async updateProfile(profileData) {
    try {
      const response = await api.put('/api/auth/profile', profileData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Profile update failed');
    }
  },

  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.post('/api/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Password change failed');
    }
  },

  // Admin Functions
  async getAllUsers() {
    try {
      const response = await api.get('/api/auth/admin/users');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch users');
    }
  },

  async updateUserAdmin(userId, updates) {
    try {
      const response = await api.put(`/api/auth/admin/users/${userId}`, updates);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update user');
    }
  },

  async getAdminStats() {
    try {
      const response = await api.get('/api/auth/admin/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch stats');
    }
  }
};

// Event Service
export const eventService = {
  async getEvents() {
    try {
      const response = await api.get('/api/events');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch events');
    }
  },

  async getAllEvents() {
    return this.getEvents(); // Alias for consistency
  },

  async createEvent(eventData) {
    try {
      const response = await api.post('/api/events', eventData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create event');
    }
  },

  async updateEvent(eventId, eventData) {
    try {
      const response = await api.put(`/api/events/${eventId}`, eventData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update event');
    }
  },

  async deleteEvent(eventId) {
    try {
      const response = await api.delete(`/api/events/${eventId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete event');
    }
  }
};

// Bags Service
export const bagsService = {
  // Games
  async getGames(params = {}) {
    try {
      const response = await api.get('/api/bags/games', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch games');
    }
  },

  async createGame(gameData) {
    try {
      const response = await api.post('/api/bags/games', gameData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create game');
    }
  },

  async getGame(gameId) {
    try {
      const response = await api.get(`/api/bags/games/${gameId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch game');
    }
  },

  // Tournaments
  async getTournaments(params = {}) {
    try {
      const response = await api.get('/api/bags/tournaments', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch tournaments');
    }
  },

  async createTournament(tournamentData) {
    try {
      const response = await api.post('/api/bags/tournaments', tournamentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create tournament');
    }
  },

  async updateTournament(tournamentId, updates) {
    try {
      const response = await api.put(`/api/bags/tournaments/${tournamentId}`, updates);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update tournament');
    }
  },

  // Stats
  async getLeaderboard() {
    try {
      const response = await api.get('/api/bags/stats/leaderboard');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch leaderboard');
    }
  },

  async getPlayerStats(playerId) {
    try {
      const response = await api.get(`/api/bags/stats/player/${playerId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch player stats');
    }
  },

  // Waitlist
  async getWaitlist() {
    try {
      const response = await api.get('/api/bags/waitlist');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch waitlist');
    }
  },

  async joinWaitlist(playerName) {
    try {
      const response = await api.post('/api/bags/waitlist', { name: playerName });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to join waitlist');
    }
  }
};