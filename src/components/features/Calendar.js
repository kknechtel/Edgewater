import React, { useState, useEffect } from 'react';
import { bandGuideData } from '../../data/bandGuideData';

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showBandGuide, setShowBandGuide] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dinnerItems, setDinnerItems] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_date: '',
    event_type: 'party',
    band_name: '',
    band_rating: 5,
    band_vibe: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Ensure data is an array
        const eventsArray = Array.isArray(data) ? data : (data.events || data.data || []);
        
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
        const allEvents = [...eventsArray, ...bandEvents, ...tournamentEvents];
        setEvents(allEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const eventData = {
        ...newEvent,
        dinner_items: newEvent.event_type === 'dinner' ? dinnerItems : []
      };
      
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      });
      if (response.ok) {
        setShowEventModal(false);
        fetchEvents();
        setNewEvent({
          title: '',
          description: '',
          event_date: '',
          event_type: 'party',
          band_name: '',
          band_rating: 5,
          band_vibe: ''
        });
        setDinnerItems([]);
      }
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const handleAttendEvent = async (eventId, isCurrentlyAttending) => {
    try {
      const token = localStorage.getItem('token');
      const url = isCurrentlyAttending 
        ? `/api/events/${eventId}/unattend` 
        : `/api/events/${eventId}/attend`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        fetchEvents(); // Refresh events to show updated attendance
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get upcoming band performances
  const getUpcomingBands = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const allBands = bandGuideData.categories.flatMap(cat => cat.bands || []);
    const upcomingShows = [];
    
    // Process bands with dates
    allBands.forEach(band => {
      if (band.date) {
        // Split multiple dates
        const dates = band.date.split(',').map(d => d.trim());
        const times = band.time ? band.time.split('/').map(t => t.trim()) : [];
        
        dates.forEach((dateStr, index) => {
          // Parse date string (e.g., "June 21" → "June 21, 2025")
          const year = today.getFullYear();
          const showDate = new Date(`${dateStr}, ${year}`);
          
          // If the date has passed this year, try next year
          if (showDate < today) {
            showDate.setFullYear(year + 1);
          }
          
          if (showDate >= today && showDate <= thirtyDaysFromNow) {
            upcomingShows.push({
              ...band,
              date: dateStr,
              time: times[index] || times[0] || band.time || '6:00 PM',
              dateObj: showDate,
              fullDate: showDate.toISOString().split('T')[0]
            });
          }
        });
      }
    });
    
    return upcomingShows.sort((a, b) => a.dateObj - b.dateObj).slice(0, 5);
  };

  const upcomingBands = getUpcomingBands();

  // Band guide functions
  const getFilteredBands = () => {
    let bands = [];
    
    if (selectedCategory === 'all') {
      bands = bandGuideData.categories.flatMap(cat => 
        cat.bands.map(band => ({ ...band, category: cat.name }))
      );
    } else {
      const category = bandGuideData.categories.find(cat => cat.id === selectedCategory);
      if (category) {
        bands = category.bands.map(band => ({ ...band, category: category.name }));
      }
    }

    if (searchTerm) {
      bands = bands.filter(band => 
        band.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        band.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        band.vibe?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort bands by date (bands with dates first, then by date, then alphabetically)
    bands.sort((a, b) => {
      if (a.date && !b.date) return -1;
      if (!a.date && b.date) return 1;
      if (a.date && b.date) {
        // Get first date if multiple dates exist
        const firstDateA = a.date.split(',')[0].trim();
        const firstDateB = b.date.split(',')[0].trim();
        const dateA = new Date(firstDateA + ', 2025');
        const dateB = new Date(firstDateB + ', 2025');
        return dateA - dateB;
      }
      return a.name.localeCompare(b.name);
    });

    return bands;
  };

  const getRatingColor = (rating) => {
    if (rating >= 5) return '#10b981';
    if (rating >= 4) return '#3b82f6';
    if (rating >= 3) return '#f59e0b';
    return '#ef4444';
  };

  const getRatingEmoji = (rating) => {
    if (rating >= 5) return '🌟';
    if (rating >= 4) return '⭐';
    if (rating >= 3) return '✨';
    return '💫';
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.event_date);
      return isSameDay(eventDate, date);
    });
  };

  const getBandsForDate = (date) => {
    const monthDay = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    const year = date.getFullYear();
    const fullDateString = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    // Check allDates first using the full date format
    const bandsFromAllDates = bandGuideData.allDates?.find(d => d.date === fullDateString)?.bands || [];
    
    // Also check individual band dates
    const bandsFromBandData = [];
    bandGuideData.categories.forEach(category => {
      category.bands.forEach(band => {
        if (band.date) {
          // Split multiple dates and check each
          const dates = band.date.split(',').map(d => d.trim());
          dates.forEach(dateStr => {
            if (dateStr === monthDay) {
              bandsFromBandData.push(band.name);
            }
          });
        }
      });
    });
    
    // Combine and deduplicate
    const allBands = [...new Set([...bandsFromAllDates, ...bandsFromBandData])];
    return allBands;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const today = new Date();

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} style={{ padding: '0.5rem' }}></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const dayBands = getBandsForDate(date);
      const isToday = isSameDay(date, today);
      const isSelected = selectedDate && isSameDay(date, selectedDate);
      const hasActivity = dayEvents.length > 0 || dayBands.length > 0;

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          style={{
            padding: '0.5rem',
            textAlign: 'center',
            border: '1px solid #e5e7eb',
            backgroundColor: isSelected ? '#0891b2' : isToday ? '#fef3c7' : hasActivity ? '#f0f9ff' : 'white',
            color: isSelected ? 'white' : isToday ? '#92400e' : '#374151',
            cursor: 'pointer',
            minHeight: '60px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            fontSize: '0.875rem',
            position: 'relative'
          }}
        >
          <div style={{ fontWeight: isToday ? '600' : '400', marginBottom: '0.25rem' }}>
            {day}
          </div>
          {hasActivity && (
            <div style={{ 
              fontSize: '0.625rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1px'
            }}>
              {dayEvents.slice(0, 2).map((event, i) => (
                <div key={i} style={{
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.3)' : '#0891b2',
                  color: isSelected ? 'white' : 'white',
                  padding: '1px 3px',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {event.title.substring(0, 8)}
                </div>
              ))}
              {dayBands.slice(0, 1).map((band, i) => (
                <div key={`band-${i}`} style={{
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.9)' : '#8b5cf6',
                  color: isSelected ? '#8b5cf6' : 'white',
                  padding: '2px 4px',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  border: isSelected ? '1px solid #8b5cf6' : 'none'
                }}>
                  🎸 {band.substring(0, 8)}
                </div>
              ))}
              {(dayEvents.length + dayBands.length) > 3 && (
                <div style={{ fontSize: '0.5rem', opacity: 0.7 }}>
                  +{(dayEvents.length + dayBands.length) - 3} more
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading events...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', paddingBottom: '2rem' }}>
      {/* Calendar Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        backgroundColor: '#0891b2',
        color: 'white',
        padding: '1rem',
        borderRadius: '0.5rem'
      }}>
        <button
          onClick={() => navigateMonth(-1)}
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: 'none',
            padding: '0.5rem',
            borderRadius: '0.25rem',
            fontSize: '1.25rem',
            cursor: 'pointer'
          }}
        >
          ◀
        </button>
        <h2 style={{ 
          margin: 0, 
          fontSize: '1.25rem', 
          fontWeight: '600',
          textAlign: 'center',
          flex: 1
        }}>
          📅 {formatMonthYear(currentDate)}
        </h2>
        <button
          onClick={() => navigateMonth(1)}
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: 'none',
            padding: '0.5rem',
            borderRadius: '0.25rem',
            fontSize: '1.25rem',
            cursor: 'pointer'
          }}
        >
          ▶
        </button>
      </div>

      {/* Action Buttons */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
        <button
          onClick={() => setShowEventModal(true)}
          style={{
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1rem',
            borderRadius: '2rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          🎉 Add Event
        </button>
        <button
          onClick={() => setShowBandGuide(!showBandGuide)}
          style={{
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1rem',
            borderRadius: '2rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          {showBandGuide ? '📅 Calendar' : '🎸 Band Guide'}
        </button>
      </div>

      {/* Calendar Grid */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '1rem'
      }}>
        {/* Day headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          backgroundColor: '#f3f4f6'
        }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={{
              padding: '0.75rem 0.5rem',
              textAlign: 'center',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151'
            }}>
              {day}
            </div>
          ))}
        </div>
        {/* Calendar days */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)'
        }}>
          {renderCalendarGrid()}
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div style={{
          backgroundColor: '#0891b2',
          color: 'white',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem'
        }}>
          <h3 style={{ 
            margin: '0 0 0.75rem 0', 
            fontSize: '1.125rem', 
            fontWeight: '600'
          }}>
            📅 {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          
          {getEventsForDate(selectedDate).length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>🎉 Events:</h4>
              {getEventsForDate(selectedDate).map((event, i) => (
                <div key={i} style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{event.title}</div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>{event.description}</div>
                  
                  {/* Attendance section for selected date */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '0.5rem'
                  }}>
                    <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                      👥 {event.attendees?.length || 0} going
                    </span>
                    <button
                      onClick={() => handleAttendEvent(event.id, event.userAttending)}
                      style={{
                        backgroundColor: event.userAttending ? 'rgba(239,68,68,0.9)' : 'rgba(16,185,129,0.9)',
                        color: 'white',
                        border: 'none',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.625rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {event.userAttending ? "✗ Can't Make It" : "✓ I'm Going"}
                    </button>
                  </div>
                  
                  {event.attendees && event.attendees.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.25rem',
                      marginTop: '0.5rem'
                    }}>
                      {event.attendees.slice(0, 4).map((attendee, ai) => (
                        <span key={ai} style={{
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          color: '#0891b2',
                          padding: '0.125rem 0.375rem',
                          borderRadius: '0.75rem',
                          fontSize: '0.625rem',
                          fontWeight: '500'
                        }}>
                          {attendee.name}
                        </span>
                      ))}
                      {event.attendees.length > 4 && (
                        <span style={{
                          color: 'rgba(255,255,255,0.8)',
                          fontSize: '0.625rem',
                          fontStyle: 'italic'
                        }}>
                          +{event.attendees.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {getBandsForDate(selectedDate).length > 0 && (
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>🎸 Bands:</h4>
              {getBandsForDate(selectedDate).map((band, i) => (
                <div key={i} style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  marginBottom: '0.25rem',
                  fontWeight: '500'
                }}>
                  {band}
                </div>
              ))}
            </div>
          )}

          {getEventsForDate(selectedDate).length === 0 && getBandsForDate(selectedDate).length === 0 && (
            <p style={{ margin: 0, opacity: 0.8, fontStyle: 'italic' }}>
              No events scheduled for this day
            </p>
          )}
        </div>
      )}

      {/* Band Guide Section */}
      {showBandGuide && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            margin: '0 0 1rem 0', 
            fontSize: '1.25rem', 
            fontWeight: '600',
            textAlign: 'center',
            color: '#8b5cf6'
          }}>
            🎸 Complete Band Guide
          </h3>

          {/* Search and Filter */}
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="🔍 Search bands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            >
              <option value="all">All Categories</option>
              {bandGuideData.categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name.replace(/^[⭐🌟💫].+?:\s*/, '')}
                </option>
              ))}
            </select>
          </div>

          {/* Band List */}
          <div style={{ 
            maxHeight: '400px', 
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            {getFilteredBands().map((band, index) => (
              <div key={index} style={{
                padding: '1rem',
                border: `2px solid ${getRatingColor(band.rating)}`,
                borderRadius: '0.75rem',
                backgroundColor: '#f9fafb',
                position: 'relative'
              }}>
                {/* Rating Badge */}
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '10px',
                  backgroundColor: getRatingColor(band.rating),
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  {getRatingEmoji(band.rating)} {band.rating}/5
                </div>

                <h4 style={{ 
                  margin: '0 0 0.5rem 0', 
                  fontSize: '1.125rem', 
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  {band.name}
                </h4>
                
                {band.date && (
                  <p style={{ 
                    margin: '0 0 0.5rem 0', 
                    fontSize: '0.875rem', 
                    color: '#8b5cf6',
                    fontWeight: '500'
                  }}>
                    📅 {band.date} {band.time && `at ${band.time}`}
                  </p>
                )}

                {band.vibe && (
                  <p style={{ 
                    margin: '0 0 0.5rem 0', 
                    fontSize: '0.875rem', 
                    color: '#059669',
                    fontWeight: '500'
                  }}>
                    🎵 Vibe: {band.vibe}
                  </p>
                )}

                {band.description && (
                  <p style={{ 
                    margin: '0 0 0.5rem 0', 
                    fontSize: '0.875rem', 
                    color: '#4b5563',
                    lineHeight: '1.4'
                  }}>
                    {band.description}
                  </p>
                )}

                {band.recommendation && (
                  <div style={{
                    backgroundColor: '#fef3c7',
                    padding: '0.5rem',
                    borderRadius: '0.375rem',
                    marginTop: '0.5rem'
                  }}>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '0.875rem', 
                      color: '#92400e',
                      fontStyle: 'italic'
                    }}>
                      💡 {band.recommendation}
                    </p>
                  </div>
                )}

                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#9ca3af',
                  marginTop: '0.5rem',
                  fontStyle: 'italic'
                }}>
                  Category: {band.category?.replace(/^[⭐🌟💫].+?:\s*/, '')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Bands Section */}
      {upcomingBands.length > 0 && (
        <div style={{
          backgroundColor: '#fef3c7',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem'
        }}>
          <h3 style={{ 
            margin: '0 0 0.75rem 0', 
            fontSize: '1.125rem', 
            fontWeight: '600',
            color: '#92400e'
          }}>
            🎸 Upcoming Bands
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {upcomingBands.map((band, index) => (
              <div key={index} style={{
                backgroundColor: 'white',
                padding: '0.75rem',
                borderRadius: '0.375rem',
                borderLeft: `4px solid ${band.rating >= 4 ? '#10b981' : '#f59e0b'}`
              }}>
                <div style={{ marginBottom: '0.25rem' }}>
                  <strong style={{ fontSize: '0.875rem' }}>{band.name}</strong>
                  <span style={{ 
                    marginLeft: '0.5rem',
                    fontSize: '0.75rem',
                    color: '#6b7280'
                  }}>
                    {band.date}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#4b5563' }}>
                  {band.vibe}
                </div>
                <div style={{ 
                  marginTop: '0.25rem',
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap'
                }}>
                  {band.rating >= 4 && (
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#059669',
                      fontWeight: '500'
                    }}>
                      ⭐ Recommended
                    </span>
                  )}
                  <span style={{
                    fontSize: '0.75rem',
                    color: '#6b7280'
                  }}>
                    {band.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {events.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            padding: '3rem 1rem',
            borderRadius: '0.5rem',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No events yet</p>
            <p style={{ fontSize: '0.875rem' }}>Be the first to create a beach event!</p>
          </div>
        ) : (
          events.map(event => (
            <div key={event.id} style={{
              backgroundColor: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              borderLeft: `4px solid ${
                event.event_type === 'party' ? '#f59e0b' :
                event.event_type === 'concert' ? '#8b5cf6' :
                event.event_type === 'gathering' ? '#10b981' :
                event.event_type === 'dinner' ? '#ec4899' :
                '#6b7280'
              }`
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <h3 style={{ 
                  margin: '0 0 0.25rem 0', 
                  fontSize: '1.125rem', 
                  fontWeight: '600' 
                }}>
                  {event.title}
                </h3>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.875rem', 
                  color: '#0891b2',
                  fontWeight: '500'
                }}>
                  {formatDate(event.event_date)}
                </p>
              </div>
              
              {event.description && (
                <p style={{ 
                  margin: '0.5rem 0', 
                  fontSize: '0.875rem', 
                  color: '#4b5563' 
                }}>
                  {event.description}
                </p>
              )}

              {event.band_name && (
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.5rem',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}>
                  <strong>🎸 {event.band_name}</strong>
                  {event.band_rating && (
                    <span style={{ marginLeft: '0.5rem' }}>
                      ⭐ {event.band_rating}/10
                    </span>
                  )}
                  {event.band_vibe && (
                    <span style={{ 
                      display: 'block', 
                      marginTop: '0.25rem',
                      color: '#6b7280'
                    }}>
                      Vibe: {event.band_vibe}
                    </span>
                  )}
                </div>
              )}

              {event.dinner_items && event.dinner_items.length > 0 && (
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem',
                  backgroundColor: '#fce7f3',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}>
                  <strong style={{ color: '#be185d' }}>🍽️ Family Dinner - Bring Items:</strong>
                  <div style={{ marginTop: '0.5rem' }}>
                    {event.dinner_items.map((item, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.25rem 0',
                        borderBottom: i < event.dinner_items.length - 1 ? '1px solid #f3e8ff' : 'none'
                      }}>
                        <span>{item.name}</span>
                        <span style={{
                          fontSize: '0.75rem',
                          color: item.assignedTo ? '#059669' : '#6b7280',
                          fontStyle: item.assignedTo ? 'normal' : 'italic'
                        }}>
                          {item.assignedTo || 'Available'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attendance Section */}
              <div style={{
                marginTop: '0.75rem',
                padding: '0.75rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem'
                  }}>
                    <span>👥</span>
                    <span style={{ fontWeight: '500' }}>
                      {event.attendees?.length || 0} going
                    </span>
                  </div>
                  <button
                    onClick={() => handleAttendEvent(event.id, event.userAttending)}
                    style={{
                      backgroundColor: event.userAttending ? '#ef4444' : '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '1.5rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    {event.userAttending ? "✗ Can't Make It" : "✓ I'm Going"}
                  </button>
                </div>
                
                {event.attendees && event.attendees.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.25rem',
                    marginTop: '0.5rem'
                  }}>
                    {event.attendees.slice(0, 6).map((attendee, i) => (
                      <span key={i} style={{
                        backgroundColor: '#e0f2fe',
                        color: '#0891b2',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {attendee.name}
                      </span>
                    ))}
                    {event.attendees.length > 6 && (
                      <span style={{
                        color: '#6b7280',
                        fontSize: '0.75rem',
                        fontStyle: 'italic'
                      }}>
                        +{event.attendees.length - 6} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div style={{
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                color: '#9ca3af'
              }}>
                <span style={{
                  backgroundColor: event.event_type === 'party' ? '#fef3c7' :
                    event.event_type === 'concert' ? '#ede9fe' :
                    event.event_type === 'gathering' ? '#d1fae5' :
                    event.event_type === 'dinner' ? '#fce7f3' :
                    '#f3f4f6',
                  color: event.event_type === 'party' ? '#d97706' :
                    event.event_type === 'concert' ? '#7c3aed' :
                    event.event_type === 'gathering' ? '#059669' :
                    event.event_type === 'dinner' ? '#be185d' :
                    '#4b5563',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontWeight: '500'
                }}>
                  {event.event_type}
                </span>
                <span>by {event.creator?.name || 'Anonymous'}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Event Creation Modal */}
      {showEventModal && (
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
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>
                🎉 Create New Event
              </h2>
              <button
                onClick={() => setShowEventModal(false)}
                style={{
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '50%',
                  width: '2rem',
                  height: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.25rem'
                }}
              >
                ❌
              </button>
            </div>

            <form onSubmit={handleAddEvent}>
              <input
                type="text"
                placeholder="Event Title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginBottom: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
              
              <textarea
                placeholder="Description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginBottom: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  minHeight: '4rem',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />

              <input
                type="datetime-local"
                value={newEvent.event_date}
                onChange={(e) => setNewEvent({...newEvent, event_date: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginBottom: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />

              <select
                value={newEvent.event_type}
                onChange={(e) => setNewEvent({...newEvent, event_type: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginBottom: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              >
                <option value="party">Beach Party</option>
                <option value="concert">Concert</option>
                <option value="gathering">Gathering</option>
                <option value="dinner">Family Dinner</option>
                <option value="other">Other</option>
              </select>

              {newEvent.event_type === 'concert' && (
                <>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Band Name (try The Benjamins, Audio Riots, etc.)"
                      value={newEvent.band_name}
                      onChange={(e) => setNewEvent({...newEvent, band_name: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        marginBottom: '0.75rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.375rem',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                      }}
                    />
                    {newEvent.band_name && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderTop: 'none',
                        borderRadius: '0 0 0.375rem 0.375rem',
                        marginBottom: '0.75rem',
                        maxHeight: '150px',
                        overflowY: 'auto',
                        zIndex: 10
                      }}>
                        {bandGuideData.categories
                          .flatMap(cat => cat.bands)
                          .filter(band => 
                            band.name.toLowerCase().includes(newEvent.band_name.toLowerCase())
                          )
                          .slice(0, 5)
                          .map((band, i) => (
                            <div
                              key={i}
                              onClick={() => setNewEvent({
                                ...newEvent, 
                                band_name: band.name,
                                band_rating: band.rating,
                                band_vibe: band.vibe
                              })}
                              style={{
                                padding: '0.5rem',
                                cursor: 'pointer',
                                borderBottom: '1px solid #f3f4f6',
                                fontSize: '0.875rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <span>{band.name}</span>
                              <span style={{
                                fontSize: '0.75rem',
                                color: band.rating >= 4 ? '#10b981' : '#6b7280'
                              }}>
                                {band.rating >= 4 ? '⭐' : band.rating}/5
                              </span>
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                  
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                      Band Rating: {newEvent.band_rating}/10
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newEvent.band_rating}
                      onChange={(e) => setNewEvent({...newEvent, band_rating: parseInt(e.target.value)})}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Band Vibe (e.g., Chill, Party, Rock)"
                    value={newEvent.band_vibe}
                    onChange={(e) => setNewEvent({...newEvent, band_vibe: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      marginBottom: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </>
              )}

              {newEvent.event_type === 'dinner' && (
                <div style={{
                  backgroundColor: '#fef3c7',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '0.75rem'
                }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: '600', color: '#92400e' }}>
                    🍽️ Family Dinner Setup
                  </h4>
                  <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                    Add items for people to sign up to bring:
                  </p>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <input
                      type="text"
                      placeholder="Add item (e.g., Salad, Drinks, Dessert)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const item = e.target.value.trim();
                          if (item) {
                            setDinnerItems([...dinnerItems, { name: item, assignedTo: null }]);
                            e.target.value = '';
                          }
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.25rem',
                        fontSize: '0.875rem'
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = e.target.previousElementSibling;
                        const item = input.value.trim();
                        if (item) {
                          setDinnerItems([...dinnerItems, { name: item, assignedTo: null }]);
                          input.value = '';
                        }
                      }}
                      style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.875rem'
                      }}
                    >
                      Add
                    </button>
                  </div>

                  {dinnerItems.length > 0 && (
                    <div>
                      <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '600' }}>
                        Items to bring:
                      </h5>
                      {dinnerItems.map((item, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.5rem',
                          backgroundColor: 'white',
                          borderRadius: '0.25rem',
                          marginBottom: '0.25rem'
                        }}>
                          <span style={{ fontSize: '0.875rem' }}>{item.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setDinnerItems(dinnerItems.filter((_, i) => i !== index));
                            }}
                            style={{
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.75rem'
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  style={{
                    flex: 1,
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;