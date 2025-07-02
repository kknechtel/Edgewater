import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchWeatherData, fetchSurfReport } from '../services/weatherService';
import { rsvpService } from '../services/rsvpService';
import { eventService } from '../services/api';
import { bandGuideData } from '../data/bandGuideData';
import { commentsService } from '../services/commentsService';
import { getMobileOptimizedStyles } from '../utils/mobileStyles';
import HomeEventsSection from './HomeEventsSection';

const HomeView = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [surfData, setSurfData] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentSightings, setRecentSightings] = useState(0);
  const [activeWeatherTab, setActiveWeatherTab] = useState('current');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    loadDashboardData();
    return () => clearInterval(timer);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load weather and surf data in background - don't block UI
      Promise.all([
        fetchWeatherData(),
        fetchSurfReport()
      ]).then(([weatherData, surfReport]) => {
        setWeather(weatherData);
        setSurfData(surfReport);
      }).catch(error => {
        console.error('Error loading weather data:', error);
      });

      // Load events
      await loadUpcomingEvents();

      // Load recent sightings count
      const sightings = JSON.parse(localStorage.getItem('sasquatch_sightings') || '[]');
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentCount = sightings.filter(s => new Date(s.timestamp) > weekAgo).length;
      setRecentSightings(recentCount);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const parseBandDates = (dateString) => {
    const currentYear = new Date().getFullYear();
    const dates = dateString.split(',').map(d => d.trim());
    
    return dates.map(dateStr => {
      const parts = dateStr.split(' ');
      if (parts.length >= 2) {
        const month = parts[0];
        const day = parts[1];
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const monthIndex = monthNames.indexOf(month);
        if (monthIndex !== -1 && day) {
          // Try current year first, then next year if the date has passed
          let parsedDate = new Date(currentYear, monthIndex, parseInt(day));
          const today = new Date();
          
          // If the date is in the past, try next year
          if (parsedDate < today) {
            parsedDate = new Date(currentYear + 1, monthIndex, parseInt(day));
          }
          
          return parsedDate;
        }
      }
      return null;
    }).filter(date => date !== null);
  };

  const loadUpcomingEvents = async () => {
    try {
      // Load events from backend API  
      let apiEvents = [];
      try {
        const response = await eventService.getAllEvents();
        const rawEvents = Array.isArray(response) ? response : (response.events || response.data || []);
        
        // Transform API events to match expected format
        apiEvents = rawEvents.map(event => ({
          ...event,
          event_date: event.date ? event.date.split('T')[0] : event.event_date,
          event_time: event.date ? 
            new Date(event.date).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit', 
              hour12: true 
            }) : (event.event_time || 'Time TBD'),
          event_type: event.event_type || 'other'
        }));
      } catch (error) {
        console.log('API events failed, using empty array:', error);
        apiEvents = [];
      }
      
      // Load band events from bandGuideData (same logic as EnhancedCalendarView)
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
      
      // Load bags tournament events from localStorage (same as EnhancedCalendarView)
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
      
      // Filter and sort upcoming events
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today
      
      const upcoming = allEvents
        .filter(event => {
          const eventDate = new Date(event.event_date || event.date);
          return eventDate >= now;
        })
        .sort((a, b) => {
          const dateA = new Date(a.event_date || a.date);
          const dateB = new Date(b.event_date || b.date);
          return dateA - dateB;
        })
        .slice(0, 5); // Show first 5 upcoming events
      
      // Add demo events if we don't have any upcoming events
      let finalEvents = upcoming;
      if (upcoming.length === 0) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextMonth = new Date();
        nextMonth.setDate(nextMonth.getDate() + 30);
        
        finalEvents = [
          {
            id: 'demo-event-1',
            title: 'Beach Volleyball Tournament',
            description: 'Join us for a fun volleyball tournament on the beach!',
            event_date: tomorrow.toISOString().split('T')[0],
            event_time: '2:00 PM',
            location: 'Main Beach Court',
            event_type: 'tournament'
          },
          {
            id: 'demo-event-2',
            title: 'Live Music - The Wave Riders',
            description: 'Enjoy live music by the beach with The Wave Riders band',
            event_date: nextWeek.toISOString().split('T')[0],
            event_time: '6:00 PM',
            location: 'Beach Stage',
            event_type: 'concert'
          },
          {
            id: 'demo-event-3',
            title: 'Sunrise Yoga Session',
            description: 'Start your day with peaceful yoga by the ocean',
            event_date: nextMonth.toISOString().split('T')[0],
            event_time: '7:00 AM',
            location: 'East Beach',
            event_type: 'gathering'
          }
        ];
      }
      
      // Enrich with RSVP data and comments
      const enrichedEvents = finalEvents.map(event => ({
        ...event,
        attendees: rsvpService.getEventAttendees(event.id),
        attendeeCount: rsvpService.getAttendeeCount(event.id),
        comments: commentsService.getEventComments(event.id),
        commentCount: commentsService.getCommentCount(event.id),
        userRsvp: rsvpService.getUserRsvp(event.id, user?.id)
      }));
      
      setUpcomingEvents(enrichedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      setUpcomingEvents([]);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getEventDateLabel = (dateStr) => {
    const eventDate = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (eventDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (eventDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  const handleRsvp = async (eventId) => {
    if (!user) {
      setActiveTab('profile');
      return;
    }
    
    const currentRsvp = rsvpService.getUserRsvp(eventId, user.id);
    if (currentRsvp) {
      rsvpService.removeRsvp(eventId, user.id);
    } else {
      rsvpService.addRsvp(eventId, {
        userId: user.id,
        userName: user.display_name || user.first_name || 'Anonymous',
        status: 'going'
      });
    }
    
    loadUpcomingEvents(); // Refresh events
  };

  // Get mobile-optimized styles
  const mobileStyles = getMobileOptimizedStyles();
  
  const styles = {
    // Use mobile-optimized container, header, content, card styles
    container: mobileStyles.container,
    header: mobileStyles.header,
    content: mobileStyles.content,
    card: mobileStyles.card,
    
    // Custom styles that build on mobile optimization
    headerTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: mobileStyles.spacing.sm
    },
    logo: {
      ...mobileStyles.title,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    headerButtons: {
      display: 'flex',
      gap: '0.5rem'
    },
    btnIcon: {
      backgroundColor: '#f3f4f6',
      border: '1px solid #e5e7eb',
      padding: mobileStyles.spacing.sm,
      borderRadius: '0.75rem',
      fontSize: mobileStyles.breakpoints.isMobile ? '1.125rem' : '1.25rem',
      cursor: 'pointer',
      minWidth: '44px',
      minHeight: '44px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    btnPrimary: {
      ...mobileStyles.primaryButton,
      padding: `${mobileStyles.spacing.sm} ${mobileStyles.spacing.md}`
    },
    welcomeText: {
      fontSize: mobileStyles.breakpoints.isMobile ? '1rem' : '1.125rem',
      color: '#4b5563',
      fontWeight: '500'
    },
    locationText: {
      ...mobileStyles.subtitle,
      marginTop: '0.25rem'
    },
    cardTitle: {
      fontSize: mobileStyles.breakpoints.isMobile ? '1.125rem' : '1.25rem',
      fontWeight: '600',
      marginBottom: mobileStyles.spacing.sm,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: '#111827'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div style={styles.logo}>
            <span>🌊</span>
            Clubbers
          </div>
          <div style={styles.headerButtons}>
            <button 
              style={styles.btnIcon}
              onClick={() => setActiveTab('profile')}
            >
              ⚙️
            </button>
          </div>
        </div>
        <div>
          <p style={styles.welcomeText}>
            Welcome back, {user?.display_name || user?.first_name || 'Beach Lover'}!
          </p>
          <p style={styles.locationText}>
            {formatDate(currentTime)} • 📍 Sea Bright, NJ
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        {/* Weather Card with Tabs */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            <span>☀️</span> Weather & Surf
          </h2>
          
          {/* Weather Tabs - Mobile Optimized */}
          <div style={mobileStyles.weatherTabContainer}>
            {[
              { id: 'current', label: 'Current', icon: '☀️' },
              { id: 'hourly', label: 'Hourly', icon: '🕐' },
              { id: 'daily', label: '7-Day', icon: '📆' },
              { id: 'surf', label: 'Surf', icon: '🏄' }
            ].map(tab => {
              const isActive = activeWeatherTab === tab.id;
              return (
                <button
                  key={tab.id}
                  style={mobileStyles.weatherTab(isActive)}
                  onClick={() => setActiveWeatherTab(tab.id)}
                >
                  <span style={{ fontSize: '1rem' }}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Weather Content Based on Active Tab */}
          {activeWeatherTab === 'current' && (
            <>
              <div style={{
                ...mobileStyles.gridTwoColumn,
                marginBottom: mobileStyles.spacing.lg
              }}>
                <div style={{
                  backgroundColor: '#ecfeff',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  border: '1px solid rgba(8, 145, 178, 0.2)'
                }}>
                  <div style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: '#0891b2'
                  }}>
                    {weather?.temp || '--'}°
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    color: '#4b5563'
                  }}>
                    {weather?.condition || 'Loading...'}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    marginTop: '0.25rem'
                  }}>
                    Feels like {weather?.feelsLike || '--'}°
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#4b5563'
                  }}>
                    <span>💨</span>
                    <span>{weather?.wind || 'Loading...'}</span>
                  </div>
                  <div style={{
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#4b5563'
                  }}>
                    <span>💧</span>
                    <span>{weather?.humidity || '--'}% humidity</span>
                  </div>
                  {weather?.uvIndex >= 7 && (
                    <div style={{
                      backgroundColor: '#fef3c7',
                      color: '#f59e0b',
                      fontWeight: '600',
                      borderRadius: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem'
                    }}>
                      <span>☀️</span>
                      <span>UV Index: {weather.uvIndex}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeWeatherTab === 'hourly' && weather?.hourly && (
            <div style={{
              display: 'flex',
              overflowX: 'auto',
              gap: '0.75rem',
              paddingBottom: '0.5rem',
              WebkitOverflowScrolling: 'touch'
            }}>
              {weather.hourly.slice(0, 12).map((hour, index) => (
                <div key={index} style={{
                  backgroundColor: '#f3f4f6',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  minWidth: '100px',
                  textAlign: 'center',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                    {hour.time}
                  </div>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {hour.icon}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#111827' }}>
                    {hour.temp}°
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    {hour.condition}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeWeatherTab === 'daily' && weather?.daily && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {weather.daily.map((day, index) => (
                <div key={index} style={{
                  backgroundColor: '#f3f4f6',
                  borderRadius: '0.75rem',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '1.5rem' }}>{day.icon}</div>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: '600', color: '#111827' }}>
                        {day.day}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {day.condition}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1rem', fontWeight: '600', color: '#111827' }}>
                      {day.high}°
                    </span>
                    <span style={{ fontSize: '1rem', color: '#6b7280', marginLeft: '0.75rem' }}>
                      {day.low}°
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeWeatherTab === 'surf' && (
            <div style={{
              backgroundColor: '#f3f4f6',
              borderRadius: '0.75rem',
              padding: '1rem',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#111827'
              }}>
                <span>🏄</span> Surf Conditions
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Waves</div>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#0891b2' }}>
                    {surfData?.waveHeight || 'Loading...'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Quality</div>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#10b981' }}>
                    {surfData?.quality || 'Loading...'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Water Temp</div>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#111827' }}>
                    {surfData?.waterTemp || '--'}°F
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Crowd</div>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#111827' }}>
                    {surfData?.crowd || 'Loading...'}
                  </div>
                </div>
              </div>
              <div style={{
                marginTop: '0.75rem',
                padding: '0.5rem',
                backgroundColor: '#ffffff',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                color: '#4b5563',
                textAlign: 'center'
              }}>
                {surfData?.tide || 'Tide info loading...'}
              </div>
            </div>
          )}
        </div>


        {/* Events Section - Protected in separate component */}
        <HomeEventsSection 
          upcomingEvents={upcomingEvents}
          setActiveTab={setActiveTab}
          handleRsvp={handleRsvp}
          getEventDateLabel={getEventDateLabel}
          styles={styles}
        />

        {/* Quick Actions - Mobile Responsive */}
        <div style={mobileStyles.gridThreeColumn}>
          <div 
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
              padding: '1rem',
              cursor: 'pointer',
              textAlign: 'center',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
              transition: 'all 0.2s',
              minHeight: '100px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => setActiveTab('messages')}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</div>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.125rem' }}>
              Beach Chat
            </p>
            <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0891b2' }}>
              Active Now
            </p>
          </div>
          
          <div 
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
              padding: '1rem',
              cursor: 'pointer',
              textAlign: 'center',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
              transition: 'all 0.2s',
              minHeight: '100px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => setActiveTab('bags')}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.125rem' }}>
              Bags
            </p>
            <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#f59e0b' }}>
              Quick Game
            </p>
          </div>
          
          <div 
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
              padding: '1rem',
              cursor: 'pointer',
              textAlign: 'center',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
              transition: 'all 0.2s',
              minHeight: '100px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => setActiveTab('more')}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎸</div>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.125rem' }}>
              Live Music
            </p>
            <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#8b5cf6' }}>
              Band Guide
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;