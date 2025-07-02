import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchWeatherData, fetchSurfReport } from '../services/weatherService';
import { rsvpService } from '../services/rsvpService';
import { unifiedEventService } from '../services/unifiedEventService';
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

      // Clear cache and load events
      unifiedEventService.clearCache();
      console.log('🏠 HomeView: Cleared cache, loading fresh 2025 events');
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
      console.log('🏠 Loading events for HomeView with unified service...');
      
      // Use the unified event service to get upcoming events
      const upcomingEvents = await unifiedEventService.getUpcomingEvents(5);
      
      // Enrich with RSVP data and comments
      const enrichedEvents = upcomingEvents.map(event => ({
        ...event,
        attendees: rsvpService.getEventAttendees(event.id),
        attendeeCount: rsvpService.getAttendeeCount(event.id),
        comments: commentsService.getEventComments(event.id),
        commentCount: commentsService.getCommentCount(event.id),
        userRsvp: rsvpService.getUserRSVPStatus(event.id, user?.id)
      }));
      
      console.log('✅ HomeView loaded', enrichedEvents.length, 'unified events');
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
    
    const currentRsvp = rsvpService.getUserRSVPStatus(eventId, user.id);
    if (currentRsvp === 'going') {
      rsvpService.rsvpToEvent(eventId, user.id, user.display_name || user.first_name || 'Anonymous', 'none');
    } else {
      rsvpService.rsvpToEvent(eventId, user.id, user.display_name || user.first_name || 'Anonymous', 'going');
    }
    
    // Clear the unified service cache and refresh events
    unifiedEventService.clearCache();
    loadUpcomingEvents();
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
      marginBottom: '0.25rem'
    },
    logo: {
      fontSize: mobileStyles.breakpoints.isMobile ? '1.25rem' : '1.5rem',
      fontWeight: '700',
      color: '#111827',
      display: 'flex',
      alignItems: 'center',
      gap: '0.375rem'
    },
    headerButtons: {
      display: 'flex',
      gap: '0.5rem'
    },
    btnIcon: {
      backgroundColor: '#f3f4f6',
      border: '1px solid #e5e7eb',
      padding: '0.5rem',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      cursor: 'pointer',
      minWidth: '36px',
      minHeight: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    btnPrimary: {
      ...mobileStyles.primaryButton,
      padding: `${mobileStyles.spacing.sm} ${mobileStyles.spacing.md}`
    },
    welcomeText: {
      fontSize: mobileStyles.breakpoints.isMobile ? '0.9375rem' : '1rem',
      color: '#4b5563',
      fontWeight: '500',
      lineHeight: '1.4',
      marginBottom: '0.125rem'
    },
    locationText: {
      fontSize: mobileStyles.breakpoints.isMobile ? '0.8125rem' : '0.875rem',
      color: '#6b7280',
      fontWeight: '400'
    },
    cardTitle: {
      fontSize: mobileStyles.breakpoints.isMobile ? '1rem' : '1.125rem',
      fontWeight: '600',
      marginBottom: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.375rem',
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
              aria-label="Open settings and profile"
              role="button"
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
                  aria-label={`View ${tab.label} weather information`}
                  aria-pressed={isActive}
                  role="tab"
                >
                  <span style={{ fontSize: '1rem' }} aria-hidden="true">{tab.icon}</span>
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
              gap: '0.5rem',
              paddingBottom: '0.25rem',
              WebkitOverflowScrolling: 'touch'
            }}>
              {weather.hourly.slice(0, 12).map((hour, index) => (
                <div key={index} style={{
                  backgroundColor: '#f3f4f6',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 0.5rem',
                  minWidth: '70px',
                  textAlign: 'center',
                  border: '1px solid #e5e7eb',
                  flexShrink: 0
                }}>
                  <div style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    {hour.time}
                  </div>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                    {hour.icon}
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827' }}>
                    {hour.temp}°
                  </div>
                  <div style={{ fontSize: '0.625rem', color: '#6b7280', marginTop: '0.125rem' }}>
                    {hour.condition.split(' ')[0]}
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
              minHeight: mobileStyles.breakpoints.isMobile ? '120px' : '100px',
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
              minHeight: mobileStyles.breakpoints.isMobile ? '120px' : '100px',
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
          
          <button 
            style={{
              backgroundColor: '#ffffff',
              border: '2px solid #e5e7eb',
              borderRadius: '1rem',
              padding: mobileStyles.spacing.lg,
              cursor: 'pointer',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s',
              minHeight: '140px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'scale(1)'
            }}
            onClick={() => setActiveTab('more')}
            onTouchStart={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)';
              e.currentTarget.style.borderColor = '#8b5cf6';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(139, 92, 246, 0.2)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = '#8b5cf6';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎸</div>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem', fontWeight: '500' }}>
              Live Music
            </p>
            <p style={{ fontSize: '1rem', fontWeight: '700', color: '#8b5cf6' }}>
              Band Guide
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeView;