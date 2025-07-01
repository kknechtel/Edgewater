import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { eventService } from '../services/api';
import { bandGuideData } from '../data/bandGuideData';
import { rsvpService } from '../services/rsvpService';
import { notificationService } from '../services/notificationService';
import { commentsService } from '../services/commentsService';

const EnhancedCalendarView = ({ eventModalData, setEventModalData }) => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [showBandDetails, setShowBandDetails] = useState(null);
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const { user } = useAuth();
  const { isDarkMode } = useTheme();

  // Tournament form state
  const [tournamentForm, setTournamentForm] = useState({
    name: '',
    date: '',
    time: '2:00 PM',
    type: 4,
    description: ''
  });

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEventsByDate();
  }, [events, selectedDate, viewMode]);

  const parseBandDates = (dateString) => {
    const currentYear = new Date().getFullYear();
    const dates = dateString.split(',').map(d => d.trim());
    return dates.map(dateStr => {
      // Parse "June 21" or "July 17" or "September 6" format
      const parts = dateStr.split(' ');
      if (parts.length >= 2) {
        const month = parts[0];
        const day = parts[1];
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const monthIndex = monthNames.indexOf(month);
        if (monthIndex !== -1 && day) {
          const parsedDate = new Date(currentYear, monthIndex, parseInt(day));
          return parsedDate;
        }
      }
      return null;
    }).filter(date => date !== null);
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      
      // Load events from backend API  
      let apiEvents = [];
      try {
        const response = await eventService.getAllEvents();
        apiEvents = Array.isArray(response) ? response : (response.events || response.data || []);
      } catch (error) {
        console.log('API events failed, using empty array:', error);
        apiEvents = [];
      }
      
      // Load band events from bandGuideData
      const bandEvents = [];
      bandGuideData.categories.forEach(category => {
        category.bands.forEach(band => {
          if (band.date) {
            const dates = parseBandDates(band.date);
            const times = band.time ? band.time.split('/').map(t => t.trim()) : ['6:00 PM'];
            
            dates.forEach((date, index) => {
              if (date) {
                const bandEvent = {
                  id: `band-${band.name}-${date.getTime()}`,
                  title: band.name,
                  description: band.description,
                  event_date: date.toISOString().split('T')[0],
                  event_time: times[index] || times[0],
                  location: 'Beach Stage',
                  event_type: 'concert',
                  created_by: { email: 'system' },
                  source: 'band',
                  bandData: band,
                  category: category.name
                };
                bandEvents.push(bandEvent);
              }
            });
          }
        });
      });
      
      // Load bags tournament events from localStorage
      const savedTournaments = localStorage.getItem('bags_tournaments');
      const tournamentEvents = savedTournaments ? JSON.parse(savedTournaments)
        .filter(t => t.date)
        .map(tournament => ({
          id: `tournament-${tournament.id}`,
          title: tournament.name,
          description: tournament.description || `${tournament.type}-player Bags Tournament`,
          event_date: tournament.date,
          event_time: tournament.time || '2:00 PM',
          location: 'Bags Court',
          event_type: 'tournament',
          created_by: { email: tournament.createdBy || user?.email || 'system' },
          source: 'bags',
          tournamentData: tournament
        })) : [];
      
      // Combine all events
      const allEvents = [...apiEvents, ...bandEvents, ...tournamentEvents];
      
      // Enrich events with attendee data from RSVP service and comment counts
      const enrichedEvents = allEvents.map(event => ({
        ...event,
        attendees: rsvpService.getEventAttendees(event.id),
        attendeeCount: rsvpService.getAttendeeCount(event.id),
        comments: commentsService.getEventComments(event.id),
        commentCount: commentsService.getCommentCount(event.id)
      }));
      
      setEvents(enrichedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEventsByDate = () => {
    if (viewMode === 'list') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const filtered = events
        .filter(event => new Date(event.event_date) >= today)
        .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
      setFilteredEvents(filtered);
    } else {
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
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
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
      party: '#FF6B6B',     // Coral red
      concert: '#4ECDC4',   // Turquoise
      gathering: '#45B7D1', // Ocean blue
      dinner: '#F7DC6F',    // Sandy yellow
      tournament: '#F39C12', // Orange sunset
      other: '#1ABC9C'      // Tropical teal
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

  const handleCreateTournament = (e) => {
    e.preventDefault();
    const tournaments = JSON.parse(localStorage.getItem('bags_tournaments') || '[]');
    const newTournament = {
      id: Date.now(),
      ...tournamentForm,
      createdAt: new Date().toISOString(),
      createdBy: user?.email || 'anonymous',
      status: 'upcoming'
    };
    tournaments.push(newTournament);
    localStorage.setItem('bags_tournaments', JSON.stringify(tournaments));
    setTournamentForm({ name: '', date: '', time: '2:00 PM', type: 4, description: '' });
    setShowTournamentModal(false);
    loadEvents(); // Reload to show new tournament
  };

  const renderBandDetails = (band) => {
    if (!band) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
      onClick={() => setShowBandDetails(null)}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
        }}
        onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>
              {band.name}
            </h2>
            <button
              onClick={() => {
                console.log('Closing band modal');
                setShowBandDetails(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '0.5rem',
                minWidth: '44px',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Rating */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1.25rem'
            }}>
              {'⭐'.repeat(band.rating)}
              <span style={{ fontSize: '1rem', color: '#6b7280' }}>
                ({band.rating}/5)
              </span>
            </div>

            {/* Description */}
            <div>
              <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>About</h3>
              <p style={{ color: '#374151' }}>{band.description}</p>
            </div>

            {/* Vibe */}
            {band.vibe && (
              <div>
                <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Vibe</h3>
                <p style={{ color: '#374151' }}>{band.vibe}</p>
              </div>
            )}

            {/* Tags */}
            {band.tags && (
              <div>
                <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Genre Tags</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {band.tags.map(tag => (
                    <span key={tag} style={{
                      backgroundColor: '#e5e7eb',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '1rem',
                      fontSize: '0.875rem'
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Social Media */}
            {band.socialMedia && (
              <div>
                <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Social Media</h3>
                <a href={`https://instagram.com/${band.socialMedia.replace('@', '')}`} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   style={{ color: '#3b82f6', textDecoration: 'none' }}>
                  {band.socialMedia}
                </a>
              </div>
            )}

            {/* Regular Venues */}
            {band.regularVenues && (
              <div>
                <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Regular Venues</h3>
                <p style={{ color: '#374151' }}>{band.regularVenues}</p>
              </div>
            )}

            {/* Reviews */}
            {band.reviews && (
              <div>
                <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Reviews</h3>
                <p style={{ color: '#374151' }}>{band.reviews}</p>
              </div>
            )}

            {/* Performance Times */}
            <div>
              <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Performance Schedule</h3>
              <p style={{ color: '#374151' }}>
                {band.date} at {band.time}
              </p>
            </div>

            {/* RSVP Section for Band Events */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginTop: '1rem'
            }}>
              <h3 style={{ fontWeight: '600', marginBottom: '0.75rem', color: '#111827' }}>
                Event RSVP
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    {band.date} at {band.time} • Beach Stage
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    👥 {rsvpService.getAttendeeCount(`band-${band.name}`) || 0} attending
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!user) {
                      alert('Please log in to RSVP');
                      return;
                    }
                    const eventId = `band-${band.name}`;
                    const currentRsvp = rsvpService.getUserRSVPStatus(eventId, user.id);
                    const newStatus = currentRsvp === 'going' ? 'none' : 'going';
                    
                    rsvpService.rsvpToEvent(
                      eventId,
                      user.id,
                      user.display_name || user.first_name || 'Anonymous',
                      newStatus
                    );
                    
                    // Force re-render by updating state
                    setShowBandDetails({...band});
                  }}
                  style={{
                    backgroundColor: user && rsvpService.getUserRSVPStatus(`band-${band.name}`, user.id) === 'going' 
                      ? '#10b981' : '#0891b2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    minHeight: '44px'
                  }}
                >
                  {user && rsvpService.getUserRSVPStatus(`band-${band.name}`, user.id) === 'going' 
                    ? '✓ Going' : 'RSVP'}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              {band.socialMedia && band.socialMedia.includes('facebook') && (
                <a
                  href={`https://facebook.com/${band.socialMedia.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: '#1877f2',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  Facebook
                </a>
              )}
              {band.socialMedia && band.socialMedia.includes('@') && (
                <a
                  href={`https://instagram.com/${band.socialMedia.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: '#e4405f',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  Instagram
                </a>
              )}
              <a
                href={`https://open.spotify.com/search/${encodeURIComponent(band.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: '#1db954',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Spotify
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        overflow: 'hidden'
      }}>
        {/* Calendar Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: '#e5e7eb' }}>
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={{
              padding: '0.75rem',
              textAlign: 'center',
              fontWeight: '600',
              fontSize: '0.875rem',
              backgroundColor: '#f9fafb',
              color: '#374151'
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
                backgroundColor: date ? '#ffffff' : '#f9fafb',
                padding: '0.5rem',
                position: 'relative',
                cursor: date ? 'pointer' : 'default',
                border: isToday ? '2px solid #0891b2' : 'none',
                transition: 'background-color 0.2s'
              }}
              onClick={() => date && setSelectedDate(date)}
              onMouseEnter={(e) => {
                if (date && !isToday) {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (date && !isToday) {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }
              }}>
                {date && (
                  <>
                    <div style={{
                      fontWeight: isToday ? '700' : '500',
                      fontSize: '0.875rem',
                      color: isToday ? '#0891b2' : isSelected ? '#111827' : '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      {date.getDate()}
                    </div>
                    
                    {/* Event Pills */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {dayEvents.slice(0, 3).map((event, idx) => (
                        <div key={event.id} style={{
                          backgroundColor: getEventTypeColor(event.event_type) + '15',
                          color: '#111827',
                          border: `1px solid ${getEventTypeColor(event.event_type)}`,
                          padding: '2px 4px',
                          borderRadius: '4px',
                          fontSize: '0.625rem',
                          fontWeight: '600',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (event.bandData) {
                            setShowBandDetails(event.bandData);
                          } else {
                            setExpandedEvent(event.id);
                          }
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = getEventTypeColor(event.event_type);
                          e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = getEventTypeColor(event.event_type) + '15';
                          e.currentTarget.style.color = '#111827';
                        }}>
                          <span title={event.title}>{event.title}</span>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div style={{
                          fontSize: '0.625rem',
                          color: '#6b7280',
                          textAlign: 'center',
                          fontWeight: '600'
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
          <div style={{ padding: '1.5rem', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: '#111827'
            }}>
              Events on {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </h3>
            {getEventsForDate(selectedDate).length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#6b7280',
                fontSize: '0.875rem'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }}>📅</div>
                <p>No events scheduled for this date</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {getEventsForDate(selectedDate).map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    expanded={expandedEvent === event.id}
                    onToggle={() => {
                      if (event.bandData) {
                        setShowBandDetails(event.bandData);
                      } else {
                        setExpandedEvent(expandedEvent === event.id ? null : event.id);
                      }
                    }}
                    onEdit={() => handleEditEvent(event)}
                    onDelete={() => handleDeleteEvent(event.id)}
                    onRSVP={() => handleRSVP(event)}
                    onAddComment={() => handleAddComment(event.id)}
                    commentInput={commentInputs[event.id] || ''}
                    onCommentInputChange={(value) => setCommentInputs({ ...commentInputs, [event.id]: value })}
                    isOwner={user?.id === event.creator_id}
                    currentUser={user}
                    isDarkMode={isDarkMode}
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
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        overflow: 'hidden'
      }}>
        {Object.keys(eventsByDate).length === 0 ? (
          <div style={{
            padding: '4rem 2rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📅</div>
            <p style={{
              color: '#6b7280',
              fontSize: '1rem',
              marginBottom: '1.5rem'
            }}>No upcoming events scheduled</p>
            <button
              onClick={handleCreateEvent}
              style={{
                backgroundColor: '#0891b2',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Create First Event
            </button>
          </div>
        ) : (
          Object.entries(eventsByDate).map(([dateKey, dateEvents]) => (
            <div key={dateKey} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <div style={{
                padding: '1rem 1.5rem',
                backgroundColor: '#f9fafb',
                fontWeight: '600',
                fontSize: '1rem',
                color: '#111827',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: '1.25rem' }}>📅</span>
                {formatDateHeader(new Date(dateKey))}
              </div>
              <div style={{ padding: '1rem' }}>
                {dateEvents.map((event, idx) => (
                  event.source === 'band' ? (
                    <div key={event.id} style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      marginBottom: '0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => setShowBandDetails(event.bandData)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e2e8f0';
                      e.currentTarget.style.borderColor = '#0891b2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          backgroundColor: '#4ECDC4',
                          color: 'white',
                          width: '2rem',
                          height: '2rem',
                          borderRadius: '0.375rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem'
                        }}>
                          🎸
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#111827',
                            marginBottom: '0.25rem'
                          }}>
                            {event.title}
                            {event.bandData?.rating && (
                              <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: '#f59e0b' }}>
                                {'⭐'.repeat(event.bandData.rating)}
                              </span>
                            )}
                          </div>
                          <div style={{
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                          }}>
                            <span>🕕 {event.event_time}</span>
                            <span>📍 {event.location}</span>
                          </div>
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#0891b2',
                          fontWeight: '500'
                        }}>
                          View Details →
                        </div>
                      </div>
                    </div>
                  ) : (
                    <EventCard
                      key={event.id}
                      event={event}
                      expanded={expandedEvent === event.id}
                      onToggle={() => {
                        setExpandedEvent(expandedEvent === event.id ? null : event.id);
                      }}
                      onEdit={() => handleEditEvent(event)}
                      onDelete={() => handleDeleteEvent(event.id)}
                      onRSVP={() => handleRSVP(event)}
                      onAddComment={() => handleAddComment(event.id)}
                      commentInput={commentInputs[event.id] || ''}
                      onCommentInputChange={(value) => setCommentInputs({ ...commentInputs, [event.id]: value })}
                      isOwner={user?.id === event.creator_id}
                      currentUser={user}
                      isDarkMode={isDarkMode}
                    />
                  )
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    );
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
        if (eventId.startsWith('tournament-')) {
          // Delete from localStorage
          const tournaments = JSON.parse(localStorage.getItem('bags_tournaments') || '[]');
          const updated = tournaments.filter(t => `tournament-${t.id}` !== eventId);
          localStorage.setItem('bags_tournaments', JSON.stringify(updated));
        } else {
          await eventService.deleteEvent(eventId);
        }
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

  const handleRSVP = async (event) => {
    if (!user) {
      notificationService.showToast('Please log in to RSVP', 'warning');
      return;
    }

    const currentStatus = rsvpService.getUserRSVPStatus(event.id, user.id);
    const newStatus = currentStatus === 'going' ? 'none' : 'going';
    
    const result = rsvpService.rsvpToEvent(
      event.id, 
      user.id, 
      user.first_name || user.display_name || 'Anonymous',
      newStatus
    );

    if (result.success) {
      notificationService.showToast(
        newStatus === 'going' ? `You're going to ${event.title}!` : `Removed RSVP for ${event.title}`,
        'success'
      );
      
      // Refresh events to show updated attendee count
      await loadEvents();
    } else {
      notificationService.showToast('Error updating RSVP', 'error');
    }
  };

  const handleAddComment = async (eventId) => {
    if (!user) {
      notificationService.showToast('Please log in to comment', 'warning');
      return;
    }

    const comment = commentInputs[eventId]?.trim();
    if (!comment) {
      notificationService.showToast('Please enter a comment', 'warning');
      return;
    }

    const result = commentsService.addComment(
      eventId,
      user.id,
      user.first_name || user.display_name || 'Anonymous',
      comment
    );

    if (result.success) {
      notificationService.showToast('Comment added!', 'success');
      setCommentInputs({ ...commentInputs, [eventId]: '' });
      await loadEvents(); // Refresh to show new comment
    } else {
      notificationService.showToast('Error adding comment', 'error');
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      paddingBottom: '5rem',
      backgroundColor: '#f9fafb',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch'
    },
    header: {
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      padding: '1rem',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 10
    },
    headerTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
      flexWrap: 'wrap',
      gap: '0.75rem'
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#111827',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      '@media (min-width: 768px)': {
        fontSize: '1.75rem'
      }
    },
    subtitle: {
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    btnPrimary: {
      backgroundColor: '#0891b2',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '0.75rem',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      minHeight: '44px',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      transition: 'all 0.2s',
      whiteSpace: 'nowrap'
    },
    btnSecondary: {
      backgroundColor: '#f59e0b',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '0.75rem',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      minHeight: '44px',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      transition: 'all 0.2s',
      whiteSpace: 'nowrap'
    },
    content: {
      padding: '1rem',
      maxWidth: '100vw',
      overflowX: 'hidden'
    },
    viewToggle: {
      display: 'flex',
      backgroundColor: '#f3f4f6',
      borderRadius: '0.75rem',
      padding: '0.125rem',
      border: '1px solid #e5e7eb'
    },
    viewButton: {
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
      border: 'none',
      borderRadius: '0.625rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      minWidth: '80px'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div>
            <h1 style={styles.title}>
              <span>📅</span> Events Calendar
            </h1>
            <p style={styles.subtitle}>Manage and view all beach club events</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setShowTournamentModal(true)}
              style={{
                ...styles.btnSecondary,
                onMouseEnter: (e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
                }
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span>🎯</span> New Tournament
            </button>
            <button
              onClick={handleCreateEvent}
              style={styles.btnPrimary}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span>+</span> New Event
            </button>
          </div>
        </div>
      </div>

      {/* View Toggle & Navigation */}
      <div style={styles.content}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          {/* View Mode Toggle */}
          <div style={styles.viewToggle}>
            <button
              onClick={() => setViewMode('month')}
              style={{
                ...styles.viewButton,
                backgroundColor: viewMode === 'month' ? '#ffffff' : 'transparent',
                color: viewMode === 'month' ? '#111827' : '#6b7280',
                boxShadow: viewMode === 'month' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              📅 Month
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                ...styles.viewButton,
                backgroundColor: viewMode === 'list' ? '#ffffff' : 'transparent',
                color: viewMode === 'list' ? '#111827' : '#6b7280',
                boxShadow: viewMode === 'list' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              📋 List
            </button>
          </div>

          {/* Month Navigation */}
          {viewMode === 'month' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
                style={{
                  padding: '0.5rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  lineHeight: '1',
                  minWidth: '40px',
                  minHeight: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                ‹
              </button>
              <button
                onClick={() => setSelectedDate(new Date())}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#0891b2',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ecfeff';
                  e.currentTarget.style.borderColor = '#0891b2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                Today
              </button>
              <span style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                minWidth: '180px',
                textAlign: 'center',
                color: '#111827'
              }}>
                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
                style={{
                  padding: '0.5rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  lineHeight: '1',
                  minWidth: '40px',
                  minHeight: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                ›
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            padding: '3rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>Loading events...</p>
          </div>
        ) : (
          viewMode === 'month' ? renderMonthView() : renderListView()
        )}
      </div>

      {/* Band Details Modal */}
      {showBandDetails && renderBandDetails(showBandDetails)}

      {/* Tournament Creation Modal */}
      {showTournamentModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}
        onClick={() => setShowTournamentModal(false)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}
          onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>
              🎯 Create Cornhole Tournament
            </h2>
            
            <form onSubmit={handleCreateTournament}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Tournament Name
                </label>
                <input
                  type="text"
                  value={tournamentForm.name}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, name: e.target.value })}
                  required
                  placeholder="Summer Championship"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Date
                </label>
                <input
                  type="date"
                  value={tournamentForm.date}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, date: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Time
                </label>
                <input
                  type="text"
                  value={tournamentForm.time}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, time: e.target.value })}
                  placeholder="2:00 PM"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Tournament Type
                </label>
                <select
                  value={tournamentForm.type}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, type: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    backgroundColor: 'white'
                  }}
                >
                  <option value={4}>4 Player Tournament</option>
                  <option value={8}>8 Player Tournament</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Description (Optional)
                </label>
                <textarea
                  value={tournamentForm.description}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, description: e.target.value })}
                  placeholder="Tournament details, rules, prizes..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    backgroundColor: '#60a5fa',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Create Tournament
                </button>
                <button
                  type="button"
                  onClick={() => setShowTournamentModal(false)}
                  style={{
                    flex: 1,
                    backgroundColor: '#e5e7eb',
                    color: '#374151',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Band Details Modal */}
      {showBandDetails && renderBandDetails(showBandDetails)}
    </div>
  );
};

