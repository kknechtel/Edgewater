import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchWeatherData, fetchSurfReport } from '../services/weatherService';
import { rsvpService } from '../services/rsvpService';
import { eventService } from '../services/api';

const HomeView = ({ setActiveTab }) => {
  console.log('HomeView mounted, setActiveTab:', typeof setActiveTab);
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [surfData, setSurfData] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentSightings, setRecentSightings] = useState(0);

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

  const loadUpcomingEvents = async () => {
    try {
      const response = await eventService.getEvents();
      const allEvents = response.data || [];
      
      // Filter and sort upcoming events
      const now = new Date();
      const upcoming = allEvents
        .filter(event => new Date(event.event_date) >= now)
        .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
        .slice(0, 3); // Show only next 3 events
      
      // Enrich with RSVP data
      const enrichedEvents = upcoming.map(event => ({
        ...event,
        attendeeCount: rsvpService.getAttendeeCount(event.id),
        userRsvp: rsvpService.getUserRsvp(event.id, user?.id)
      }));
      
      setUpcomingEvents(enrichedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
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

  const styles = {
    container: {
      minHeight: '100vh',
      paddingBottom: '5rem',
      backgroundColor: '#f9fafb'
    },
    header: {
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      padding: '1.5rem',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
    },
    headerTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem'
    },
    logo: {
      fontSize: '1.75rem',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: '#111827'
    },
    headerButtons: {
      display: 'flex',
      gap: '0.5rem'
    },
    btnIcon: {
      backgroundColor: '#f3f4f6',
      border: '1px solid #e5e7eb',
      padding: '0.5rem',
      borderRadius: '0.75rem',
      fontSize: '1.25rem',
      cursor: 'pointer',
      minWidth: '44px',
      minHeight: '44px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
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
      minHeight: '44px'
    },
    welcomeText: {
      fontSize: '1.125rem',
      color: '#4b5563',
      fontWeight: '500'
    },
    locationText: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginTop: '0.25rem'
    },
    content: {
      padding: '1rem'
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '0.75rem',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      padding: '1.5rem',
      marginBottom: '1rem'
    },
    cardTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '1rem',
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
        {/* Weather Card */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            <span>☀️</span> Weather & Surf
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '1.25rem'
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

          {/* Surf Report */}
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
        </div>

        {/* Hourly Forecast */}
        {weather?.hourly && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <span>🕐</span> Hourly Forecast
            </h2>
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
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  minWidth: '80px',
                  textAlign: 'center',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    {hour.time}
                  </div>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                    {hour.icon}
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827' }}>
                    {hour.temp}°
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7-Day Forecast */}
        {weather?.daily && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <span>📆</span> 7-Day Forecast
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {weather.daily.map((day, index) => (
                <div key={index} style={{
                  backgroundColor: '#f3f4f6',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ fontSize: '1.25rem' }}>{day.icon}</div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827' }}>
                        {day.day}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {day.condition}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827' }}>
                      {day.high}°
                    </span>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280', marginLeft: '0.5rem' }}>
                      {day.low}°
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Events Section */}
        <div style={styles.card}>
          <h2 
            style={{...styles.cardTitle, cursor: 'pointer'}}
            onClick={() => {
              console.log('Title clicked, calling setActiveTab');
              setActiveTab('calendar');
            }}
          >
            <span>📅</span> Upcoming Events
          </h2>
          
          {upcomingEvents.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No upcoming events scheduled</p>
          ) : (
            <div>
              {upcomingEvents.map(event => (
                <div 
                  key={event.id} 
                  style={{
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    border: '1px solid #e5e7eb',
                    marginBottom: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => {
                    console.log('Event clicked, calling setActiveTab');
                    setActiveTab('calendar');
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e5e7eb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        marginBottom: '0.25rem',
                        color: '#111827'
                      }}>
                        {event.title}
                      </h3>
                      <p style={{
                        fontSize: '0.875rem',
                        color: '#4b5563'
                      }}>
                        {getEventDateLabel(event.event_date)} • {event.event_time || 'Time TBD'}
                      </p>
                      <p style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        marginTop: '0.25rem'
                      }}>
                        👥 {event.attendeeCount || 0} attending
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRsvp(event.id);
                      }}
                      style={{
                        backgroundColor: event.userRsvp ? '#10b981' : '#0891b2',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.75rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        minHeight: '44px'
                      }}
                    >
                      {event.userRsvp ? '✓ Going' : 'RSVP'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem'
        }}>
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