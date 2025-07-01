import axios from 'axios';

const API_URL = '/api';

const getAuthHeaders = (token) => {
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

const getEvents = () => {
    return axios.get(`${API_URL}/events`);
};

const createEvent = (eventData, token) => {
    return axios.post(`${API_URL}/events`, eventData, {
        headers: getAuthHeaders(token)
    });
};

const updateEvent = (id, eventData, token) => {
    return axios.put(`${API_URL}/events/${id}`, eventData, {
        headers: getAuthHeaders(token)
    });
};

const deleteEvent = (id, token) => {
    return axios.delete(`${API_URL}/events/${id}`, {
        headers: getAuthHeaders(token)
    });
};

const eventService = {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent
};

export default eventService; 