// Event Card Component
const EventCard = ({ event, expanded, onToggle, onEdit, onDelete, onRSVP, onAddComment, commentInput, onCommentInputChange, isOwner, currentUser, isDarkMode }) => {
  const getEventTypeColor = (type) => {
    const colors = {
      party: '#FF6B6B',     // Coral red
      concert: '#4ECDC4',   // Turquoise
      gathering: '#45B7D1', // Ocean blue
      dinner: '#F7DC6F',    // Sandy yellow
      tournament: '#F39C12', // Orange sunset
      other: '#1ABC9C'      // Tropical teal
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
      background: '#FFFFFF', // Pure white for maximum readability
      borderRadius: '1rem',
      padding: '1.5rem',
      marginBottom: '1rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: '3px solid #2E86AB', // Strong blue border
      boxShadow: '0 8px 24px rgba(46, 134, 171, 0.2)',
      transform: expanded ? 'scale(1.02)' : 'scale(1)'
    }}
    onClick={onToggle}>
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
            fontSize: '1.5rem',
            fontWeight: '800',
            margin: '0 0 0.75rem 0',
            color: '#000000', // Pure black for maximum readability
            lineHeight: '1.3'
          }}>
            {event.title}
            {event.bandData && event.bandData.rating && (
              <span style={{ marginLeft: '0.5rem', fontSize: '1.25rem', color: '#FF6B00' }}>
                {'⭐'.repeat(event.bandData.rating)}
              </span>
            )}
          </h4>
          
          <div style={{
            fontSize: '1.1rem',
            color: '#000000', // Pure black for readability
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '1rem',
            fontWeight: '600'
          }}>
            <span style={{background: '#E3F2FD', padding: '0.5rem 1rem', borderRadius: '1rem', border: '2px solid #1976D2', color: '#000000'}}>
              ⏰ {event.event_time}
            </span>
            <span style={{background: '#E8F5E8', padding: '0.5rem 1rem', borderRadius: '1rem', border: '2px solid #388E3C', color: '#000000'}}>
              📍 {event.location || 'Beach Club'}
            </span>
            {event.attendees && event.attendees.length > 0 && (
              <span style={{background: '#FFF3E0', padding: '0.5rem 1rem', borderRadius: '1rem', border: '2px solid #F57C00', color: '#000000', fontWeight: '700'}}>
                👥 {event.attendees.length} going
              </span>
            )}
          </div>

          {/* Show Attendees List - Always Visible & Readable */}
          {event.attendees && event.attendees.length > 0 && (
            <div style={{
              background: '#F0F8FF',
              borderRadius: '1rem',
              padding: '1rem',
              marginBottom: '1rem',
              border: '3px solid #1976D2'
            }}>
              <h5 style={{
                fontSize: '1.1rem',
                fontWeight: '700',
                margin: '0 0 0.75rem 0',
                color: '#000000'
              }}>🏖️ Who's Coming:</h5>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                {event.attendees.map((attendee, index) => (
                  <span
                    key={attendee.userId || index}
                    style={{
                      fontSize: '1rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#1976D2',
                      color: '#FFFFFF',
                      borderRadius: '1.5rem',
                      fontWeight: '600',
                      boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
                      border: '2px solid #0D47A1'
                    }}
                  >
                    👤 {attendee.userName}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* RSVP Button - MASSIVE & READABLE */}
          <div style={{ marginTop: '1rem' }}>
            {currentUser ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRSVP();
                }}
                style={{
                  padding: '1rem 2rem',
                  backgroundColor: rsvpService.getUserRSVPStatus(event.id, currentUser?.id) === 'going' 
                    ? '#2E7D32' 
                    : '#D32F2F',
                  color: '#FFFFFF',
                  border: '3px solid #000000',
                  borderRadius: '1rem',
                  fontSize: '1.2rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  marginRight: '1rem',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  width: 'auto',
                  minWidth: '200px'
                }}
              >
                {rsvpService.getUserRSVPStatus(event.id, currentUser?.id) === 'going' ? '✅ I\'M GOING!' : '🎯 RSVP NOW!'}
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = '/login';
                }}
                style={{
                  padding: '1rem 2rem',
                  backgroundColor: '#FF9800',
                  color: '#FFFFFF',
                  border: '3px solid #000000',
                  borderRadius: '1rem',
                  fontSize: '1.2rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  marginRight: '1rem',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  minWidth: '200px'
                }}
              >
                🔐 LOGIN TO JOIN!
              </button>
            )}
            {event.bandData && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#FFFFFF',
                  color: '#000000',
                  border: '3px solid #1976D2',
                  borderRadius: '1rem',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {expanded ? '📖 LESS INFO' : '📖 BAND INFO'} 
              </button>
            )}
          </div>
          
          {expanded && (
            <div style={{
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '4px solid #1976D2',
              background: '#F5F5F5',
              padding: '1rem',
              borderRadius: '1rem',
              border: '2px solid #000000'
            }}>
              {event.description && (
                <p style={{
                  fontSize: '1.1rem',
                  color: '#000000',
                  marginBottom: '1rem',
                  lineHeight: '1.6',
                  fontWeight: '600',
                  background: '#FFFFFF',
                  padding: '1rem',
                  borderRadius: '1rem',
                  border: '2px solid #1976D2'
                }}>
                  {event.description}
                </p>
              )}

              {event.bandData && (
                <div style={{
                  background: '#FFFFFF',
                  padding: '1rem',
                  borderRadius: '1rem',
                  border: '2px solid #FF6B00',
                  marginBottom: '1rem'
                }}>
                  <h5 style={{
                    fontSize: '1.2rem',
                    fontWeight: '800',
                    margin: '0 0 0.5rem 0',
                    color: '#000000'
                  }}>🎸 Band Details:</h5>
                  <p style={{
                    fontSize: '1rem',
                    color: '#000000',
                    margin: '0.5rem 0',
                    fontWeight: '600'
                  }}>
                    <strong>Style:</strong> {event.bandData.vibe}
                  </p>
                  {event.bandData.reviews && (
                    <p style={{
                      fontSize: '1rem',
                      color: '#000000',
                      margin: '0.5rem 0',
                      fontWeight: '600'
                    }}>
                      <strong>Reviews:</strong> {event.bandData.reviews}
                    </p>
                  )}
                  {event.bandData.socialMedia && (
                    <p style={{
                      fontSize: '1rem',
                      color: '#000000',
                      margin: '0.5rem 0',
                      fontWeight: '600'
                    }}>
                      <strong>Follow:</strong> {event.bandData.socialMedia}
                    </p>
                  )}
                </div>
              )}
              
              {event.bandData && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <p style={{ fontSize: '0.875rem', color: '#374151' }}>
                    <strong>Genre:</strong> {event.bandData.tags ? event.bandData.tags.join(', ') : 'Various'}
                  </p>
                  {event.bandData.socialMedia && (
                    <p style={{ fontSize: '0.875rem', color: '#374151' }}>
                      <strong>Social:</strong> {event.bandData.socialMedia}
                    </p>
                  )}
                </div>
              )}
              
              {/* RSVP Section */}
              {event.attendees && event.attendees.length > 0 && (
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '0.5rem'
                }}>
                  <p style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: '#374151'
                  }}>
                    👥 {event.attendees.length} Attending
                  </p>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    {event.attendees.map((attendee, index) => (
                      <span
                        key={attendee.userId || index}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: 'white',
                          borderRadius: '0.375rem',
                          color: '#4b5563'
                        }}
                      >
                        {attendee.userName}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div style={{
                marginTop: '0.75rem',
                padding: '0.75rem',
                backgroundColor: '#fef3c7',
                borderRadius: '0.5rem'
              }}>
                <p style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: '#78350f'
                }}>
                  💬 Comments {event.commentCount > 0 && `(${event.commentCount})`}
                </p>
                
                {/* Display existing comments */}
                {event.comments && event.comments.length > 0 && (
                  <div style={{
                    marginBottom: '0.75rem',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {event.comments.map((comment) => (
                      <div
                        key={comment.id}
                        style={{
                          backgroundColor: 'white',
                          padding: '0.5rem',
                          borderRadius: '0.375rem',
                          marginBottom: '0.5rem',
                          fontSize: '0.75rem'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '0.25rem'
                        }}>
                          <span style={{ fontWeight: '600', color: '#374151' }}>
                            {comment.userName}
                          </span>
                          <span style={{ color: '#6b7280', fontSize: '0.625rem' }}>
                            {new Date(comment.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p style={{ margin: 0, color: '#4b5563' }}>
                          {comment.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add comment input */}
                {currentUser ? (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(e) => onCommentInputChange(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          onAddComment();
                        }
                      }}
                      placeholder="Add a comment..."
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        border: '1px solid #fbbf24',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        outline: 'none'
                      }}
                    />
                    <button
                      onClick={onAddComment}
                      style={{
                        padding: '0.5rem 0.75rem',
                        backgroundColor: '#fbbf24',
                        color: '#78350f',
                        border: 'none',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      Post
                    </button>
                  </div>
                ) : (
                  <div style={{
                    padding: '0.75rem',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.375rem',
                    textAlign: 'center',
                    fontSize: '0.75rem',
                    color: '#6b7280'
                  }}>
                    <button
                      onClick={() => window.location.href = '/login'}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      Login to comment
                    </button>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginTop: '0.75rem',
                flexWrap: 'wrap'
              }}>
                {/* RSVP Button */}
                {currentUser ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRSVP();
                    }}
                    style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: rsvpService.getUserRSVPStatus(event.id, currentUser?.id) === 'going' 
                        ? '#10b981' 
                        : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    {rsvpService.getUserRSVPStatus(event.id, currentUser?.id) === 'going' ? '✓ Going' : '+ RSVP'}
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = '/login';
                    }}
                    style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    Login to RSVP
                  </button>
                )}
                
                {isOwner && !event.source && (
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
                {event.source === 'bags' && (
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
                    Cancel Tournament
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Tournament Creation Modal
const TournamentModal = ({ isOpen, onClose, tournamentForm, setTournamentForm, onSubmit }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '1rem',
        maxWidth: '400px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', fontWeight: '700' }}>
          🎯 Create Tournament
        </h2>
        
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Tournament Name
            </label>
            <input
              type="text"
              value={tournamentForm.name}
              onChange={(e) => setTournamentForm({...tournamentForm, name: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                boxSizing: 'border-box'
              }}
              placeholder="Summer Cornhole Championship"
              required
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Date
            </label>
            <input
              type="date"
              value={tournamentForm.date}
              onChange={(e) => setTournamentForm({...tournamentForm, date: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Time
            </label>
            <input
              type="time"
              value={tournamentForm.time}
              onChange={(e) => setTournamentForm({...tournamentForm, time: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Description
            </label>
            <textarea
              value={tournamentForm.description}
              onChange={(e) => setTournamentForm({...tournamentForm, description: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                minHeight: '80px',
                boxSizing: 'border-box'
              }}
              placeholder="Tournament details and rules..."
            />
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Create Tournament
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Band Details Modal
const BandDetailsModal = ({ band, isOpen, onClose }) => {
  if (!isOpen || !band) return null;

  const handleSpotifySearch = () => {
    const query = encodeURIComponent(band.name);
    window.open(`https://open.spotify.com/search/${query}`, '_blank');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '1rem',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
            {band.name}
          </h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            ×
          </button>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>{'⭐'.repeat(band.rating || 0)}</span>
            <span style={{ fontWeight: '600' }}>{band.rating}/5</span>
          </div>
          <p style={{ color: '#6b7280', margin: 0 }}>{band.description}</p>
        </div>
        
        {band.vibe && (
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontStyle: 'italic', color: '#374151', margin: 0 }}>
              "{band.vibe}"
            </p>
          </div>
        )}
        
        {band.tags && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {band.tags.map((tag, i) => (
                <span key={i} style={{
                  backgroundColor: '#e0e7ff',
                  color: '#3730a3',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={handleSpotifySearch}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              backgroundColor: '#1db954',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '500',
              cursor: 'pointer',
              textDecoration: 'none'
            }}
          >
            🎵 Listen on Spotify
          </button>
          
          {band.socialMedia && band.socialMedia.includes('facebook') && (
            <button
              onClick={() => window.open(band.socialMedia, '_blank')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                backgroundColor: '#1877f2',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              📘 Facebook Page
            </button>
          )}
          
          {band.regularVenues && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: '#f3f4f6',
              borderRadius: '0.5rem'
            }}>
              <p style={{ fontSize: '0.875rem', margin: '0 0 0.25rem 0', fontWeight: '600' }}>
                📍 Regular Venues:
              </p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                {band.regularVenues}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedCalendarView;