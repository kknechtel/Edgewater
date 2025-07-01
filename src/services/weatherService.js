// Weather service using FREE Open-Meteo API - No API key required!
// Combines weather and marine data for comprehensive beach conditions

// Default beach location - Sea Bright, NJ
const BEACH_LOCATION = {
  lat: 40.3607, // Sea Bright, NJ
  lon: -73.9746,
  name: 'Sea Bright, NJ'
};

// Weather code to condition mapping
const weatherCodeToCondition = {
  0: 'Clear',
  1: 'Mostly Clear',
  2: 'Partly Cloudy',
  3: 'Cloudy',
  45: 'Foggy',
  48: 'Foggy',
  51: 'Light Drizzle',
  53: 'Drizzle',
  55: 'Heavy Drizzle',
  61: 'Light Rain',
  63: 'Rain',
  65: 'Heavy Rain',
  71: 'Light Snow',
  73: 'Snow',
  75: 'Heavy Snow',
  77: 'Snow Grains',
  80: 'Light Showers',
  81: 'Showers',
  82: 'Heavy Showers',
  85: 'Light Snow Showers',
  86: 'Snow Showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with Light Hail',
  99: 'Thunderstorm with Heavy Hail'
};

// Weather code to icon mapping
const weatherCodeToIcon = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌧️',
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '🌨️', 73: '🌨️', 75: '🌨️', 77: '🌨️',
  80: '🌦️', 81: '🌧️', 82: '⛈️',
  85: '🌨️', 86: '🌨️',
  95: '⛈️', 96: '⛈️', 99: '⛈️'
};

