import React, { useState, useEffect } from 'react';
import { fetchWeatherData, fetchSurfReport } from '../services/weatherService';

const WeatherDetailView = () => {
  const [activeTab, setActiveTab] = useState('current');
  const [weather, setWeather] = useState(null);
  const [surfData, setSurfData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      const [weatherData, surfReport] = await Promise.all([
        fetchWeatherData(),
        fetchSurfReport()
      ]);
      setWeather(weatherData);
      setSurfData(surfReport);
    } catch (error) {
      console.error('Error loading weather data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'current', label: 'Current', icon: '☀️' },
    { id: 'hourly', label: 'Hourly', icon: '🕐' },
    { id: 'weekly', label: '7-Day', icon: '📆' },
    { id: 'surf', label: 'Surf', icon: '🏄' }
  ];

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
    title: {
      fontSize: '1.75rem',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '0.5rem'
    },
    location: {
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    tabBar: {
      display: 'flex',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      overflowX: 'auto'
    },
    tab: {
      flex: 1,
      padding: '0.75rem 1rem',
      textAlign: 'center',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '600',
      transition: 'all 0.2s',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.25rem',
      position: 'relative',
      minWidth: '80px'
    },
    activeTab: {
      color: '#0891b2'
    },
    inactiveTab: {
      color: '#6b7280'
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
    }
  };

  const renderCurrentWeather = () => (
    <div>
      <div style={styles.card}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            backgroundColor: '#ecfeff',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            border: '1px solid rgba(8, 145, 178, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '3rem',
              fontWeight: '700',
              color: '#0891b2',
              marginBottom: '0.5rem'
            }}>
              {weather?.temp || '--'}°
            </div>
            <div style={{
              fontSize: '1.125rem',
              color: '#4b5563',
              marginBottom: '0.25rem'
            }}>
              {weather?.condition || 'Loading...'}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              Feels like {weather?.feelsLike || '--'}°
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{
              backgroundColor: '#f3f4f6',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <span style={{ fontSize: '1.25rem' }}>💨</span>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Wind</div>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827' }}>
                  {weather?.wind || 'Loading...'}
                </div>
              </div>
            </div>
            
            <div style={{
              backgroundColor: '#f3f4f6',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <span style={{ fontSize: '1.25rem' }}>💧</span>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Humidity</div>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827' }}>
                  {weather?.humidity || '--'}%
                </div>
              </div>
            </div>
            
            {weather?.uvIndex >= 7 && (
              <div style={{
                backgroundColor: '#fef3c7',
                color: '#f59e0b',
                fontWeight: '600',
                borderRadius: '0.5rem',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <span style={{ fontSize: '1.25rem' }}>☀️</span>
                <div>
                  <div style={{ fontSize: '0.75rem' }}>UV Index</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                    {weather.uvIndex} - High
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderHourlyForecast = () => (
    <div style={styles.card}>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '1rem',
        color: '#111827'
      }}>
        Next 24 Hours
      </h3>
      
      {weather?.hourly ? (
        <div style={{
          display: 'flex',
          overflowX: 'auto',
          gap: '0.75rem',
          paddingBottom: '0.5rem',
          WebkitOverflowScrolling: 'touch'
        }}>
          {weather.hourly.slice(0, 24).map((hour, index) => (
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
              <div style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                {hour.temp}°
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                {hour.condition}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
          Loading hourly forecast...
        </div>
      )}
    </div>
  );

  const renderWeeklyForecast = () => (
    <div style={styles.card}>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '1rem',
        color: '#111827'
      }}>
        7-Day Forecast
      </h3>
      
      {weather?.daily ? (
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
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
          Loading weekly forecast...
        </div>
      )}
    </div>
  );

  const renderSurfConditions = () => (
    <div style={styles.card}>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '1rem',
        color: '#111827',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <span>🏄</span> Surf Report
      </h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          backgroundColor: '#ecfeff',
          borderRadius: '0.75rem',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Wave Height</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0891b2' }}>
            {surfData?.waveHeight || 'Loading...'}
          </div>
        </div>
        
        <div style={{
          backgroundColor: '#f0fdf4',
          borderRadius: '0.75rem',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Quality</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
            {surfData?.quality || 'Loading...'}
          </div>
        </div>
        
        <div style={{
          backgroundColor: '#f3f4f6',
          borderRadius: '0.75rem',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Water Temp</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
            {surfData?.waterTemp || '--'}°F
          </div>
        </div>
        
        <div style={{
          backgroundColor: '#f3f4f6',
          borderRadius: '0.75rem',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Crowd</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
            {surfData?.crowd || 'Loading...'}
          </div>
        </div>
      </div>
      
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '0.75rem',
        padding: '1rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
          Tide Information
        </div>
        <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
          {surfData?.tide || 'Loading tide information...'}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⛅</div>
          <p>Loading weather data...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'current':
        return renderCurrentWeather();
      case 'hourly':
        return renderHourlyForecast();
      case 'weekly':
        return renderWeeklyForecast();
      case 'surf':
        return renderSurfConditions();
      default:
        return renderCurrentWeather();
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Weather</h1>
        <p style={styles.location}>📍 Sea Bright, NJ</p>
      </div>

      {/* Tab Bar */}
      <div style={styles.tabBar}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              style={{
                ...styles.tab,
                ...(isActive ? styles.activeTab : styles.inactiveTab)
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              {/* Active indicator */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '40px',
                  height: '3px',
                  backgroundColor: '#0891b2',
                  borderRadius: '3px 3px 0 0'
                }} />
              )}
              
              <span style={{ fontSize: '1.25rem' }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={styles.content}>
        {renderContent()}
      </div>
    </div>
  );
};

export default WeatherDetailView;