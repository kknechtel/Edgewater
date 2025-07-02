import { eventService } from './api';
import { bandGuideData } from '../data/bandGuideData';

class UnifiedEventService {
  constructor() {
    this.eventsCache = null;
    this.lastFetch = null;
    this.cacheDuration = 1 * 60 * 1000; // 1 minute for testing
    // Clear any existing cache on initialization
    this.clearCache();
  }

  parseBandDates(dateString) {
    const currentYear = 2025; // Force 2025 for all events
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
  }

  async loadAllEvents() {
    // Check cache first
    if (this.eventsCache && this.lastFetch && (Date.now() - this.lastFetch) < this.cacheDuration) {
      console.log('📦 Using cached events');
      return this.eventsCache;
    }

    console.log('🔄 Loading fresh events...');
    
    try {
      // 1. Load API Events
      let apiEvents = [];
      try {
        const response = await eventService.getAllEvents();
        const rawEvents = Array.isArray(response) ? response : (response.events || response.data || []);
        
        apiEvents = rawEvents.map(event => ({
          ...event,
          event_date: event.date ? event.date.split('T')[0] : event.event_date,
          event_time: event.date ? 
            new Date(event.date).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit', 
              hour12: true 
            }) : (event.event_time || 'Time TBD'),
          event_type: event.event_type || 'other',
          source: 'api'
        }));
        console.log('✅ Loaded', apiEvents.length, 'API events');
      } catch (error) {
        console.log('⚠️ API events failed:', error.message);
        apiEvents = [];
      }

      // 2. Load Band Events from bandGuideData
      const bandEvents = [];
      bandGuideData.categories.forEach(category => {
        category.bands.forEach(band => {
          if (band.date) {
            const dates = this.parseBandDates(band.date);
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
      console.log('🎸 Loaded', bandEvents.length, 'band events');

      // 3. Load Tournament Events from localStorage
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
      console.log('🎯 Loaded', tournamentEvents.length, 'tournament events');

      // 4. Add Demo Events if needed
      const allEvents = [...apiEvents, ...bandEvents, ...tournamentEvents];
      
      if (allEvents.length === 0) {
        console.log('📝 Adding demo events (no real events found)');
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        
        // Format dates as YYYY-MM-DD
        const formatDate = (date) => date.toISOString().split('T')[0];
        
        allEvents.push(
          {
            id: 'demo-event-1',
            title: 'Beach Volleyball Tournament',
            description: 'Join us for a fun volleyball tournament on the beach!',
            event_date: formatDate(tomorrow),
            event_time: '2:00 PM',
            location: 'Main Beach Court',
            event_type: 'tournament',
            source: 'demo'
          },
          {
            id: 'demo-event-2',
            title: 'Live Music - The Wave Riders',
            description: 'Enjoy live music by the beach with The Wave Riders band',
            event_date: formatDate(nextWeek),
            event_time: '6:00 PM',
            location: 'Beach Stage',
            event_type: 'concert',
            source: 'demo'
          },
          {
            id: 'demo-event-3',
            title: 'Sunrise Yoga Session',
            description: 'Start your day with peaceful yoga by the ocean',
            event_date: formatDate(nextMonth),
            event_time: '7:00 AM',
            location: 'East Beach',
            event_type: 'gathering',
            source: 'demo'
          }
        );
        
        // Add special July 4th event if it's upcoming
        const year = today.getFullYear();
        const july4th = new Date(year, 6, 4); // July 4th
        if (july4th < today) {
          july4th.setFullYear(year + 1); // Next year's July 4th
        }
        
        allEvents.push({
          id: 'demo-event-4',
          title: '4th of July Beach Party',
          description: 'Celebrate Independence Day with fireworks and fun!',
          event_date: formatDate(july4th),
          event_time: '7:00 PM',
          location: 'Main Beach',
          event_type: 'party',
          source: 'demo'
        });
        
        // Add a weekend event
        const saturday = new Date(today);
        const daysUntilSaturday = (6 - today.getDay() + 7) % 7 || 7; // Days until next Saturday
        saturday.setDate(saturday.getDate() + daysUntilSaturday);
        
        allEvents.push({
          id: 'demo-event-5',
          title: 'Saturday Beach Cleanup',
          description: 'Help keep our beach beautiful! Free lunch provided.',
          event_date: formatDate(saturday),
          event_time: '10:00 AM',
          location: 'Main Beach Entrance',
          event_type: 'gathering',
          source: 'demo'
        });
      }

      // Cache the results
      this.eventsCache = allEvents;
      this.lastFetch = Date.now();
      
      console.log('✅ Total events loaded:', allEvents.length);
      return allEvents;

    } catch (error) {
      console.error('❌ Failed to load events:', error);
      return [];
    }
  }

  async getUpcomingEvents(limit = 5) {
    const allEvents = await this.loadAllEvents();
    
    // Get current date and set to start of day for accurate comparison
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const upcoming = allEvents
      .filter(event => {
        const eventDate = new Date(event.event_date || event.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= now;
      })
      .sort((a, b) => {
        const dateA = new Date(a.event_date || a.date);
        const dateB = new Date(b.event_date || b.date);
        return dateA - dateB;
      })
      .slice(0, limit);
    
    console.log(`📅 Returning ${upcoming.length} upcoming events (today or later)`);
    return upcoming;
  }

  async getAllEvents() {
    return this.loadAllEvents();
  }

  // Clear cache when new events are added
  clearCache() {
    this.eventsCache = null;
    this.lastFetch = null;
    console.log('🗑️ Events cache cleared');
  }

  // Create event and clear cache
  async createEvent(eventData) {
    try {
      const result = await eventService.createEvent(eventData);
      this.clearCache(); // Clear cache so next load gets fresh data
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Delete event and clear cache
  async deleteEvent(eventId) {
    try {
      const result = await eventService.deleteEvent(eventId);
      this.clearCache(); // Clear cache so next load gets fresh data
      return result;
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const unifiedEventService = new UnifiedEventService();
export default unifiedEventService;