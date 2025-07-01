import React, { useState, useEffect } from 'react';
import eventService from '../../services/eventService';
import { useAuth } from '../../contexts/AuthContext';

const AddEventModal = ({ isOpen, onClose, onSave, eventToEdit }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [error, setError] = useState(null);
    const { token } = useAuth();

    useEffect(() => {
        if (eventToEdit) {
            setTitle(eventToEdit.title);
            setDescription(eventToEdit.description || '');
            setStartTime(eventToEdit.start_time ? new Date(eventToEdit.start_time).toISOString().slice(0, 16) : '');
            setEndTime(eventToEdit.end_time ? new Date(eventToEdit.end_time).toISOString().slice(0, 16) : '');
        } else {
            setTitle('');
            setDescription('');
            setStartTime('');
            setEndTime('');
        }
    }, [eventToEdit, isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!title || !startTime) {
            setError('Title and Start Time are required.');
            return;
        }

        const eventData = {
            title,
            description,
            start_time: new Date(startTime).toISOString(),
            end_time: endTime ? new Date(endTime).toISOString() : null
        };

        try {
            if (eventToEdit) {
                await eventService.updateEvent(eventToEdit.id, eventData, token);
            } else {
                await eventService.createEvent(eventData, token);
            }
            onSave();
            onClose();
        } catch (err) {
            setError('Failed to save the event. Please try again.');
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">{eventToEdit ? 'Edit Event' : 'Add New Event'}</h2>
                {error && <p className="text-red-500 bg-red-100 p-2 rounded mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-gray-700 font-semibold mb-2">Title</label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="start_time" className="block text-gray-700 font-semibold mb-2">Start Time</label>
                        <input
                            id="start_time"
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="end_time" className="block text-gray-700 font-semibold mb-2">End Time (Optional)</label>
                        <input
                            id="end_time"
                            type="datetime-local"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
                            Cancel
                        </button>
                        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEventModal;