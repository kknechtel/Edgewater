import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { eventService } from '../services/api';

const CalendarView = ({ eventModalData, setEventModalData }) => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'list'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEventsByDate();
  }, [events, selectedDate, viewMode]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      
      // Load events from backend API
      const apiEvents = await eventService.getAllEvents();
      
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
        created_by: { email: band.addedBy || 'system' },
        source: 'music'
      })) : [];
      
      // Load bags tournament events from localStorage
      const savedTournaments = localStorage.getItem('bags_tournaments');
      const tournamentEvents = savedTournaments ? JSON.parse(savedTournaments)
        .filter(t => t.date) // Only include tournaments with dates
        .map(tournament => ({
          id: `tournament-${tournament.id}`,
          title: tournament.name,
          description: `${tournament.type}-player Bags Tournament`,
          event_date: tournament.date,
          event_time: tournament.time || '12:00 PM',
          location: 'Bags Court',
          event_type: 'tournament',
          created_by: { email: tournament.createdBy || 'system' },
          source: 'bags'
        })) : [];
      
      // Combine all events
      const allEvents = [...apiEvents, ...bandEvents, ...tournamentEvents];
      setEvents(allEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEventsByDate = () => {
    if (viewMode === 'list') {
      // Show upcoming events for list view
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const filtered = events
        .filter(event => new Date(event.event_date) >= today)
        .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
      setFilteredEvents(filtered);
    } else {
      // Filter by selected month for calendar view
      const filtered = events.filter(event => {
        const eventDate = new Date(event.event_date);
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
      const eventDate = new Date(event.event_date);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
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
                    isOwner={user?.id === event.creator_id}
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
const EventCard = ({ event, expanded, onToggle, onEdit, onDelete, isOwner }) => {
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
    <div style={{
      backgroundColor: '#f9fafb',
      borderRadius: '0.5rem',
      padding: '0.75rem',
      marginBottom: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      border: '1px solid #e5e7eb'
    }}
    onClick={onToggle}>
      {/* Event Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{
          backgroundColor: getEventTypeColor(event.event_type),
          color: 'white',
          width: '3rem',
          height: '3rem',
          borderRadius: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          flexShrink: 0
        }}>
          {getEventIcon(event.event_type)}
        </div>
        
        <div style={{ flex: 1 }}>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: '600',
            margin: '0 0 0.25rem 0',
            color: '#111827'
          }}>
            {event.title}
          </h4>
          
          {/* Inline Preview */}
          <div style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <span>⏰ {new Date(event.event_date).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit'
            })}</span>
            <span>📍 {event.location || 'Beach Club'}</span>
            {event.attendees && event.attendees.length > 0 && (
              <span>👥 {event.attendees.length} going</span>
            )}
          </div>
          
          {/* Expanded Details */}
          {expanded && (
            <div style={{
              marginTop: '0.75rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid #e5e7eb'
            }}>
              {event.description && (
                <p style={{
                  fontSize: '0.875rem',
                  color: '#374151',
                  marginBottom: '0.5rem',
                  lineHeight: '1.5'
                }}>
                  {event.description}
                </p>
              )}
              
              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginTop: '0.75rem'
              }}>
                {isOwner && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                      }}
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
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                      style={{
                        padding: '0.375rem 0.75rem',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </>
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