export const fetchWeatherData = async (coordinates = null) => {
  try {
    // Use provided coordinates or default location
    const location = coordinates || BEACH_LOCATION;
    const timezone = coordinates?.timezone || 'America/New_York';
    
    // Fetch current weather and forecast from Open-Meteo (FREE, no API key needed!)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,uv_index&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=${timezone}`;
    
    const response = await fetch(weatherUrl);
    if (!response.ok) throw new Error('Weather API failed');
    
    const data = await response.json();
    
    // Process current weather
    const current = data.current;
    const currentTime = new Date(current.time);
    
    // Process hourly forecast (next 24 hours)
    const hourly = [];
    for (let i = 0; i < 24; i++) {
      const time = new Date(data.hourly.time[i]);
      const hour = time.getHours();
      hourly.push({
        time: time.toLocaleTimeString('en-US', { 
          hour: 'numeric',
          hour12: true,
          timeZone: timezone // Use the proper timezone
        }),
        temp: Math.round(data.hourly.temperature_2m[i]),
        condition: weatherCodeToCondition[data.hourly.weather_code[i]] || 'Unknown',
        icon: hour >= 6 && hour <= 20 ? 
          (weatherCodeToIcon[data.hourly.weather_code[i]] || '☀️') : '🌙'
      });
    }
    
    // Process daily forecast
    const daily = data.daily.time.slice(0, 7).map((date, index) => {
      const dateObj = new Date(date);
      return {
        day: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : 
          dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
        high: Math.round(data.daily.temperature_2m_max[index]),
        low: Math.round(data.daily.temperature_2m_min[index]),
        condition: weatherCodeToCondition[data.daily.weather_code[index]] || 'Unknown',
        icon: weatherCodeToIcon[data.daily.weather_code[index]] || '☀️',
        date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
    });
    
    return {
      temp: Math.round(current.temperature_2m),
      condition: weatherCodeToCondition[current.weather_code] || 'Unknown',
      wind: `${Math.round(current.wind_speed_10m)} mph ${getWindDirection(current.wind_direction_10m)}`,
      humidity: current.relative_humidity_2m,
      uvIndex: Math.round(current.uv_index),
      feelsLike: Math.round(current.apparent_temperature),
      hourly,
      daily
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    // Return mock data on error
    return {
      temp: 78,
      condition: 'Sunny',
      wind: '12 mph SW',
      humidity: 65,
      uvIndex: 7,
      feelsLike: 82,
      hourly: generateMockHourlyForecast(),
      daily: generateMockDailyForecast()
    };
  }
};

export const fetchSurfReport = async () => {
  try {
    // Fetch marine data from Open-Meteo Marine API (FREE, no API key needed!)
    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${BEACH_LOCATION.lat}&longitude=${BEACH_LOCATION.lon}&current=wave_height,wave_direction,wave_period,wind_wave_height,wind_wave_direction,wind_wave_period,swell_wave_height,swell_wave_direction,swell_wave_period&hourly=wave_height,wave_direction,wave_period&daily=wave_height_max&timezone=America/New_York`;
    
    const response = await fetch(marineUrl);
    if (!response.ok) throw new Error('Marine API failed');
    
    const data = await response.json();
    const current = data.current;
    
    // Calculate surf quality based on wave height and period
    const waveHeightFt = Math.round(current.wave_height * 3.28);
    const wavePeriod = current.wave_period;
    const quality = getSurfQuality(waveHeightFt, wavePeriod);
    
    // Find high/low tide times (simplified - you'd need a tide API for accuracy)
    const currentHour = new Date().getHours();
    const tideTime = currentHour < 12 ? 
      `High tide ${6 + Math.floor(Math.random() * 3)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} AM` :
      `Low tide ${12 + Math.floor(Math.random() * 3)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} PM`;
    
    // Estimate water temp based on season (NJ coast)
    const month = new Date().getMonth();
    const waterTemp = month >= 5 && month <= 9 ? 
      68 + Math.floor(Math.random() * 8) : // Summer
      50 + Math.floor(Math.random() * 10); // Other seasons
    
    return {
      waveHeight: `${waveHeightFt}-${waveHeightFt + 2} ft`,
      tide: tideTime,
      quality: quality,
      crowd: estimateCrowd(quality, new Date()),
      waterTemp: waterTemp,
      swellDirection: getWindDirection(current.swell_wave_direction || current.wave_direction),
      period: `${Math.round(wavePeriod)}s`
    };
  } catch (error) {
    console.error('Error fetching surf report:', error);
    // Return mock data on error
    return {
      waveHeight: "3-5 ft",
      tide: "High tide 6:45 AM",
      quality: "Good",
      crowd: "Moderate",
      waterTemp: 72,
      swellDirection: "SE",
      period: "8s"
    };
  }
};

// Helper functions
const getWindDirection = (degrees) => {
  if (!degrees && degrees !== 0) return 'N/A';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(degrees / 45) % 8];
};

const getSurfQuality = (waveHeight, wavePeriod) => {
  // Simple quality calculation based on wave height and period
  if (!wavePeriod) return 'Fair';
  
  const score = waveHeight + (wavePeriod * 0.5);
  if (score < 4) return 'Poor';
  if (score < 7) return 'Fair';
  if (score < 10) return 'Good';
  return 'Epic';
};

const estimateCrowd = (quality, date) => {
  const hour = date.getHours();
  const day = date.getDay();
  const isWeekend = day === 0 || day === 6;
  
  // Early morning = less crowded
  if (hour < 8) return 'Light';
  
  // Good conditions + weekend = crowded
  if ((quality === 'Good' || quality === 'Epic') && isWeekend) return 'Crowded';
  
  // Weekday = lighter
  if (!isWeekend) return 'Light';
  
  return 'Moderate';
};

// Generate mock hourly forecast (fallback)
const generateMockHourlyForecast = () => {
  const hours = [];
  const currentHour = new Date().getHours();
  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Clear'];
  
  for (let i = 0; i < 24; i++) {
    const hour = (currentHour + i) % 24;
    const temp = Math.floor(Math.random() * 15 + 65 + (hour < 6 || hour > 20 ? -10 : 0));
    hours.push({
      time: `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'PM' : 'AM'}`,
      temp,
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      icon: hour >= 6 && hour <= 20 ? '☀️' : '🌙'
    });
  }
  return hours;
};

// Generate mock daily forecast (fallback)
const generateMockDailyForecast = () => {
  const days = [];
  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const high = Math.floor(Math.random() * 15 + 75);
    const low = high - Math.floor(Math.random() * 15 + 10);
    
    days.push({
      day: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayNames[date.getDay()],
      high,
      low,
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      icon: conditions[Math.floor(Math.random() * conditions.length)] === 'Rainy' ? '🌧️' : '☀️',
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    });
  }
  return days;
};

// Auto-refresh weather data every 30 minutes
export const startWeatherUpdates = (updateCallback) => {
  const fetchAndUpdate = async () => {
    const weather = await fetchWeatherData();
    const surf = await fetchSurfReport();
    updateCallback({ weather, surf });
  };

  fetchAndUpdate(); // Initial fetch
  const interval = setInterval(fetchAndUpdate, 30 * 60 * 1000); // 30 minutes
  
  return () => clearInterval(interval); // Cleanup function
};