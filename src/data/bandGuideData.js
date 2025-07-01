// bandGuideData.js
// This data structure is designed to work with the MusicView component
// Each band has been researched and rated based on their style and energy level

export const bandGuideData = {
  categories: [
    {
      id: 'top-recommendations',
      name: '⭐ Top Recommendations: Best Upbeat Rock/Cover Bands',
      bands: [
        {
          name: 'The Benjamins',
          date: 'September 6',
          time: '6:00 PM',
          rating: 5,
          description: 'Specializes in high-energy 90s-2000s rock, pop punk, and alternative covers',
          vibe: '2000s RE-LOAD show featuring hard rock, pop punk, and emo anthems',
          reviews: '4.9/5 stars (160+ reviews)',
          socialMedia: '@thebenjaminsnj',
          regularVenues: "Willie McBride's Hoboken, Just Jake's Montclair",
          weddingBand: false,
          tags: ['90s Rock', '2000s', 'Pop Punk', 'High Energy']
        },
        {
          name: 'Brian Kirk & The Jirks',
          date: 'July 17, August 24, September 14',
          time: '6:00 PM / 4:00 PM / 4:00 PM',
          rating: 5,
          description: '8-12 piece band with horns bringing club-like energy to all performances',
          vibe: 'Vast catalog spanning all decades with emphasis on rock, soul, pop, and funk',
          reviews: '4.9/5 stars (136+ reviews)',
          socialMedia: '@briankirkandthejirks',
          regularVenues: 'Stone Pony, Bar A, Donovan\'s Reef',
          weddingBand: false,
          tags: ['Rock', 'Soul', 'Funk', 'Horns', 'High Energy']
        },
        {
          name: 'Audio Riots',
          date: 'July 4',
          time: '6:00 PM',
          rating: 5,
          description: '6-core member high-energy band covering 7 decades including punk and EDM',
          vibe: 'Led by Dan Toth (compared to Freddie Mercury)',
          reviews: 'Amazing! - Sea Girt review',
          socialMedia: '@audioriotnj',
          regularVenues: 'Northeast circuit',
          weddingBand: false,
          tags: ['Punk', 'EDM', 'Classic Rock', 'High Energy']
        },
        {
          name: 'The Cliffs',
          date: 'July 5',
          time: '6:00 PM',
          rating: 5,
          description: '8-piece supergroup playing classic rock from Journey to Van Halen',
          vibe: 'High energy without wedding band pretense',
          reviews: 'Amazing artists & entertainers!',
          socialMedia: '@thecliffsband (5,446 followers)',
          regularVenues: 'Deal Lake Bar + Co., Red Rock',
          weddingBand: false,
          tags: ['Classic Rock', '80s Rock', 'High Energy']
        },
        {
          name: 'Smoking Jackets',
          date: 'June 21',
          time: '6:00 PM',
          rating: 5,
          description: 'Named one of the Top Five Cover Bands in New Jersey',
          vibe: 'Fun lovin\' classic rock and roll party band',
          reviews: 'Top 5 NJ Cover Band',
          socialMedia: '@smokin_jackets',
          regularVenues: 'Stone Pony to Bar Anticipation',
          weddingBand: false,
          tags: ['Classic Rock', 'Party Band']
        },
        {
          name: 'The Ruckus',
          date: 'June 14',
          time: '6:00 PM',
          rating: 5,
          description: 'Rock, pop, dance with four-part harmonies and party attitude',
          vibe: 'Amazing set list, fun stage show, talented musicians',
          reviews: 'Top 5 NJ Cover Band',
          socialMedia: 'Facebook: 3,160+ likes',
          regularVenues: 'Jersey Shore circuit',
          weddingBand: false,
          tags: ['Rock', 'Pop', 'Dance', 'Party Band']
        }
      ]
    },
    {
      id: 'strong-contenders',
      name: '👍 Other Strong Contenders',
      bands: [
        {
          name: 'Pat Roddy Band',
          date: 'July 31',
          time: '6:00 PM',
          rating: 4,
          description: 'Jersey Shore soul/rock focusing on Springsteen, Southside Johnny',
          vibe: 'Rock band that also does weddings, not a "wedding band"',
          reviews: 'Facebook: 5,917+ likes',
          regularVenues: 'Stone Pony, Bar A',
          weddingBand: false,
          tags: ['Jersey Shore Rock', 'Springsteen', 'Soul']
        },
        {
          name: 'The Rockets',
          date: 'June 28',
          time: '6:00 PM',
          rating: 4,
          description: 'Philadelphia\'s 7-piece powerhouse party band (40 years active)',
          vibe: 'High-energy covers across all genres',
          reviews: 'TV appearances (CBS, VH1)',
          socialMedia: '@rocketsband',
          regularVenues: 'Major venues',
          weddingBand: false,
          tags: ['Party Band', 'All Genres', 'High Energy']
        },
        {
          name: 'No Standards',
          date: 'August 22',
          time: '6:00 PM',
          rating: 4,
          description: 'Punk/rock/ska energy with unique arrangements',
          vibe: 'Plays NYC/NJ bars, nightclubs, and casinos',
          reviews: 'Facebook: 2,494+ likes',
          regularVenues: 'Resorts World, Hard Rock Atlantic City',
          weddingBand: false,
          tags: ['Punk', 'Rock', 'Ska', 'Alternative']
        },
        {
          name: 'Undisputed',
          date: 'September 27',
          time: '6:00 PM',
          rating: 4,
          description: 'Modern rock/hip-hop fusion covering RAGE, 311, Fall Out Boy',
          vibe: 'Where Rock and Pop meet Hip-Hop and Funk',
          reviews: 'Facebook: 4,902 likes',
          regularVenues: 'Modern venues',
          weddingBand: false,
          tags: ['Modern Rock', 'Hip-Hop', 'Nu Metal']
        },
        {
          name: 'Scott Elk',
          date: 'August 9',
          time: '6:00 PM',
          rating: 4,
          description: 'Rock, pop, dance covers from 1960s through today',
          vibe: 'Quality venues including Teak (Red Bank)',
          reviews: 'Performed with Goo Goo Dolls',
          regularVenues: 'Teak, festivals',
          weddingBand: false,
          tags: ['Rock', 'Pop', 'Dance', 'Versatile']
        },
        {
          name: 'Daddy Pop',
          date: 'August 23',
          time: '6:00 PM',
          rating: 4,
          description: 'High-energy performances of classic rock to current hits',
          vibe: 'Bruce Springsteen to Bruno Mars',
          reviews: 'Clients include Jon Bon Jovi and NFL',
          regularVenues: 'Jersey Shore nightclubs',
          weddingBand: true,
          tags: ['Classic Rock', 'Current Hits', 'High Energy']
        },
        {
          name: 'Blue Collar Band Trio',
          date: 'June 27',
          time: '6:00 PM',
          rating: 4,
          description: 'Six decades of choice rock renditions, groovy jams and surprising mashups',
          vibe: 'Old school meets new school',
          reviews: 'Facebook: 989 likes',
          socialMedia: '@the_blue_collar_band_nj',
          regularVenues: 'Pompton Lakes, NJ area',
          weddingBand: false,
          tags: ['Classic Rock', 'Mashups', 'Party Band']
        },
        {
          name: 'Those Guys',
          date: 'September 20',
          time: '6:00 PM',
          rating: 4,
          description: 'High energy party rock four piece band from Toms River',
          vibe: 'Your mom\'s favorite band - Rock/Funk/Pop/Party',
          reviews: 'Facebook: 537 likes (Toms River page)',
          regularVenues: 'Jersey Shore area',
          weddingBand: false,
          tags: ['Party Rock', 'Funk', 'Pop', 'High Energy']
        }
      ]
    },
    {
      id: 'approach-with-caution',
      name: '⚠️ Bands to Approach with Caution',
      bands: [
        {
          name: 'The Kicks',
          date: 'July 3, August 15, August 31',
          time: '6:00 PM',
          rating: 3,
          description: 'High-energy 6-piece but limited info available',
          vibe: 'Potentially good but needs assessment',
          weddingBand: null,
          tags: ['Unknown']
        },
        {
          name: 'Aaron Manzo',
          date: 'June 7',
          time: '6:00 PM',
          rating: 3,
          description: 'Acoustic rock covers, may lack full-band energy',
          vibe: 'Solo/acoustic act',
          weddingBand: null,
          tags: ['Acoustic', 'Solo']
        },
        {
          name: 'Larry Alter',
          date: 'June 8, July 13, August 30',
          time: '3:00 PM / 3:00 PM / 6:00 PM',
          rating: 3,
          description: 'Local Jersey Shore guitarist/vocalist',
          vibe: 'Versatile covers performer',
          weddingBand: null,
          tags: ['Covers', 'Local', 'Versatile']
        },
        {
          name: 'Chris Morrisy Duo',
          date: 'June 15, July 5, July 20',
          time: '3:00 PM / 6:00 PM / 3:00 PM',
          rating: 3,
          description: 'Local cover band performer',
          vibe: 'Duo format covers',
          reviews: 'Part of Chris Morrisy Band',
          weddingBand: null,
          tags: ['Covers', 'Duo', 'Local']
        },
        {
          name: 'Alternate Groove Band',
          date: 'July 12, August 9, August 30',
          time: '6:00 PM',
          rating: 3,
          description: 'Rock & soul with horns, could work',
          vibe: 'Needs more research',
          weddingBand: null,
          tags: ['Rock', 'Soul', 'Horns']
        },
        {
          name: 'Bob Gilmartin',
          date: 'August 2',
          time: '6:00 PM',
          rating: 3,
          description: 'Highly versatile professional',
          vibe: 'Unknown style preference',
          weddingBand: null,
          tags: ['Versatile']
        },
        {
          name: 'Jeff Lakata',
          date: 'July 11, July 25',
          time: '6:00 PM',
          rating: 3,
          description: 'Somerset/Toms River guitarist with 20 years gigging experience',
          vibe: 'Classic rock to country and sing-alongs',
          reviews: 'Also plays with Drunken Clams',
          socialMedia: 'Facebook: 529 likes',
          regularVenues: 'Jersey Shore circuit',
          weddingBand: false,
          tags: ['Classic Rock', 'Country', 'Covers']
        },
        {
          name: 'Sketchy Medicine',
          date: 'August 8',
          time: '6:00 PM',
          rating: 3,
          description: 'Classic Rock-n-Roll Band to Soothe Your Musical Needs',
          vibe: 'Classic rock covers',
          reviews: 'Facebook: 458 likes',
          regularVenues: 'Forked River, NJ area',
          weddingBand: false,
          tags: ['Classic Rock', 'Rock n Roll']
        },
        {
          name: 'The Flying Ivories',
          date: 'August 28',
          time: '6:00 PM',
          rating: 3,
          description: 'Dueling pianos, interactive but different format',
          vibe: 'Request-based performance',
          weddingBand: true,
          tags: ['Dueling Pianos', 'Interactive']
        },
        {
          name: 'Sean Patrick & The Alibis',
          date: 'September 13',
          time: '6:00 PM',
          rating: 3,
          description: 'Promising but limited info',
          vibe: 'Unknown',
          weddingBand: null,
          tags: ['Unknown']
        }
      ]
    },
    {
      id: 'too-mellow-acoustic',
      name: '🎸 Too Mellow/Acoustic',
      bands: [
        {
          name: 'Tom Vincent',
          date: 'June 29, August 3',
          time: '3:00 PM',
          rating: 2,
          description: 'Solo acoustic performer',
          vibe: 'Mellow afternoon vibes',
          weddingBand: false,
          tags: ['Acoustic', 'Solo', 'Mellow']
        },
        {
          name: 'Gina Teschke',
          date: 'June 21, September 7',
          time: '6:00 PM / 10:30 AM',
          rating: 2,
          description: 'Versatile singer but may lean pop/jazz',
          vibe: 'Restaurant performer',
          weddingBand: false,
          tags: ['Pop', 'Jazz', 'Versatile']
        },
        {
          name: 'Charlie Brown',
          date: 'June 14, June 28',
          time: '6:00 PM',
          rating: 2,
          description: 'Wide variety including Christian music',
          vibe: 'Family-friendly covers',
          weddingBand: false,
          tags: ['Covers', 'Family-Friendly']
        },
        {
          name: 'Trane Stevens Solo',
          date: 'August 1',
          time: '6:00 PM',
          rating: 2,
          description: 'Multi-genre but limited info',
          vibe: 'Solo performer',
          weddingBand: false,
          tags: ['Solo', 'Multi-Genre']
        }
      ]
    },
    {
      id: 'avoid-wrong-style',
      name: '❌ Bands to Avoid (Wrong Style for Your Needs)',
      bands: [
        {
          name: 'Priceless Band',
          date: 'June 7, August 2',
          time: '6:00 PM',
          rating: 1,
          description: 'Traditional polished wedding band',
          vibe: 'Classic wedding entertainment',
          weddingBand: true,
          tags: ['Wedding Band', 'Traditional']
        },
        {
          name: 'Black Tie Groove Band',
          date: 'June 20',
          time: '6:00 PM',
          rating: 1,
          description: 'Sophistication and polish - exactly what you don\'t want',
          vibe: 'Formal event band',
          weddingBand: true,
          tags: ['Wedding Band', 'Formal']
        },
        {
          name: 'Suyat Band',
          date: 'July 18, September 14',
          time: '6:00 PM / 10:30 AM',
          rating: 1,
          description: 'Hawaiian/reggae wedding specialty',
          vibe: 'Tropical wedding vibes',
          weddingBand: true,
          tags: ['Hawaiian', 'Reggae', 'Wedding']
        },
        {
          name: 'E Boro Bandits',
          date: 'August 16',
          time: '6:00 PM',
          rating: 1,
          description: 'Country/wedding focus',
          vibe: 'Country covers',
          weddingBand: true,
          tags: ['Country', 'Wedding']
        },
        {
          name: 'The Verdict',
          date: 'August 29',
          time: '6:00 PM',
          rating: 2,
          description: 'Caribbean/reggae specialist',
          vibe: 'Island rhythms',
          weddingBand: false,
          tags: ['Reggae', 'Caribbean']
        },
        {
          name: 'XOL Azul Band',
          date: 'August 14',
          time: '6:00 PM',
          rating: 1,
          description: 'Latin rock focus',
          vibe: 'Latin rhythms',
          weddingBand: false,
          tags: ['Latin', 'Rock']
        },
        {
          name: 'Jeiris Cook',
          date: 'August 23',
          time: '6:00 PM',
          rating: 1,
          description: 'R&B/soul acoustic, too intimate',
          vibe: 'Intimate acoustic sets',
          weddingBand: false,
          tags: ['R&B', 'Soul', 'Acoustic']
        },
        {
          name: 'Pat Guadagno',
          date: 'July 6, September 1',
          time: '3:00 PM / 2:00 PM',
          rating: 1,
          description: 'Folk/Americana troubadour',
          vibe: 'Singer-songwriter',
          weddingBand: false,
          tags: ['Folk', 'Americana', 'Acoustic']
        },
        {
          name: 'Rick Winow',
          date: 'July 12, July 27, August 16, September 21',
          time: 'Various',
          rating: 1,
          description: 'Acoustic singer-songwriter',
          vibe: 'Restaurant background music',
          weddingBand: false,
          tags: ['Acoustic', 'Singer-Songwriter']
        },
        {
          name: 'Rob Dye Duo',
          date: 'July 19, August 10',
          time: '6:00 PM / 3:00 PM',
          rating: 1,
          description: 'Original Americana artist',
          vibe: 'Original music focus',
          weddingBand: false,
          tags: ['Americana', 'Original']
        },
        {
          name: 'The Sheepherders',
          date: 'July 19',
          time: '6:00 PM',
          rating: 1,
          description: 'Experimental/jam-band style',
          vibe: 'Moroccan Sheepherders - experimental',
          weddingBand: false,
          tags: ['Experimental', 'Jam Band']
        },
        {
          name: 'Megan Cannon',
          date: 'June 1',
          time: '3:00 PM',
          rating: 1,
          description: 'Original country-pop songwriter',
          vibe: 'Seattle indie artist',
          weddingBand: false,
          tags: ['Country-Pop', 'Original', 'Indie']
        }
      ]
    }
  ],
  
  quickReference: {
    title: 'Quick Reference: Your Best Bets',
    sections: [
      {
        title: 'For 90s/2000s Rock',
        bands: ['The Benjamins', 'Undisputed', 'No Standards']
      },
      {
        title: 'For Classic Rock Energy',
        bands: ['Smoking Jackets', 'The Cliffs', 'Audio Riots', 'Blue Collar Band Trio']
      },
      {
        title: 'For Jersey Shore Rock',
        bands: ['Pat Roddy Band', 'Brian Kirk & The Jirks']
      },
      {
        title: 'For Modern Party Vibes',
        bands: ['The Ruckus', 'The Rockets', 'Daddy Pop', 'Those Guys']
      }
    ]
  },
  
  finalRecommendation: {
    title: 'Final Recommendation',
    text: 'Focus your summer 2025 visits on performances by The Benjamins, Brian Kirk & The Jirks, Audio Riots, The Cliffs, and Smoking Jackets. These bands deliver the high-energy classic rock and 90s/2000s covers you want without the polished "wedding band" feel. Also check out Blue Collar Band Trio for mashups and party vibes, and Those Guys for funk-infused party rock. All are established on the Jersey Shore bar/club circuit while maintaining the professionalism needed for Edgewater\'s upscale beach club atmosphere.'
  },
  
  // Additional data for filtering/searching
  allDates: [
    { date: '2025-06-01', bands: ['Megan Cannon'] },
    { date: '2025-06-07', bands: ['Aaron Manzo', 'Priceless Band'] },
    { date: '2025-06-08', bands: ['Larry Alter'] },
    { date: '2025-06-14', bands: ['Charlie Brown', 'The Ruckus'] },
    { date: '2025-06-15', bands: ['Chris Morrisy'] },
    { date: '2025-06-20', bands: ['Black Tie Groove Band'] },
    { date: '2025-06-21', bands: ['Gina Teschke', 'Smoking Jackets'] },
    { date: '2025-06-27', bands: ['Blue Collar Band Trio'] },
    { date: '2025-06-28', bands: ['Charlie Brown', 'The Rockets'] },
    { date: '2025-06-29', bands: ['Tom Vincent'] },
    { date: '2025-07-03', bands: ['The Kicks'] },
    { date: '2025-07-04', bands: ['Audio Riots'] },
    { date: '2025-07-05', bands: ['Chris Morrisy Duo', 'The Cliffs'] },
    { date: '2025-07-06', bands: ['Pat Guadagno'] },
    { date: '2025-07-11', bands: ['Jeff Lakata'] },
    { date: '2025-07-12', bands: ['Alternate Groove Band', 'Rick Winow'] },
    { date: '2025-07-13', bands: ['Larry Alter'] },
    { date: '2025-07-17', bands: ['Brian Kirk & The Jirks'] },
    { date: '2025-07-18', bands: ['Suyat Band'] },
    { date: '2025-07-19', bands: ['Rob Dye Duo', 'The Sheepherders'] },
    { date: '2025-07-20', bands: ['Chris Morrisy Duo'] },
    { date: '2025-07-25', bands: ['Jeff Lakata'] },
    { date: '2025-07-27', bands: ['Rick Winow'] },
    { date: '2025-07-31', bands: ['Pat Roddy Band'] },
    { date: '2025-08-01', bands: ['Trane Stevens Solo'] },
    { date: '2025-08-02', bands: ['Bob Gilmartin', 'Priceless Band'] },
    { date: '2025-08-03', bands: ['Tom Vincent'] },
    { date: '2025-08-08', bands: ['Sketchy Medicine'] },
    { date: '2025-08-09', bands: ['Alternate Groove Band', 'Scott Elk'] },
    { date: '2025-08-10', bands: ['Rob Dye Duo'] },
    { date: '2025-08-14', bands: ['XOL Azul Band'] },
    { date: '2025-08-15', bands: ['The Kicks'] },
    { date: '2025-08-16', bands: ['E Boro Bandits', 'Rick Winow'] },
    { date: '2025-08-17', bands: ['Suyat Duo'] },
    { date: '2025-08-22', bands: ['No Standards'] },
    { date: '2025-08-23', bands: ['Daddy Pop', 'Jeiris Cook'] },
    { date: '2025-08-24', bands: ['Brian Kirk & The Jirks'] },
    { date: '2025-08-28', bands: ['The Flying Ivories'] },
    { date: '2025-08-29', bands: ['The Verdict'] },
    { date: '2025-08-30', bands: ['Alternate Groove Band', 'Larry Alter'] },
    { date: '2025-08-31', bands: ['The Kicks'] },
    { date: '2025-09-01', bands: ['Pat Guadagno'] },
    { date: '2025-09-06', bands: ['The Benjamins'] },
    { date: '2025-09-07', bands: ['Gina Teschke'] },
    { date: '2025-09-13', bands: ['Sean Patrick & The Alibis'] },
    { date: '2025-09-14', bands: ['Suyat Band', 'Brian Kirk & The Jirks'] },
    { date: '2025-09-20', bands: ['Those Guys'] },
    { date: '2025-09-21', bands: ['Rick Winow'] },
    { date: '2025-09-27', bands: ['Undisputed'] }
  ]
};