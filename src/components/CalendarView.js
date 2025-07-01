import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { eventService } from '../services/api'; // This likely exports all services
import { rsvpService } from '../services/rsvpService'; // Import new rsvpService

const CalendarView = ({ eventModalData, setEventModalData }) => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'list'
  // const [showCreateModal, setShowCreateModal] = useState(false); // This seems unused if eventModalData is prop
  const [expandedEvent, setExpandedEvent] = useState(null);
  const { user, token } = useAuth(); // Assuming token is available from useAuth context
  const [userRsvps, setUserRsvps] = useState(new Map()); // To store user's RSVP status for each event: eventId -> status

  useEffect(() => {
    loadEvents();
    if (user && token) { // Load user-specific RSVPs if logged in
      loadUserRsvps();
    } else {
      setUserRsvps(new Map()); // Clear user RSVPs if logged out
    }
  }, [user, token]); // Reload events and user RSVPs if user or token changes

  useEffect(() => {
    filterEventsByDate();
  }, [events, selectedDate, viewMode]);

  const loadUserRsvps = async () => {
    if (!user || !token) return;
    try {
      const rsvpsFromApi = await rsvpService.getUserRSVPs(user.id, token);
      const rsvpMap = new Map();
      rsvpsFromApi.forEach(rsvp => rsvpMap.set(rsvp.event_id, rsvp.status));
      setUserRsvps(rsvpMap);
    } catch (error) {
      console.error("Error loading user's RSVPs:", error);
      // Potentially set an error state or notify user
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      // Assuming eventService.getEvents() is the correct method name from services/api.js
      // and it fetches from /api/events which returns { events: [...] }
      const response = await eventService.getEvents();
      
      // Backend now returns 'date', 'event_type', and 'rsvp_count' directly.
      // No need to map 'event_date' or manually add 'rsvp_count'.
      // Ensure 'event_type' is consistently provided by backend or default here if necessary.
      const fetchedEvents = response.data.events.map(event => ({
        ...event,
        event_type: event.event_type || 'other', // Default if backend doesn't send it
      }));
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([]); // Set to empty array on error to prevent issues
    } finally {
      setLoading(false);
    }
  };

  const filterEventsByDate = () => {
    if (viewMode === 'list') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const filtered = events
        .filter(event => new Date(event.date) >= today) // Use event.date
        .sort((a, b) => new Date(a.date) - new Date(b.date)); // Use event.date
      setFilteredEvents(filtered);
    } else {
      const filtered = events.filter(event => {
        const eventDate = new Date(event.date); // Use event.date
        return eventDate.getMonth() === selectedDate.getMonth() &&
               eventDate.getFullYear() === selectedDate.getFullYear();
      });
      setFilteredEvents(filtered);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.date); // Use event.date
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  const handleRsvpAction = async (eventId, status) => {
    if (!user || !token) {
      alert('Please log in to RSVP.'); // Or trigger login modal
      return;
    }
    try {
      await rsvpService.rsvpToEvent(eventId, status, token);
      // Update local RSVP state for immediate feedback
      setUserRsvps(prev => new Map(prev).set(eventId, status));
      // Reload events to get updated rsvp_count from backend
      // Or, more efficiently, update the specific event in the 'events' state
      setEvents(prevEvents => prevEvents.map(event => {
        if (event.id === eventId) {
          // Adjust count based on new status vs old status
          // This is a simplified increment/decrement; actual logic might be more complex
          // if counting only "going" status. The backend `rsvp_count` is the source of truth.
          // For now, reloading events is safer to get accurate counts.
          const oldStatus = userRsvps.get(eventId);
          let newRsvpCount = event.rsvp_count;
          if (status === 'going' && oldStatus !== 'going') newRsvpCount++;
          else if (status !== 'going' && oldStatus === 'going') newRsvpCount--;
          return { ...event, rsvp_count: newRsvpCount };
        }
        return event;
      }));
      // Consider a full reload if counts become complex to manage locally:
      await loadEvents();
      await loadUserRsvps(); // Refresh user's specific RSVP status

    } catch (error) {
      console.error('RSVP failed:', error);
      alert(`RSVP failed: ${error.message || 'Please try again.'}`);
    }
  };

  const getEventTypeColor = (type) => {
    const colors = {
      party: '#fbbf24',
      concert: '#a78bfa',
      gathering: '#34d399',
      dinner: '#f472b6',
      tournament: '#60a5fa',
      other: '#94a3b8'
    };
    return colors[type] || colors.other;
  };

  const getEventIcon = (type) => {
    const icons = {
      party: '🎉',
      concert: '🎸',
      gathering: '🏖️',
      dinner: '🍽️',
      tournament: '🎯',
      other: '📅'
    };
    return icons[type] || icons.other;
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatDateHeader = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleEventClick = (event) => {
    if (expandedEvent === event.id) {
      setExpandedEvent(null);
    } else {
      setExpandedEvent(event.id);
    }
  };

  const handleEditEvent = (event) => {
    setEventModalData({
      isOpen: true,
      mode: 'edit',
      event: event
    });
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventService.deleteEvent(eventId);
        await loadEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event');
      }
    }
  };

  const handleCreateEvent = () => {
    setEventModalData({
      isOpen: true,
      mode: 'create',
      event: null
    });
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        {/* Calendar Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: '#e5e7eb' }}>
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={{
              padding: '0.5rem',
              textAlign: 'center',
              fontWeight: '600',
              fontSize: '0.875rem',
              backgroundColor: '#f3f4f6'
            }}>
              {day}
            </div>
          ))}
          
          {/* Calendar Days */}
          {days.map((date, index) => {
            const dayEvents = date ? getEventsForDate(date) : [];
            const isToday = date && date.toDateString() === today.toDateString();
            const isSelected = date && date.toDateString() === selectedDate.toDateString();
            
            return (
              <div key={index} style={{
                minHeight: '100px',
                backgroundColor: date ? 'white' : '#f9fafb',
                padding: '0.5rem',
                position: 'relative',
                cursor: date ? 'pointer' : 'default',
                border: isToday ? '2px solid #3b82f6' : 'none'
              }}
              onClick={() => date && setSelectedDate(date)}>
                {date && (
                  <>
                    <div style={{
                      fontWeight: isToday ? '700' : '400',
                      fontSize: '0.875rem',
                      color: isToday ? '#3b82f6' : '#374151',
                      marginBottom: '0.25rem'
                    }}>
                      {date.getDate()}
                    </div>
                    
                    {/* Event Pills */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {dayEvents.slice(0, 3).map((event, idx) => (
                        <div key={event.id} style={{
                          backgroundColor: getEventTypeColor(event.event_type),
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.625rem',
                          fontWeight: '500',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}>
                          <span>{getEventIcon(event.event_type)}</span>
                          <span>{event.title}</span>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div style={{
                          fontSize: '0.625rem',
                          color: '#6b7280',
                          textAlign: 'center'
                        }}>
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Selected Date Events */}
        {selectedDate && (
          <div style={{ padding: '1rem', borderTop: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Events on {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </h3>
            {getEventsForDate(selectedDate).length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>No events scheduled</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {getEventsForDate(selectedDate).map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    expanded={expandedEvent === event.id}
                    onToggle={() => handleEventClick(event)}
                    onEdit={() => handleEditEvent(event)}
                    onDelete={() => handleDeleteEvent(event.id)}
                    isOwner={user?.id === event.created_by_id} // Corrected: created_by_id from backend
                    onRsvpAction={handleRsvpAction}
                    currentUserRsvpStatus={userRsvps.get(event.id) || 'none'}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderListView = () => {
    const eventsByDate = {};
    filteredEvents.forEach(event => {
      const dateKey = new Date(event.event_date).toDateString();
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = [];
      }
      eventsByDate[dateKey].push(event);
    });

    return (
      <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        {Object.keys(eventsByDate).length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
            <p>No upcoming events</p>
          </div>
        ) : (
          Object.entries(eventsByDate).map(([dateKey, dateEvents]) => (
            <div key={dateKey} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <div style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#f9fafb',
                fontWeight: '600',
                fontSize: '0.875rem',
                color: '#374151'
              }}>
                {formatDateHeader(new Date(dateKey))}
              </div>
              <div style={{ padding: '0.5rem' }}>
                {dateEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    expanded={expandedEvent === event.id}
                    onToggle={() => handleEventClick(event)}
                    onEdit={() => handleEditEvent(event)}
                    onDelete={() => handleDeleteEvent(event.id)}
                    isOwner={user?.id === event.creator_id}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
          📅 Beach Events
        </h1>
        <button
          onClick={handleCreateEvent}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>+</span> New Event
        </button>
      </div>

      {/* View Toggle & Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        {/* View Mode Toggle */}
        <div style={{
          display: 'flex',
          backgroundColor: '#f3f4f6',
          borderRadius: '0.5rem',
          padding: '0.125rem'
        }}>
          <button
            onClick={() => setViewMode('month')}
            style={{
              padding: '0.375rem 0.75rem',
              fontSize: '0.875rem',
              border: 'none',
              borderRadius: '0.375rem',
              backgroundColor: viewMode === 'month' ? 'white' : 'transparent',
              color: viewMode === 'month' ? '#374151' : '#6b7280',
              fontWeight: '500',
              cursor: 'pointer',
              boxShadow: viewMode === 'month' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            📅 Month
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '0.375rem 0.75rem',
              fontSize: '0.875rem',
              border: 'none',
              borderRadius: '0.375rem',
              backgroundColor: viewMode === 'list' ? 'white' : 'transparent',
              color: viewMode === 'list' ? '#374151' : '#6b7280',
              fontWeight: '500',
              cursor: 'pointer',
              boxShadow: viewMode === 'list' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            📋 List
          </button>
        </div>

        {/* Month Navigation (only for month view) */}
        {viewMode === 'month' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handlePrevMonth}
              style={{
                padding: '0.375rem 0.5rem',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '1.25rem',
                lineHeight: '1'
              }}
            >
              ‹
            </button>
            <button
              onClick={handleToday}
              style={{
                padding: '0.375rem 0.75rem',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Today
            </button>
            <span style={{
              fontSize: '1rem',
              fontWeight: '600',
              minWidth: '150px',
              textAlign: 'center'
            }}>
              {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={handleNextMonth}
              style={{
                padding: '0.375rem 0.5rem',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '1.25rem',
                lineHeight: '1'
              }}
            >
              ›
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
          Loading events...
        </div>
      ) : (
        viewMode === 'month' ? renderMonthView() : renderListView()
      )}
    </div>
  );
};

// Event Card Component with Inline Preview
const EventCard = ({ event, expanded, onToggle, onEdit, onDelete, isOwner, onRsvpAction, currentUserRsvpStatus }) => {
  const { user } = useAuth(); // Get user to check if logged in for RSVP buttons

  const handleRsvpClick = (e, status) => {
    e.stopPropagation(); // Prevent card toggle when clicking RSVP button
    if (!event || !event.id) {
      console.error("Event or event ID is missing for RSVP action");
      return;
    }
    onRsvpAction(event.id, status);
  };

  const rsvpButtonBaseClasses = "py-1 px-2 text-xs font-medium rounded border cursor-pointer mr-1";
  const rsvpButtonActiveClass = "bg-blue-500 text-white border-blue-500";
  const rsvpButtonInactiveClass = "bg-white text-gray-700 border-gray-300 hover:bg-gray-100";

  const getRsvpButtonStyle = (status) => {
    return `${rsvpButtonBaseClasses} ${currentUserRsvpStatus === status ? rsvpButtonActiveClass : rsvpButtonInactiveClass}`;
  };

  const getEventTypeColor = (type) => {
    const colors = {
      party: '#fbbf24',
      concert: '#a78bfa',
      gathering: '#34d399',
      dinner: '#f472b6',
      tournament: '#60a5fa',
      other: '#94a3b8'
    };
    return colors[type] || colors.other;
  };

  const getEventIcon = (type) => {
    const icons = {
      party: '🎉',
      concert: '🎸',
      gathering: '🏖️',
      dinner: '🍽️',
      tournament: '🎯',
      other: '📅'
    };
    return icons[type] || icons.other;
  };

  return (
    <div
      className="bg-gray-50 rounded-lg p-3 mb-2 cursor-pointer transition-all duration-200 border border-gray-200 hover:shadow-md"
      onClick={onToggle}
    >
      {/* Event Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0 text-white"
          style={{ backgroundColor: getEventTypeColor(event.event_type) }} // Keep dynamic background color for event type
        >
          {getEventIcon(event.event_type)}
        </div>
        
        <div className="flex-1">
          <h4 className="text-base font-semibold mb-1 text-gray-900">
            {event.title}
          </h4>
          
          {/* Inline Preview */}
          <div className="text-sm text-gray-600 flex items-center gap-4 flex-wrap">
            <span>⏰ {new Date(event.date).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit'
            })}</span>
            <span>📍 {event.location || 'Beach Club'}</span>
            <span>👥 {event.rsvp_count || 0} going</span>
          </div>
          
          {/* Expanded Details */}
          {expanded && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              {event.description && (
                <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                  {event.description}
                </p>
              )}
              
              {/* Action Buttons - Edit/Delete and RSVP */}
              <div className="flex justify-between items-center gap-2 mt-3 flex-wrap">
                {/* RSVP Actions */}
                {user && (
                  <div className="flex gap-1">
                    <button className={getRsvpButtonStyle('going')} onClick={(e) => handleRsvpClick(e, 'going')}>
                      Going
                    </button>
                    <button className={getRsvpButtonStyle('interested')} onClick={(e) => handleRsvpClick(e, 'interested')}>
                      Interested
                    </button>
                    <button className={getRsvpButtonStyle('not_going')} onClick={(e) => handleRsvpClick(e, 'not_going')}>
                      Can't Go
                    </button>
                  </div>
                )}

                {/* Edit/Delete Actions */}
                {isOwner && (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                      }}
                      className="py-1 px-3 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                      className="py-1 px-3 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;