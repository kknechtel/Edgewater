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

export { initializeBands, initializeTournaments };