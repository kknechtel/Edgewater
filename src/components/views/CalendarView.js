import React, { useState, useEffect } from 'react';
import eventService from '../../services/eventService';
import AddEventModal from '../modals/AddEventModal';
import { useAuth } from '../../contexts/AuthContext';

const CalendarView = () => {
    const [events, setEvents] = useState([]);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [eventToEdit, setEventToEdit] = useState(null);
    const { user, token } = useAuth();

    const fetchEvents = async () => {
        try {
            const response = await eventService.getEvents();
            // Handle axios response structure
            const apiEvents = Array.isArray(response.data) ? response.data : (response.data?.events || response.data?.data || []);
            
            // Load music band events from localStorage
            const savedBands = localStorage.getItem('beach_bands');
            const bandEvents = savedBands ? JSON.parse(savedBands).map(band => ({
                id: `band-${band.id}`,
                title: `${band.name} Live`,
                description: `${band.genre} band performing at the beach`,
                event_date: band.date,
                event_time: band.time,
                location: 'Beach Stage',
                event_type: 'concert',
                created_by: { email: band.addedBy || 'system' }
            })) : [];
            
            // Load bags tournament events from localStorage
            const savedTournaments = localStorage.getItem('bags_tournaments');
            const tournamentEvents = savedTournaments ? JSON.parse(savedTournaments)
                .filter(t => t.date)
                .map(tournament => ({
                    id: `tournament-${tournament.id}`,
                    title: tournament.name,
                    description: `${tournament.type}-player Bags Tournament`,
                    event_date: tournament.date,
                    event_time: tournament.time || '12:00 PM',
                    location: 'Bags Court',
                    event_type: 'tournament',
                    created_by: { email: tournament.createdBy || 'system' }
                })) : [];
            
            // Combine all events
            const allEvents = [...apiEvents, ...bandEvents, ...tournamentEvents];
            setEvents(allEvents);
        } catch (err) {
            setError('Failed to fetch events. Please try again later.');
            console.error(err);
            setEvents([]); // Set empty array on error
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleOpenModal = (event = null) => {
        setEventToEdit(event);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEventToEdit(null);
    };

    const handleSave = () => {
        fetchEvents(); // Refetch events to show the new/updated one
    };

    const handleDelete = async (eventId) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await eventService.deleteEvent(eventId, token);
                fetchEvents(); // Refresh the list
            } catch (err) {
                setError('Failed to delete event.');
                console.error(err);
            }
        }
    };
    
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Upcoming Events</h1>
                {user && (
                    <button onClick={() => handleOpenModal()} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Add Event
                    </button>
                )}
            </div>
            
            {error && <p className="text-red-500 bg-red-100 p-2 rounded mb-4">{error}</p>}
            
            <div className="space-y-4">
                {events.length > 0 ? (
                    events.map(event => (
                        <div key={event.id} className="bg-white p-4 rounded-lg shadow">
                            <h2 className="text-xl font-semibold">{event.title}</h2>
                            <p className="text-gray-600">{event.description}</p>
                            <div className="text-sm text-gray-500 mt-2">
                                <p><strong>Starts:</strong> {formatDate(event.start_time)}</p>
                                {event.end_time && <p><strong>Ends:</strong> {formatDate(event.end_time)}</p>}
                                <p><strong>Posted by:</strong> {event.creator}</p>
                            </div>
                            {user && user.username === event.creator && (
                                <div className="flex justify-end space-x-2 mt-4">
                                    <button onClick={() => handleOpenModal(event)} className="text-sm bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-1 px-3 rounded">
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(event.id)} className="text-sm bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded">
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No events scheduled at this time.</p>
                )}
            </div>

            <AddEventModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                eventToEdit={eventToEdit}
            />
        </div>
    );
};

export default CalendarView; 