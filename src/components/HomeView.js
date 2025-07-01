import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { bandGuideData } from '../data/bandGuideData';
import { rsvpService } from '../services/rsvpService';
import { commentsService } from '../services/commentsService';
import { eventService } from '../services/api';

const HomeView = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [surfData, setSurfData] = useState(null);
  const [nextEvent, setNextEvent] = useState(null);
  const [recentPhotos, setRecentPhotos] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    fetchWeatherData();
    loadNextEvent();
    loadRecentPhotos();
    return () => clearInterval(timer);
  }, []);

  const fetchWeatherData = async () => {
    try {
      const weatherResponse = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=43.09&longitude=-70.64&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&temperature_unit=fahrenheit&timezone=America%2FNew_York'
      );
      const weatherData = await weatherResponse.json();
      
      const marineResponse = await fetch(
        'https://marine-api.open-meteo.com/v1/marine?latitude=43.09&longitude=-70.64&daily=wave_height_max,wave_period_max&timezone=America%2FNew_York'
      );
      const marineData = await marineResponse.json();
      
      setWeather(weatherData);
      setSurfData(marineData);
    } catch (error) {
      console.error('Weather fetch error:', error);
    }
  };

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

  const loadNextEvent = async () => {
    try {
      // Load events from multiple sources
      let allEvents = [];
      
      // Load events from backend API  
      try {
        const response = await eventService.getAllEvents();
        const apiEvents = Array.isArray(response) ? response : (response.events || response.data || []);
        allEvents = [...allEvents, ...apiEvents];
      } catch (error) {
        console.log('API events failed, using other sources:', error);
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
          created_by: { email: tournament.createdBy || 'system' },
          source: 'bags',
          tournamentData: tournament
        })) : [];
      
      // Combine all events
      allEvents = [...allEvents, ...bandEvents, ...tournamentEvents];
      
      // Enrich events with attendee data from RSVP service
      const enrichedEvents = allEvents.map(event => ({
        ...event,
        attendees: rsvpService.getEventAttendees(event.id),
        attendeeCount: rsvpService.getAttendeeCount(event.id)
      }));
      
      // Get next upcoming event
      const upcoming = enrichedEvents
        .filter(e => new Date(e.event_date) >= new Date())
        .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))[0];
      
      setNextEvent(upcoming);
      console.log('Loaded next event:', upcoming);
    } catch (error) {
      console.error('Error loading next event:', error);
      setNextEvent(null);
    }
  };

  const loadRecentPhotos = () => {
    const photos = JSON.parse(localStorage.getItem('beach_photos') || '[]');
    setRecentPhotos(photos.slice(0, 4));
  };

  const getWeatherIcon = (code) => {
    if (code <= 1) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 48) return '☁️';
    if (code <= 67) return '🌧️';
    if (code <= 77) return '❄️';
    if (code <= 82) return '🌧️';
    if (code <= 99) return '⛈️';
    return '☀️';
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

  const quickLinks = [
    { id: 'weather', label: 'Weather', icon: '🌊', color: '#0891b2' },
    { id: 'music', label: 'Music', icon: '🎸', color: '#8b5cf6' },
    { id: 'photos', label: 'Photos', icon: '📸', color: '#ec4899' },
    { id: 'profile', label: 'Profile', icon: '⚙️', color: '#6b7280' }
  ];

  return (
    <div style={{
      backgroundColor: '#f0f9ff',
      minHeight: '100vh',
      paddingBottom: '2rem'
    }}>
      {/* Hero Section with Time */}
      <div style={{
        background: 'linear-gradient(135deg, #0891b2 0%, #0c4a6e 100%)',
        color: 'white',
        padding: '2rem 1rem 3rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Beach wave decoration */}
        <div style={{
          position: 'absolute',
          bottom: -2,
          left: 0,
          right: 0,
          height: '40px',
          background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z' fill='%23f0f9ff'/%3E%3C/svg%3E")`,
          backgroundSize: 'cover'
        }} />
        
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '300',
            margin: '0 0 0.5rem 0',
            letterSpacing: '0.05em'
          }}>
            {formatTime(currentTime)}
          </h1>
          <p style={{ 
            fontSize: '1.125rem',
            opacity: 0.9,
            margin: 0
          }}>
            {formatDate(currentTime)}
          </p>
          <p style={{
            fontSize: '1.5rem',
            margin: '1rem 0 0 0',
            fontWeight: '500'
          }}>
            Welcome back, {user?.display_name || user?.first_name || 'Beach Lover'}! 🏖️
          </p>
        </div>
      </div>

      {/* Weather Card */}
      {weather && (
        <div style={{
          margin: '1rem',
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          marginTop: '-2rem',
          position: 'relative',
          zIndex: 10
        }}
        onClick={() => {
          // Navigate to weather tab - you'll need to implement this
          window.location.href = '/weather';
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600',
              margin: 0,
              color: '#0c4a6e'
            }}>
              Current Conditions
            </h2>
            <span style={{ fontSize: '2.5rem' }}>
              {getWeatherIcon(weather.current_weather?.weathercode)}
            </span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#0891b2' }}>
                {Math.round(weather.current_weather?.temperature)}°F
              </p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                Feels great!
              </p>
            </div>
            {surfData && (
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0, color: '#0891b2' }}>
                  {surfData.daily?.wave_height_max?.[0]?.toFixed(1) || '0'} m waves
                </p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                  Surf conditions
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ padding: '1.5rem 1rem' }}>
        <h2 style={{ 
          fontSize: '1.125rem', 
          fontWeight: '600',
          marginBottom: '1rem',
          color: '#1f2937'
        }}>
          Quick Access
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '0.75rem' 
        }}>
          {quickLinks.map(link => (
            <button
              key={link.id}
              onClick={() => {
                if (link.id === 'weather') {
                  window.location.href = '/weather';
                } else if (link.id === 'music') {
                  window.location.href = '/music';
                } else if (link.id === 'photos') {
                  setActiveTab('photos');
                } else if (link.id === 'profile') {
                  window.location.href = '/profile';
                }
              }}
              style={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                padding: '1rem 0.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              <span style={{ 
                fontSize: '2rem',
                backgroundColor: `${link.color}20`,
                width: '3rem',
                height: '3rem',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {link.icon}
              </span>
              <span style={{ 
                fontSize: '0.75rem',
                color: '#4b5563',
                fontWeight: '500'
              }}>
                {link.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Next Event */}
      {nextEvent && (
        <div style={{ padding: '0 1rem 1.5rem' }}>
          <h2 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#1f2937'
          }}>
            Next Event
          </h2>
          <div 
            onClick={() => setActiveTab('calendar')}
            style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '1rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              cursor: 'pointer'
            }}
          >
            <h3 style={{ 
              fontSize: '1rem', 
              fontWeight: '600',
              margin: '0 0 0.5rem 0',
              color: '#0891b2'
            }}>
              {nextEvent.title}
            </h3>
            <p style={{ 
              fontSize: '0.875rem',
              color: '#6b7280',
              margin: 0
            }}>
              {new Date(nextEvent.event_date).toLocaleDateString()} at {nextEvent.event_time}
            </p>
          </div>
        </div>
      )}

      {/* Recent Photos */}
      {recentPhotos.length > 0 && (
        <div style={{ padding: '0 1rem 1.5rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h2 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600',
              color: '#1f2937'
            }}>
              Recent Photos
            </h2>
            <button
              onClick={() => setActiveTab('photos')}
              style={{
                background: 'none',
                border: 'none',
                color: '#0891b2',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              See all →
            </button>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '0.5rem' 
          }}>
            {recentPhotos.map((photo, idx) => (
              <div
                key={photo.id}
                onClick={() => setActiveTab('photos')}
                style={{
                  aspectRatio: '1',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  backgroundColor: '#f3f4f6'
                }}
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/200x200?text=Photo';
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeView;