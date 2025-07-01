// RSVP Service for event attendance tracking

class RSVPService {
  constructor() {
    this.storageKey = 'beach_club_rsvps';
    this.attendeesKey = 'beach_club_attendees';
  }

  // Get user's RSVPs
  getUserRSVPs(userId) {
    try {
      const rsvps = localStorage.getItem(this.storageKey);
      if (rsvps) {
        const rsvpData = JSON.parse(rsvps);
        return rsvpData[userId] || [];
      }
      return [];
    } catch (error) {
      console.error('Error getting user RSVPs:', error);
      return [];
    }
  }

  // Get event attendees
  getEventAttendees(eventId) {
    try {
      const attendees = localStorage.getItem(this.attendeesKey);
      if (attendees) {
        const attendeeData = JSON.parse(attendees);
        return attendeeData[eventId] || [];
      }
      return [];
    } catch (error) {
      console.error('Error getting event attendees:', error);
      return [];
    }
  }

  // RSVP to an event
  rsvpToEvent(eventId, userId, userName, rsvpStatus = 'going') {
    try {
      // Update user's RSVPs
      const rsvps = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
      if (!rsvps[userId]) {
        rsvps[userId] = [];
      }
      
      // Remove existing RSVP for this event
      rsvps[userId] = rsvps[userId].filter(rsvp => rsvp.eventId !== eventId);
      
      // Add new RSVP
      if (rsvpStatus !== 'none') {
        rsvps[userId].push({
          eventId,
          status: rsvpStatus,
          timestamp: new Date().toISOString()
        });
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(rsvps));

      // Update event attendees
      const attendees = JSON.parse(localStorage.getItem(this.attendeesKey) || '{}');
      if (!attendees[eventId]) {
        attendees[eventId] = [];
      }

      // Remove existing attendee
      attendees[eventId] = attendees[eventId].filter(attendee => attendee.userId !== userId);

      // Add new attendee if going
      if (rsvpStatus === 'going') {
        attendees[eventId].push({
          userId,
          userName,
          status: rsvpStatus,
          timestamp: new Date().toISOString()
        });
      }

      localStorage.setItem(this.attendeesKey, JSON.stringify(attendees));

      return {
        success: true,
        attendeeCount: attendees[eventId].length
      };
    } catch (error) {
      console.error('Error RSVPing to event:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Check if user has RSVPed to event
  getUserRSVPStatus(eventId, userId) {
    const userRSVPs = this.getUserRSVPs(userId);
    const rsvp = userRSVPs.find(r => r.eventId === eventId);
    return rsvp ? rsvp.status : 'none';
  }

  // Get attendee count for event
  getAttendeeCount(eventId) {
    const attendees = this.getEventAttendees(eventId);
    return attendees.length;
  }

  // Get all events with attendee info
  enrichEventsWithAttendees(events) {
    return events.map(event => ({
      ...event,
      attendees: this.getEventAttendees(event.id),
      attendeeCount: this.getAttendeeCount(event.id)
    }));
  }

  // Removed test RSVP creation - real users only

  // Clear all RSVP data
  clearAllRSVPs() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.attendeesKey);
  }
}

// Export singleton instance
export const rsvpService = new RSVPService();
export default rsvpService;