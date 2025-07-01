import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchWeatherData, fetchSurfReport } from '../services/weatherService';
import { rsvpService } from '../services/rsvpService';
import { eventService } from '../services/api';
import '../styles/designSystem.css';

const HomeView = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [surfData, setSurfData] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentSightings, setRecentSightings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    loadDashboardData();
    return () => clearInterval(timer);
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load weather and surf data
      const [weatherData, surfReport] = await Promise.all([
        fetchWeatherData(),
        fetchSurfReport()
      ]);
      setWeather(weatherData);
      setSurfData(surfReport);

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
    } finally {
      setLoading(false);
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

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long',
      day: 'numeric'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
        <div className="text-lg text-muted">Loading beach conditions...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: 'var(--bg-secondary)', 
      minHeight: '100vh',
      paddingBottom: '5rem'
    }}>
      {/* Header */}
      <div className="card" style={{ 
        borderRadius: 0,
        marginBottom: 0,
        boxShadow: 'var(--shadow)',
        padding: 'var(--space-6)'
      }}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 'var(--text-3xl)' }}>🌊</span>
            <h1 className="text-2xl font-bold text-primary">Clubbers</h1>
          </div>
          <button 
            className="btn-icon"
            onClick={() => setActiveTab('profile')}
            style={{ fontSize: 'var(--text-xl)' }}
          >
            ⚙️
          </button>
        </div>
        
        <div>
          <p className="text-lg font-medium text-secondary">
            Welcome back, {user?.display_name || user?.first_name || 'Beach Lover'}!
          </p>
          <p className="text-sm text-muted">
            {formatDate(currentTime)} • 📍 Sea Bright, NJ
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: 'var(--space-4)' }}>
        {/* Weather & Surf Card */}
        <div className="card">
          <h2 className="card-title">
            <span>☀️</span> Weather & Surf
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-5)'
          }}>
            <div style={{
              backgroundColor: 'var(--primary-pale)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              border: '1px solid rgba(8, 145, 178, 0.2)'
            }}>
              <div className="text-3xl font-bold text-primary-blue">
                {weather?.temp || '--'}°
              </div>
              <div className="text-base text-secondary">
                {weather?.condition || 'Loading...'}
              </div>
              <div className="text-sm text-muted" style={{ marginTop: 'var(--space-1)' }}>
                Feels like {weather?.feelsLike || '--'}°
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div style={{
                backgroundColor: 'var(--gray-100)',
                borderRadius: 'var(--radius)',
                padding: 'var(--space-2) var(--space-3)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}>
                <span>💨</span>
                <span className="text-sm">{weather?.wind || 'Loading...'}</span>
              </div>
              <div style={{
                backgroundColor: 'var(--gray-100)',
                borderRadius: 'var(--radius)',
                padding: 'var(--space-2) var(--space-3)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}>
                <span>💧</span>
                <span className="text-sm">{weather?.humidity || '--'}% humidity</span>
              </div>
              {weather?.uvIndex >= 7 && (
                <div style={{
                  backgroundColor: '#fef3c7',
                  color: 'var(--warning)',
                  borderRadius: 'var(--radius)',
                  padding: 'var(--space-2) var(--space-3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  fontWeight: 'var(--font-semibold)'
                }}>
                  <span>☀️</span>
                  <span className="text-sm">UV Index: {weather.uvIndex}</span>
                </div>
              )}
            </div>
          </div>

          {/* Surf Report */}
          <div style={{
            backgroundColor: 'var(--gray-100)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            border: '1px solid var(--gray-200)'
          }}>
            <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
              <span>🏄</span> Surf Conditions
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 'var(--space-3)'
            }}>
              <div>
                <div className="text-xs text-muted">Waves</div>
                <div className="text-base font-semibold text-primary-blue">
                  {surfData?.waveHeight || 'Loading...'}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted">Quality</div>
                <div className="text-base font-semibold text-success">
                  {surfData?.quality || 'Loading...'}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted">Water Temp</div>
                <div className="text-base font-semibold">
                  {surfData?.waterTemp || '--'}°F
                </div>
              </div>
              <div>
                <div className="text-xs text-muted">Crowd</div>
                <div className="text-base font-semibold">
                  {surfData?.crowd || 'Loading...'}
                </div>
              </div>
            </div>
            <div style={{
              marginTop: 'var(--space-3)',
              padding: 'var(--space-2)',
              backgroundColor: 'var(--white)',
              borderRadius: 'var(--radius)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              textAlign: 'center'
            }}>
              {surfData?.tide || 'Tide info loading...'}
            </div>
          </div>
        </div>

        {/* Events Section */}
        <div className="card">
          <h2 className="card-title">
            <span>📅</span> Upcoming Events
          </h2>
          
          {upcomingEvents.length === 0 ? (
            <p className="text-muted">No upcoming events scheduled</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {upcomingEvents.map(event => (
                <div key={event.id} style={{
                  backgroundColor: 'var(--gray-100)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-4)',
                  border: '1px solid var(--gray-200)',
                  cursor: 'pointer',
                  transition: 'all var(--transition)'
                }}
                onClick={() => setActiveTab('calendar')}
                className="hover:shadow-md">
                  <div className="flex justify-between items-start">
                    <div style={{ flex: 1 }}>
                      <h3 className="text-lg font-semibold mb-1">{event.title}</h3>
                      <p className="text-sm text-secondary">
                        {getEventDateLabel(event.event_date)} • {event.event_time || 'Time TBD'}
                      </p>
                      <p className="text-sm text-muted mt-1">
                        👥 {event.attendeeCount || 0} attending
                      </p>
                    </div>
                    <button
                      className={`btn ${event.userRsvp ? 'btn-success' : 'btn-primary'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRsvp(event.id);
                      }}
                      style={{ minWidth: '80px' }}
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
          gap: 'var(--space-3)'
        }}>
          <div 
            className="card"
            style={{ 
              padding: 'var(--space-4)',
              textAlign: 'center',
              cursor: 'pointer',
              minHeight: '100px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => setActiveTab('sasqwatch')}
          >
            <div style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>👣</div>
            <div className="text-xs text-muted">Sightings</div>
            <div className="text-sm font-semibold text-success">
              {recentSightings} this week
            </div>
          </div>
          
          <div 
            className="card"
            style={{ 
              padding: 'var(--space-4)',
              textAlign: 'center',
              cursor: 'pointer',
              minHeight: '100px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => setActiveTab('bags')}
          >
            <div style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>🎯</div>
            <div className="text-xs text-muted">Bags</div>
            <div className="text-sm font-semibold text-warning">
              Quick Game
            </div>
          </div>
          
          <div 
            className="card"
            style={{ 
              padding: 'var(--space-4)',
              textAlign: 'center',
              cursor: 'pointer',
              minHeight: '100px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => setActiveTab('music')}
          >
            <div style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>🎸</div>
            <div className="text-xs text-muted">Live Music</div>
            <div className="text-sm font-semibold" style={{ color: 'var(--purple)' }}>
              Band Guide
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;