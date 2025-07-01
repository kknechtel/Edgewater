import axios from 'axios';

const API_BASE_URL = '/api'; // Consistent with other services

// Helper to get auth headers; consider moving to a shared utility if used in many services
const getAuthHeaders = (token) => {
    if (!token) {
        // Try to get token from localStorage if not provided
        // This assumes a common pattern for storing the token
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser && parsedUser.access_token) {
                    token = parsedUser.access_token;
                }
            } catch (e) {
                console.error("Error parsing user from localStorage for token", e);
            }
        }
    }

    if (token) {
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }
    // If no token, return only content-type for public GET requests, or handle error
    // For RSVP actions, token is generally required.
    return {
        'Content-Type': 'application/json'
    };
};


class RSVPService {
    /**
     * RSVP to an event or update an existing RSVP.
     * @param {string} eventId - The ID of the event.
     * @param {string} status - The RSVP status ('going', 'not_going', 'interested').
     * @param {string} [token] - Optional JWT token. If not provided, tries to get from localStorage.
     * @returns {Promise<object>} - The response from the API.
     */
    async rsvpToEvent(eventId, status, token) {
        if (!eventId || !status) {
            throw new Error('Event ID and status are required to RSVP.');
        }
        const headers = getAuthHeaders(token);
        if (!headers.Authorization && token !== null) { // token can be explicitly null for unauth user if ever needed
             console.warn('No auth token found for rsvpToEvent. Trying to get from localStorage.');
             // Attempt to retrieve from localStorage one more time if not passed
             const storedUser = localStorage.getItem('user');
             if (storedUser) {
                 try {
                     const parsedUser = JSON.parse(storedUser);
                     if (parsedUser && parsedUser.access_token) {
                         headers.Authorization = `Bearer ${parsedUser.access_token}`;
                     }
                 } catch (e) {
                     // silent fail if localStorage is malformed
                 }
             }
             if (!headers.Authorization) {
                throw new Error('Authentication token is required to RSVP.');
             }
        }

        try {
            const response = await axios.post(
                `${API_BASE_URL}/events/${eventId}/rsvps`,
                { status },
                { headers }
            );
            return response.data;
        } catch (error) {
            console.error(`Error RSVPing to event ${eventId}:`, error.response?.data || error.message);
            throw error.response?.data || new Error('Failed to RSVP to event.');
        }
    }

    /**
     * Get all RSVPs for a specific event.
     * @param {string} eventId - The ID of the event.
     * @returns {Promise<Array<object>>} - A list of RSVPs for the event.
     */
    async getEventRSVPs(eventId) {
        if (!eventId) {
            throw new Error('Event ID is required to get event RSVPs.');
        }
        try {
            // This endpoint might be public or protected depending on app requirements
            const response = await axios.get(`${API_BASE_URL}/events/${eventId}/rsvps`, {
                headers: getAuthHeaders() // Assumes public or token is picked up by getAuthHeaders if needed
            });
            return response.data.rsvps || [];
        } catch (error) {
            console.error(`Error getting RSVPs for event ${eventId}:`, error.response?.data || error.message);
            throw error.response?.data || new Error('Failed to get event RSVPs.');
        }
    }

    /**
     * Get all RSVPs for a specific user.
     * @param {string} userId - The ID of the user.
     * @param {string} [token] - Optional JWT token. If not provided, tries to get from localStorage.
     * @returns {Promise<Array<object>>} - A list of RSVPs by the user.
     */
    async getUserRSVPs(userId, token) {
        if (!userId) {
            throw new Error('User ID is required to get user RSVPs.');
        }
        const headers = getAuthHeaders(token);
         if (!headers.Authorization && token !== null) {
             console.warn('No auth token found for getUserRSVPs. Trying to get from localStorage.');
             const storedUser = localStorage.getItem('user');
             if (storedUser) {
                 try {
                     const parsedUser = JSON.parse(storedUser);
                     if (parsedUser && parsedUser.access_token) {
                         headers.Authorization = `Bearer ${parsedUser.access_token}`;
                     }
                 } catch (e) {
                     // silent fail
                 }
             }
             if (!headers.Authorization) {
                throw new Error('Authentication token is required to get user RSVPs.');
            }
        }

        try {
            // Note: Backend route is /api/auth/users/<userId>/rsvps
            const response = await axios.get(`${API_BASE_URL}/auth/users/${userId}/rsvps`, { headers });
            return response.data.rsvps || [];
        } catch (error)
        {
            console.error(`Error getting RSVPs for user ${userId}:`, error.response?.data || error.message);
            throw error.response?.data || new Error('Failed to get user RSVPs.');
        }
    }
}

// Export singleton instance
export const rsvpService = new RSVPService();
export default rsvpService;