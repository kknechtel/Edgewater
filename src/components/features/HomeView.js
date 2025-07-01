import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchWeatherData, fetchSurfReport, startWeatherUpdates } from '../../services/weatherService';
import { bandGuideData } from '../../data/bandGuideData';
import { locationService } from '../../services/locationService';
import { notificationService } from '../../services/notificationService';
import { rsvpService } from '../../services/rsvpService';

const HomeView = ({ setActiveTab }) => {
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({
    temp: 78,
    condition: 'Sunny',
    wind: '12 mph SW',
    humidity: 65,
    uvIndex: 7,
    feelsLike: 82
  });
  
  const [surfReport, setSurfReport] = useState({
    waveHeight: "4-6 ft",
    tide: "High tide 6:45 AM",
    quality: "Good",
    crowd: "Moderate",
    waterTemp: 72
  });

  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [forecastView, setForecastView] = useState('current'); // 'current', 'hourly', 'extended'
  const [locationData, setLocationData] = useState(null);
  const [localTime, setLocalTime] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    // Initialize location and time
    initializeLocation();
    
    // Update time every minute with location awareness
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (locationData) {
        setLocalTime(locationService.getLocalTimeObject());
      }
    }, 60000);
    
    return () => clearInterval(timer);
  }, [locationData]);

  useEffect(() => {
    // Check for unread messages
    checkUnreadMessages();
    
    // Set up periodic check for new messages
    const messageCheckTimer = setInterval(checkUnreadMessages, 30000); // Check every 30 seconds
    
    return () => clearInterval(messageCheckTimer);
  }, []);

  const initializeLocation = async () => {
    try {
      const location = await locationService.getLocation();
      setLocationData(location);
      setLocalTime(locationService.getLocalTimeObject());
      
      // Show location confirmation
      notificationService.showToast(
        `Weather for ${location.city}, ${location.state || location.country}`,
        'info',
        3000
      );
    } catch (error) {
      console.error('Error getting location:', error);
      // Fallback to default location
      setLocationData(locationService.defaultLocation);
      setLocalTime(locationService.getLocalTimeObject());
    }
  };

  const checkUnreadMessages = () => {
    try {
      const savedUnread = localStorage.getItem('beach_club_unread');
      if (savedUnread) {
        const unreadMap = new Map(JSON.parse(savedUnread));
        const totalUnread = Array.from(unreadMap.values()).reduce((sum, count) => sum + count, 0);
        setUnreadMessages(totalUnread);
      }
    } catch (error) {
      console.error('Error checking unread messages:', error);
    }
  };

  useEffect(() => {
    // Removed automatic test RSVP creation
    
    fetchUpcomingEvents();
    
    // Fetch weather and surf data with location
    const loadWeatherData = async () => {
      try {
        const location = await locationService.getLocation();
        const coordinates = {
          lat: location.latitude,
          lon: location.longitude,
          timezone: location.timezone
        };
        
        const weatherData = await fetchWeatherData(coordinates);
        const surfData = await fetchSurfReport();
        
        // Override weather if temperature seems wrong (add reasonable bounds)
        if (weatherData.temp < 40 || weatherData.temp > 110) {
          console.warn(`Weather temp ${weatherData.temp}°F seems wrong, using fallback`);
          weatherData.temp = 75; // Reasonable beach temperature
          weatherData.feelsLike = 78;
          weatherData.condition = 'Partly Cloudy';
        }
        
        console.log(`Current weather: ${weatherData.temp}°F, ${weatherData.condition}`);
        setWeather(weatherData);
        setSurfReport(surfData);
      } catch (error) {
        console.error('Error loading weather with location:', error);
        // Fallback to default weather
        const weatherData = await fetchWeatherData();
        const surfData = await fetchSurfReport();
        setWeather(weatherData);
        setSurfReport(surfData);
      }
    };
    
    loadWeatherData();
    
    // Set up auto-refresh
    const cleanup = startWeatherUpdates(({ weather, surf }) => {
      setWeather(weather);
      setSurfReport(surf);
    });
    
    return cleanup;
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      console.log('🔍 FETCHING EVENTS - FUCK THE API, USING CALENDAR DATA DIRECTLY');
      
      // ONLY USE REAL CALENDAR DATA - NO FAKE EVENTS
      let eventsArray = [];
        
        // Load music band events from localStorage
        const savedBands = localStorage.getItem('beach_bands');
        const bandEvents = savedBands ? JSON.parse(savedBands).map(band => ({
          id: `band-${band.id}`,
          title: `${band.name} Live`,
          description: `${band.genre} band performing at the beach`,
          event_date: band.date,
          event_time: band.time,
          location: 'Beach Stage',
          event_type: 'concert'
        })) : [];
        
        // Add real band events from bandGuideData using proper date parsing
        const realBandEvents = [];
        const currentYear = new Date().getFullYear();
        
        const parseBandDates = (dateString) => {
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
                return new Date(currentYear, monthIndex, parseInt(day));
              }
            }
            return null;
          }).filter(date => date !== null);
        };
        
        bandGuideData.categories.forEach(category => {
          category.bands.forEach(band => {
            if (band.date) {
              const dates = parseBandDates(band.date);
              const times = band.time ? band.time.split('/').map(t => t.trim()) : ['6:00 PM'];
              
              dates.forEach((eventDate, index) => {
                if (eventDate) {
                  realBandEvents.push({
                    id: `real-band-${band.name}-${eventDate.getTime()}`,
                    title: band.name,
                    description: band.vibe || band.description,
                    event_date: eventDate.toISOString(),
                    event_time: times[index] || times[0] || band.time || '6:00 PM',
                    location: 'Beach Stage',
                    event_type: 'concert',
                    band_rating: band.rating,
                    band_category: category.name
                  });
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
            description: `${tournament.type}-player Bags Tournament`,
            event_date: tournament.date,
            event_time: tournament.time || '12:00 PM',
            location: 'Bags Court',
            event_type: 'tournament'
          })) : [];
        
        // Combine all events (including real band data)
        const allEvents = [...eventsArray, ...bandEvents, ...tournamentEvents, ...realBandEvents];
        
        // Get only future events, sorted by date
        const futureEvents = allEvents
          .filter(event => new Date(event.event_date) >= new Date())
          .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
          .slice(0, 3);
        
        // USE REAL RSVP DATA FROM RSVP SERVICE
        futureEvents.forEach(event => {
          event.attendees = rsvpService.getEventAttendees(event.id);
        });
        
        console.log('🎉 FINAL EVENTS TO DISPLAY:', futureEvents.length, 'with attendees');
        setUpcomingEvents(futureEvents);
    } catch (error) {
      console.error('Error in fetchUpcomingEvents:', error);
      // Even if there's an error, we should have test events loaded at the start
      setUpcomingEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = (event) => {
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
      fetchUpcomingEvents();
    } else {
      notificationService.showToast('Error updating RSVP', 'error');
    }
  };

  const getEventIcon = (eventType) => {
    switch(eventType) {
      case 'party': return '🎉';
      case 'concert': return '🎸';
      case 'gathering': return '🏖️';
      case 'dinner': return '🍽️';
      default: return '📅';
    }
  };

  const getEventColor = (eventType) => {
    switch(eventType) {
      case 'party': return 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
      case 'concert': return 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)';
      case 'gathering': return 'linear-gradient(135deg, #34d399 0%, #10b981 100%)';
      case 'dinner': return 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)';
      default: return 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)';
    }
  };

  const getWeatherIcon = () => {
    switch(weather.condition.toLowerCase()) {
      case 'sunny': return '☀️';
      case 'cloudy': return '☁️';
      case 'rainy': return '🌧️';
      case 'stormy': return '⛈️';
      default: return '⛅';
    }
  };

  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #e0f2fe 0%, #bae6fd 100%)',
      paddingBottom: '5rem'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
        color: 'white',
        padding: '1.5rem',
        borderBottomLeftRadius: '2rem',
        borderBottomRightRadius: '2rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '1rem' 
        }}>
          <h1 style={{ 
            fontSize: '1.875rem', 
            fontWeight: '700',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🏖️ Clubbers
          </h1>
          <button
            onClick={logout}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(4px)',
              color: 'white',
              border: 'none',
              padding: '0.375rem 0.75rem',
              borderRadius: '1rem',
              fontSize: '0.75rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
        <p style={{ fontSize: '1.125rem', opacity: 0.9, margin: 0 }}>
          Welcome back, {user?.first_name || 'Beach Lover'}!
        </p>
        <div style={{ fontSize: '0.875rem', opacity: 0.75, marginTop: '0.25rem' }}>
          {localTime ? (
            <>
              <p style={{ margin: 0 }}>{localTime.dateString}</p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem' }}>
                📍 {locationData?.city}, {locationData?.state} • {localTime.timeString}
              </p>
            </>
          ) : (
            <p style={{ margin: 0 }}>
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          )}
        </div>
      </div>

      {/* Weather & Surf Report Widget */}
      <div style={{ padding: '1rem', marginTop: '-1.5rem', position: 'relative', zIndex: 10 }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <h2 style={{
              fontSize: '1.125rem',
              fontWeight: '700',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {getWeatherIcon()} Weather & Surf
            </h2>
            
            {/* Forecast Toggle Buttons */}
            <div style={{
              display: 'flex',
              gap: '0.25rem',
              backgroundColor: '#f3f4f6',
              padding: '0.125rem',
              borderRadius: '0.5rem'
            }}>
              <button
                onClick={() => setForecastView('current')}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.625rem',
                  border: 'none',
                  borderRadius: '0.375rem',
                  backgroundColor: forecastView === 'current' ? '#0891b2' : 'transparent',
                  color: forecastView === 'current' ? 'white' : '#6b7280',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Now
              </button>
              <button
                onClick={() => setForecastView('hourly')}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.625rem',
                  border: 'none',
                  borderRadius: '0.375rem',
                  backgroundColor: forecastView === 'hourly' ? '#0891b2' : 'transparent',
                  color: forecastView === 'hourly' ? 'white' : '#6b7280',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Hourly
              </button>
              <button
                onClick={() => setForecastView('extended')}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.625rem',
                  border: 'none',
                  borderRadius: '0.375rem',
                  backgroundColor: forecastView === 'extended' ? '#0891b2' : 'transparent',
                  color: forecastView === 'extended' ? 'white' : '#6b7280',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                7-Day
              </button>
            </div>
          </div>

          {/* Current Weather View */}
          {forecastView === 'current' && (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)',
                  borderRadius: '0.75rem',
                  padding: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>{weather.temp}°F</p>
                      <p style={{ fontSize: '0.875rem', color: '#92400e', margin: 0 }}>
                        {weather.condition}
                      </p>
                    </div>
                    <span style={{ fontSize: '2rem' }}>{getWeatherIcon()}</span>
                  </div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #dbeafe 0%, #60a5fa 100%)',
                  borderRadius: '0.75rem',
                  padding: '0.75rem'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <span>💨</span>
                      <span style={{ color: '#1e3a8a' }}>{weather.wind}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <span>💧</span>
                      <span style={{ color: '#1e3a8a' }}>{weather.humidity}%</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <span>☀️</span>
                      <span style={{ color: '#dc2626' }}>UV {weather.uvIndex}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Surf Report Section */}
              <div style={{
                background: 'linear-gradient(135deg, #5eead4 0%, #14b8a6 100%)',
                borderRadius: '0.75rem',
                padding: '1rem'
              }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <span style={{ fontSize: '1.25rem' }}>🌊</span>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#134e4a',
                margin: 0
              }}>
                Surf Conditions
              </h3>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem'
            }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#065f46', margin: '0 0 0.125rem 0' }}>
                  Wave Height
                </p>
                <p style={{ fontWeight: '700', color: '#064e3b', margin: 0 }}>
                  {surfReport.waveHeight}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#065f46', margin: '0 0 0.125rem 0' }}>
                  Quality
                </p>
                <p style={{ fontWeight: '700', color: '#064e3b', margin: 0 }}>
                  {surfReport.quality} 🌊
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#065f46', margin: '0 0 0.125rem 0' }}>
                  Swell
                </p>
                <p style={{ fontWeight: '700', color: '#064e3b', margin: 0 }}>
                  {surfReport.swellDirection || 'SE'} {surfReport.period || '8s'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#065f46', margin: '0 0 0.125rem 0' }}>
                  Water Temp
                </p>
                <p style={{ fontWeight: '700', color: '#064e3b', margin: 0 }}>
                  {surfReport.waterTemp}°F
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#065f46', margin: '0 0 0.125rem 0' }}>
                  Tide
                </p>
                <p style={{ fontWeight: '700', color: '#064e3b', fontSize: '0.875rem', margin: 0 }}>
                  {surfReport.tide}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#065f46', margin: '0 0 0.125rem 0' }}>
                  Crowd
                </p>
                <p style={{ fontWeight: '700', color: '#064e3b', margin: 0 }}>
                  {surfReport.crowd}
                </p>
              </div>
            </div>
          </div>
            </>
          )}

          {/* Hourly Forecast View */}
          {forecastView === 'hourly' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.5rem'
            }}>
              {weather.hourly && weather.hourly.slice(0, 8).map((hour, index) => (
                <div key={index} style={{
                  background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                  borderRadius: '0.5rem',
                  padding: '0.5rem',
                  textAlign: 'center'
                }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                    {hour.time}
                  </p>
                  <p style={{ fontSize: '1.5rem', margin: '0 0 0.125rem 0' }}>
                    {hour.icon}
                  </p>
                  <p style={{ fontSize: '0.875rem', fontWeight: '700', margin: 0 }}>
                    {hour.temp}°
                  </p>
                  <p style={{ fontSize: '0.625rem', color: '#6b7280', margin: 0 }}>
                    {hour.condition}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Extended 7-Day Forecast View */}
          {forecastView === 'extended' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {weather.daily && weather.daily.map((day, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem'
                }}>
                  <div style={{ flex: '1' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>
                      {day.day}
                    </p>
                    <p style={{ fontSize: '0.625rem', color: '#6b7280', margin: 0 }}>
                      {day.date}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{day.icon}</span>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '0.75rem', margin: 0 }}>{day.condition}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: '700', margin: 0 }}>
                        {day.high}°
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                        {day.low}°
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events Widget */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          padding: '1rem'
        }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: '700',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            📅 Upcoming Events
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {loading ? (
              <p style={{ textAlign: 'center', color: '#6b7280' }}>Loading events...</p>
            ) : upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  style={{
                    backgroundImage: getEventColor(event.event_type),
                    color: 'white',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    cursor: 'pointer',
                    transform: 'scale(1)',
                    transition: 'transform 0.2s'
                  }}
                  onClick={() => setActiveTab('calendar')}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        margin: '0 0 0.25rem 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'white',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                      }}>
                        <span style={{ fontSize: '1.5rem' }}>{getEventIcon(event.event_type)}</span>
                        {event.title || 'TEST EVENT TITLE'}
                      </h3>
                      <div style={{ opacity: 0.9 }}>
                        <p style={{ fontSize: '0.875rem', margin: 0 }}>
                          {formatEventDate(event.event_date)} • {new Date(event.event_date).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit' 
                          })}
                        </p>
                        {event.attendees && event.attendees.length > 0 && (
                          <p style={{ fontSize: '0.75rem', margin: '0.25rem 0 0 0' }}>
                            👥 {event.attendees.length} going
                          </p>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRSVP(event);
                        }}
                        style={{
                          backgroundColor: rsvpService.getUserRSVPStatus(event.id, user?.id) === 'going' 
                            ? 'rgba(34, 197, 94, 0.9)' 
                            : 'rgba(255,255,255,0.2)',
                          backdropFilter: 'blur(4px)',
                          border: 'none',
                          color: 'white',
                          padding: '0.375rem 0.75rem',
                          borderRadius: '1rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        {rsvpService.getUserRSVPStatus(event.id, user?.id) === 'going' ? '✓ Going' : '+ RSVP'}
                      </button>
                      <button 
                        onClick={() => setActiveTab('calendar')}
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          backdropFilter: 'blur(4px)',
                          border: 'none',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '1rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#6b7280'
              }}>
                <p style={{ marginBottom: '1rem' }}>No upcoming events</p>
                <button
                  onClick={() => setActiveTab('calendar')}
                  style={{
                    backgroundColor: '#0891b2',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Create Event
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab('calendar')}
            style={{
              width: '100%',
              marginTop: '1rem',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '0.75rem',
              padding: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
          >
            View All Events →
          </button>
        </div>

        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '0.75rem',
          marginTop: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            padding: '0.75rem',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            cursor: 'pointer'
          }}
          onClick={() => setActiveTab('sasqwatch')}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>👣</div>
            <p style={{ fontSize: '0.625rem', color: '#6b7280', margin: '0 0 0.125rem 0' }}>
              3 Sightings
            </p>
            <p style={{ fontSize: '0.875rem', fontWeight: '700', margin: 0 }}>
              This Week
            </p>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            padding: '0.75rem',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            cursor: 'pointer'
          }}
          onClick={() => setActiveTab('bags')}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>🎯</div>
            <p style={{ fontSize: '0.625rem', color: '#6b7280', margin: '0 0 0.125rem 0' }}>
              Tournament
            </p>
            <p style={{ fontSize: '0.875rem', fontWeight: '700', margin: 0 }}>
              Sunday
            </p>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            padding: '0.75rem',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            cursor: 'pointer'
          }}
          onClick={() => setActiveTab('calendar')}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>🎸</div>
            <p style={{ fontSize: '0.625rem', color: '#6b7280', margin: '0 0 0.125rem 0' }}>
              Live Music
            </p>
            <p style={{ fontSize: '0.875rem', fontWeight: '700', margin: 0 }}>
              Saturday
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;