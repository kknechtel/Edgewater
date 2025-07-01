import React, { useState, useEffect } from 'react';

const WeatherView = () => {
  const [weather, setWeather] = useState(null);
  const [surfData, setSurfData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      
      // Fetch weather data
      const weatherResponse = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=43.09&longitude=-70.64&daily=temperature_2m_max,temperature_2m_min,weathercode,windspeed_10m_max,winddirection_10m_dominant&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=America%2FNew_York'
      );
      const weatherData = await weatherResponse.json();
      
      // Fetch marine/surf data
      const marineResponse = await fetch(
        'https://marine-api.open-meteo.com/v1/marine?latitude=43.09&longitude=-70.64&daily=wave_height_max,wave_period_max&timezone=America%2FNew_York'
      );
      const marineData = await marineResponse.json();
      
      setWeather(weatherData);
      setSurfData(marineData);
    } catch (err) {
      setError('Failed to fetch weather data');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
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

  const getWindDirection = (degrees) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  if (loading) return <div className="loading">Loading weather data...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!weather || !surfData) return null;

  const today = new Date();
  const days = weather.daily.time.map((date, index) => {
    const d = new Date(date);
    const isToday = d.toDateString() === today.toDateString();
    const dayName = isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
    
    return {
      date: d,
      dayName,
      isToday,
      high: Math.round(weather.daily.temperature_2m_max[index]),
      low: Math.round(weather.daily.temperature_2m_min[index]),
      weatherCode: weather.daily.weathercode[index],
      windSpeed: Math.round(weather.daily.windspeed_10m_max[index]),
      windDirection: weather.daily.winddirection_10m_dominant[index],
      waveHeight: surfData.daily.wave_height_max[index],
      wavePeriod: surfData.daily.wave_period_max[index]
    };
  });

  const currentDay = days[selectedDay];

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => window.history.back()}
          style={{
            background: 'none',
            border: 'none',
            color: '#0891b2',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ← Back to App
        </button>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          🌊 Surf & Weather Conditions
        </h1>
        <p style={{ color: '#666' }}>Hampton Beach, NH - Live conditions and 7-day forecast</p>
      </div>

      {/* 7-Day Forecast Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {days.slice(0, 7).map((day, index) => (
          <div
            key={index}
            onClick={() => setSelectedDay(index)}
            style={{
              backgroundColor: selectedDay === index ? '#2196F3' : 'white',
              color: selectedDay === index ? 'white' : '#333',
              padding: '1rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.3s'
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {day.dayName}
            </div>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              {getWeatherIcon(day.weatherCode)}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
              {day.high}°
            </div>
            <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
              {day.low}°
            </div>
          </div>
        ))}
      </div>

      {/* Detailed View for Selected Day */}
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
          {currentDay.dayName} - {currentDay.date.toLocaleDateString()}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          {/* Temperature */}
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#2196F3' }}>
              🌡️ Temperature
            </h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {currentDay.high}°F
            </div>
            <div style={{ color: '#666' }}>
              Low: {currentDay.low}°F
            </div>
          </div>

          {/* Wind */}
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#2196F3' }}>
              💨 Wind
            </h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {currentDay.windSpeed} mph
            </div>
            <div style={{ color: '#666' }}>
              Direction: {getWindDirection(currentDay.windDirection)}
            </div>
          </div>

          {/* Surf Conditions */}
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#2196F3' }}>
              🏄 Surf Conditions
            </h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {currentDay.waveHeight ? `${currentDay.waveHeight.toFixed(1)}m` : 'N/A'}
            </div>
            <div style={{ color: '#666' }}>
              Period: {currentDay.wavePeriod ? `${currentDay.wavePeriod.toFixed(0)}s` : 'N/A'}
            </div>
          </div>

          {/* Beach Day Rating */}
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#2196F3' }}>
              🏖️ Beach Day Rating
            </h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {getBeachRating(currentDay)}
            </div>
            <div style={{ color: '#666' }}>
              {getBeachDescription(currentDay)}
            </div>
          </div>
        </div>

        {/* Surf Report */}
        <div style={{ 
          marginTop: '2rem', 
          padding: '1.5rem', 
          backgroundColor: '#f5f5f5',
          borderRadius: '8px'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
            🌊 Surf Report
          </h3>
          <p style={{ lineHeight: '1.6' }}>
            {getSurfReport(currentDay)}
          </p>
        </div>
      </div>

      {/* Beach Tips */}
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        backgroundColor: '#e3f2fd',
        borderRadius: '8px'
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
          💡 Beach Tips for {currentDay.dayName}
        </h3>
        <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
          {getBeachTips(currentDay).map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );

  function getBeachRating(day) {
    const { high, weatherCode, windSpeed, waveHeight } = day;
    
    if (weatherCode > 77 || windSpeed > 25) return '⭐';
    if (high < 65) return '⭐⭐';
    if (high > 75 && weatherCode <= 3 && windSpeed < 15) {
      if (waveHeight && waveHeight < 2) return '⭐⭐⭐⭐⭐';
      return '⭐⭐⭐⭐';
    }
    if (high > 70 && weatherCode <= 48) return '⭐⭐⭐';
    return '⭐⭐';
  }

  function getBeachDescription(day) {
    const rating = getBeachRating(day).length;
    const descriptions = [
      'Stay home day',
      'Only for the brave',
      'Decent beach day',
      'Good beach day',
      'Great beach day!',
      'Perfect beach day! 🎉'
    ];
    return descriptions[rating - 1] || descriptions[0];
  }

  function getSurfReport(day) {
    const { waveHeight, wavePeriod, windSpeed, windDirection } = day;
    
    if (!waveHeight) {
      return "Surf data unavailable. Check local surf reports for current conditions.";
    }

    const height = waveHeight;
    const period = wavePeriod || 0;
    
    if (height < 0.5) {
      return `Flat conditions today with waves under 0.5m. Perfect for swimming and paddleboarding. Wind ${windSpeed} mph from the ${getWindDirection(windDirection)}.`;
    } else if (height < 1) {
      return `Small waves ${height.toFixed(1)}m with ${period.toFixed(0)} second periods. Good for beginners and longboarders. Wind ${windSpeed} mph from the ${getWindDirection(windDirection)}.`;
    } else if (height < 2) {
      return `Fun waves today! ${height.toFixed(1)}m swells with ${period.toFixed(0)} second periods. Good for all skill levels. Wind ${windSpeed} mph from the ${getWindDirection(windDirection)}.`;
    } else {
      return `Solid surf! ${height.toFixed(1)}m waves with ${period.toFixed(0)} second periods. Experienced surfers only. Wind ${windSpeed} mph from the ${getWindDirection(windDirection)}.`;
    }
  }

  function getBeachTips(day) {
    const tips = [];
    const { high, weatherCode, windSpeed, waveHeight } = day;
    
    if (high > 80) {
      tips.push("🧴 Extra sunscreen needed - reapply every 2 hours");
      tips.push("💧 Bring plenty of water to stay hydrated");
    }
    
    if (windSpeed > 15) {
      tips.push("🏖️ Beach umbrella weights recommended");
      tips.push("👓 Secure your belongings - it's windy!");
    }
    
    if (weatherCode > 48) {
      tips.push("☔ Pack rain gear just in case");
    }
    
    if (waveHeight && waveHeight > 1.5) {
      tips.push("🏊 Strong currents possible - swim near lifeguards");
    }
    
    if (tips.length === 0) {
      tips.push("🏖️ Great day for the beach - enjoy!");
    }
    
    return tips;
  }
};

export default WeatherView;