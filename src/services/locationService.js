// Location and timezone service for accurate weather and time

class LocationService {
  constructor() {
    this.userLocation = null;
    this.userTimezone = null;
    this.defaultLocation = {
      latitude: 36.9647, // Seabright, CA coordinates
      longitude: -122.0102,
      city: 'Seabright',
      state: 'California',
      timezone: 'America/Los_Angeles'
    };
  }

  // Get user's current location
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        console.warn('Geolocation not supported, using default location');
        resolve(this.defaultLocation);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Get timezone and city info from coordinates
            const locationData = await this.getLocationData(latitude, longitude);
            
            this.userLocation = {
              latitude,
              longitude,
              ...locationData
            };
            
            // Store in localStorage for future use
            localStorage.setItem('userLocation', JSON.stringify(this.userLocation));
            
            resolve(this.userLocation);
          } catch (error) {
            console.error('Error getting location data:', error);
            resolve(this.defaultLocation);
          }
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          // Try to use cached location
          const cached = localStorage.getItem('userLocation');
          if (cached) {
            resolve(JSON.parse(cached));
          } else {
            resolve(this.defaultLocation);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000 // 10 minutes
        }
      );
    });
  }

  // Get location data from coordinates using a reverse geocoding service
  async getLocationData(latitude, longitude) {
    try {
      // Using a free geocoding service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      
      if (response.ok) {
        const data = await response.json();
        return {
          city: data.city || data.locality || 'Unknown City',
          state: data.principalSubdivision || '',
          country: data.countryName || '',
          timezone: this.getTimezoneFromCoords(latitude, longitude)
        };
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    
    return {
      city: 'Unknown City',
      timezone: this.getTimezoneFromCoords(latitude, longitude)
    };
  }

  // Get timezone from coordinates (simplified mapping)
  getTimezoneFromCoords(latitude, longitude) {
    // Simplified timezone detection based on longitude
    // In a real app, you'd use a proper timezone API
    
    if (longitude >= -130 && longitude < -120) return 'America/Los_Angeles';
    if (longitude >= -120 && longitude < -105) return 'America/Denver';
    if (longitude >= -105 && longitude < -90) return 'America/Chicago';
    if (longitude >= -90 && longitude < -60) return 'America/New_York';
    
    // European timezones
    if (longitude >= -10 && longitude < 20) return 'Europe/London';
    if (longitude >= 20 && longitude < 40) return 'Europe/Berlin';
    
    // Default fallback
    return 'UTC';
  }

  // Get current time in user's timezone
  getCurrentTimeInUserTimezone() {
    const location = this.userLocation || this.defaultLocation;
    try {
      return new Date().toLocaleString('en-US', {
        timeZone: location.timezone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error('Timezone error:', error);
      return new Date().toLocaleString();
    }
  }

  // Get local time object for weather accuracy
  getLocalTimeObject() {
    const location = this.userLocation || this.defaultLocation;
    try {
      const now = new Date();
      const localTime = new Date(now.toLocaleString('en-US', { timeZone: location.timezone }));
      
      return {
        date: localTime,
        hour: localTime.getHours(),
        isDaytime: localTime.getHours() >= 6 && localTime.getHours() < 20,
        timeString: localTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit'
        }),
        dateString: localTime.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        })
      };
    } catch (error) {
      console.error('Local time error:', error);
      const now = new Date();
      return {
        date: now,
        hour: now.getHours(),
        isDaytime: now.getHours() >= 6 && now.getHours() < 20,
        timeString: now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit'
        }),
        dateString: now.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        })
      };
    }
  }

  // Get cached location or initialize
  async getLocation() {
    if (this.userLocation) {
      return this.userLocation;
    }

    // Try cached location first
    const cached = localStorage.getItem('userLocation');
    if (cached) {
      try {
        this.userLocation = JSON.parse(cached);
        return this.userLocation;
      } catch (error) {
        console.error('Error parsing cached location:', error);
      }
    }

    // Get fresh location
    return await this.getCurrentLocation();
  }

  // Format coordinates for weather API
  getCoordinatesForWeather() {
    const location = this.userLocation || this.defaultLocation;
    return {
      lat: location.latitude,
      lon: location.longitude,
      city: location.city
    };
  }
}

// Export singleton instance
export const locationService = new LocationService();
export default locationService;