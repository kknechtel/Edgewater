// Initialize localStorage with sample data for testing

const initializeBands = () => {
  const today = new Date();
  const bands = [
    { 
      id: 1, 
      name: 'The Beach Bums', 
      genre: 'Rock', 
      date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
      time: '7:00 PM', 
      rating: 4.5, 
      reviews: 12 
    },
    { 
      id: 2, 
      name: 'Surf Riders', 
      genre: 'Reggae', 
      date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
      time: '6:30 PM', 
      rating: 4.8, 
      reviews: 8 
    },
    { 
      id: 3, 
      name: 'Coastal Groove', 
      genre: 'Jazz', 
      date: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
      time: '8:00 PM', 
      rating: 4.2, 
      reviews: 5 
    },
    { 
      id: 4, 
      name: 'Sand Dollar Band', 
      genre: 'Country', 
      date: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
      time: '7:30 PM', 
      rating: 3.9, 
      reviews: 15 
    },
    { 
      id: 5, 
      name: 'High Tide', 
      genre: 'Blues', 
      date: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
      time: '7:00 PM', 
      rating: 4.6, 
      reviews: 10 
    }
  ];
  
  localStorage.setItem('beach_bands', JSON.stringify(bands));
  console.log('Initialized bands:', bands);
  return bands;
};

const initializeTournaments = () => {
  const today = new Date();
  const tournaments = [
    {
      id: 1,
      name: 'Summer Bags Championship',
      type: 4,
      date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '2:00 PM',
      status: 'upcoming',
      createdBy: 'admin@edgewater.com'
    },
    {
      id: 2,
      name: 'Beach Bags Showdown',
      type: 8,
      date: new Date(today.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '3:00 PM',
      status: 'upcoming',
      createdBy: 'admin@edgewater.com'
    }
  ];
  
  localStorage.setItem('bags_tournaments', JSON.stringify(tournaments));
  console.log('Initialized tournaments:', tournaments);
  return tournaments;
};

const initializeEvents = () => {
  // Initialize beach_events with data from bandGuideData
  const { bandGuideData } = require('./data/bandGuideData');
  const events = [];
  const currentYear = new Date().getFullYear();
  
  // Helper function to parse band dates
  const parseBandDates = (dateString) => {
    const dates = dateString.split(',').map(d => d.trim());
    return dates.map(dateStr => {
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
  
  // Convert bandGuideData to events
  bandGuideData.categories.forEach(category => {
    category.bands.forEach(band => {
      if (band.date) {
        const dates = parseBandDates(band.date);
        const times = band.time ? band.time.split('/').map(t => t.trim()) : ['6:00 PM'];
        
        dates.forEach((date, index) => {
          if (date) {
            events.push({
              id: `band-${band.name}-${date.getTime()}`,
              title: band.name,
              description: band.description,
              event_date: date.toISOString().split('T')[0],
              event_time: times[index] || times[0],
              location: 'Beach Stage',
              event_type: 'concert',
              bandData: band,
              category: category.name
            });
          }
        });
      }
    });
  });
  
  localStorage.setItem('beach_events', JSON.stringify(events));
  console.log('Initialized beach_events:', events.length, 'events');
  return events;
};

export { initializeBands, initializeTournaments, initializeEvents };