import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchWeatherData, fetchSurfReport, startWeatherUpdates } from '../../services/weatherService';
import { bandGuideData } from '../../data/bandGuideData';

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

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchUpcomingEvents();
    
    // Fetch weather and surf data
    const loadWeatherData = async () => {
      const weatherData = await fetchWeatherData();
      const surfData = await fetchSurfReport();
      setWeather(weatherData);
      setSurfReport(surfData);
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
          event_type: 'concert'
        })) : [];
        
        // Add real band events from bandGuideData
        const today = new Date();
        const realBandEvents = [];
        bandGuideData.categories.forEach(category => {
          category.bands.forEach(band => {
            if (band.date) {
              // Split multiple dates
              const dates = band.date.split(',').map(d => d.trim());
              const times = band.time ? band.time.split('/').map(t => t.trim()) : [];
              
              dates.forEach((dateStr, index) => {
                // Parse date string (e.g., "June 21" → "June 21, 2025")
                const year = today.getFullYear();
                const eventDate = new Date(`${dateStr}, ${year}`);
                
                // If the date has passed this year, try next year
                if (eventDate < today) {
                  eventDate.setFullYear(year + 1);
                }
                
                realBandEvents.push({
                  id: `real-band-${band.name}-${dateStr}`,
                  title: `${band.name} Live`,
                  description: band.vibe || band.description,
                  event_date: eventDate.toISOString(),
                  event_time: times[index] || times[0] || band.time || '6:00 PM',
                  location: 'Beach Stage',
                  event_type: 'concert',
                  band_rating: band.rating,
                  band_category: category.name
                });
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
        setUpcomingEvents(futureEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setUpcomingEvents([]); // Set empty array on error
    } finally {
      setLoading(false);
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
      case 'party': return 'background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
      case 'concert': return 'background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)';
      case 'gathering': return 'background: linear-gradient(135deg, #34d399 0%, #10b981 100%)';
      case 'dinner': return 'background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%)';
      default: return 'background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)';
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
        <p style={{ fontSize: '0.875rem', opacity: 0.75, marginTop: '0.25rem' }}>
          {currentTime.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
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
                    ...{ getEventColor: getEventColor(event.event_type) },
                    background: getEventColor(event.event_type),
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
                        gap: '0.5rem'
                      }}>
                        <span style={{ fontSize: '1.5rem' }}>{getEventIcon(event.event_type)}</span>
                        {event.title}
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
                    <button style={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(4px)',
                      border: 'none',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '1rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}>
                      View
                    </button>
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
            <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>🦶</div>
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