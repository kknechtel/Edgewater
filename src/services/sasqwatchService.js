const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const sasqwatchService = {
  // Get all sightings
  getAllSightings: async () => {
    try {
      const response = await fetch(`${API_URL}/sasqwatch`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch sightings');
      return await response.json();
    } catch (error) {
      console.error('Error fetching sightings:', error);
      throw error;
    }
  },

  // Get a single sighting
  getSighting: async (id) => {
    try {
      const response = await fetch(`${API_URL}/sasqwatch/${id}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch sighting');
      return await response.json();
    } catch (error) {
      console.error('Error fetching sighting:', error);
      throw error;
    }
  },

  // Create a new sighting
  createSighting: async (sightingData) => {
    try {
      const response = await fetch(`${API_URL}/sasqwatch`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(sightingData)
      });
      if (!response.ok) throw new Error('Failed to create sighting');
      return await response.json();
    } catch (error) {
      console.error('Error creating sighting:', error);
      throw error;
    }
  },

  // Update a sighting
  updateSighting: async (id, sightingData) => {
    try {
      const response = await fetch(`${API_URL}/sasqwatch/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(sightingData)
      });
      if (!response.ok) throw new Error('Failed to update sighting');
      return await response.json();
    } catch (error) {
      console.error('Error updating sighting:', error);
      throw error;
    }
  },

  // Delete a sighting
  deleteSighting: async (id) => {
    try {
      const response = await fetch(`${API_URL}/sasqwatch/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to delete sighting');
      return await response.json();
    } catch (error) {
      console.error('Error deleting sighting:', error);
      throw error;
    }
  },

  // Update credibility rating
  updateCredibility: async (id, rating) => {
    try {
      const response = await fetch(`${API_URL}/sasqwatch/${id}/credibility`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ rating })
      });
      if (!response.ok) throw new Error('Failed to update credibility');
      return await response.json();
    } catch (error) {
      console.error('Error updating credibility:', error);
      throw error;
    }
  }
};

export default sasqwatchService;