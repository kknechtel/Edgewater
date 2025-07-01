import axios from 'axios';

// Use /api since we have a proxy configured in package.json pointing to localhost:5000
const API_URL = '/api';

const login = async (email, password) => {
  console.log('Making login request to:', `${API_URL}/auth/login`);
  const response = await axios.post(`${API_URL}/auth/login`, {
    email,
    password
  });
  console.log('Login response:', response.data);
  return response.data;
};

const register = async (userData) => {
  const response = await axios.post(`${API_URL}/auth/register`, userData);
  return response.data;
};

const getCurrentUser = async (token) => {
  const response = await axios.get(`${API_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

const authService = {
  login,
  register,
  getCurrentUser
};

export default authService; 