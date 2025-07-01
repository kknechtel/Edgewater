# PROJECT STRUCTURE

## Overview
This is the Edgewater Beach Club mobile web application built with React. The app provides members with access to events, band schedules, messaging, photos, and various beach club activities.

## Core Architecture

### 1. Entry Points
- **`/src/index.js`** - Main entry point that renders the App component
- **`/src/App.js`** - Sets up routing with React Router, wraps app in AuthProvider
  - Routes: `/login` → Login component
  - Routes: `/` → Protected MobileApp component

### 2. Main Components

#### **`/src/components/MobileApp.js`** 
- Central navigation hub for the mobile app
- Contains bottom navigation with 5 tabs:
  - Home → HomeView
  - Events → Calendar
  - Cornhole → BagsView 
  - SasqWatch → SasqWatch
  - Chat → Messages

### 3. Feature Components (`/src/components/features/`)

#### **Calendar.js** - Main events and band calendar
- Displays events in calendar grid format
- Shows band performances from `bandGuideData.js`
- Handles event creation and attendance tracking
- Includes integrated band guide with search/filter
- Combines data from:
  - API events (`/api/events`)
  - Band data from `bandGuideData.js`
  - Local storage (band events, tournament events)

#### **HomeView.js** - Dashboard/home screen
#### **Messages.js** - Chat functionality  
#### **Music.js** - Music player/playlists
#### **Photos.js** - Photo sharing
#### **SasqWatch.js** - Beach activity tracking

### 4. View Components (`/src/components/views/`)
- **CalendarView.js** - Alternative calendar view (uses eventService)
- **BagsView.js** - Cornhole tournament management
- **MusicView.js** - Music/band information
- **MessagesView.js** - Messaging view
- **PhotosView.js** - Photo gallery
- **SasqWatchView.js** - Activity tracking
- **ProfileSettingsView.js** - User settings
- **DinnerView.js** - Dinner event planning
- **ComingSoonView.js** - Placeholder for future features

### 5. Data Sources

#### **`/src/data/bandGuideData.js`**
Primary source for band information containing:
- **Categories array** with band groups:
  - Top Recommendations (5 stars)
  - Strong Contenders (4 stars)  
  - Approach with Caution (3 stars)
  - Too Mellow/Acoustic (2 stars)
  - Avoid Wrong Style (1 star)
- **Band objects** with properties:
  - `name` - Band name
  - `date` - Performance dates (format: "June 21", "July 17, August 24, September 14")
  - `time` - Performance times  
  - `rating` - 1-5 star rating
  - `description` - Band description
  - `vibe` - Musical style/atmosphere
  - `tags` - Genre tags
- **allDates array** - Normalized date mapping:
  - Maps dates to band names performing that day
  - Format: `{ date: '2025-06-01', bands: ['Band Name'] }`

### 6. Services (`/src/services/`)

#### **eventService.js**
- API service for event CRUD operations
- Methods: getEvents, createEvent, updateEvent, deleteEvent
- Uses axios for HTTP requests

#### **authService.js** - Authentication API calls
#### **weatherService.js** - Weather data API
#### **sasqwatchService.js** - Activity tracking API
#### **api.js** - Base API configuration

### 7. Context (`/src/contexts/`)
- **AuthContext.js** - Global authentication state management

### 8. Data Flow

#### Event Data Flow:
1. **Band Data Source**: `bandGuideData.js` → Calendar component
   - Band dates are parsed from strings like "June 21", "July 17, August 24"
   - The `allDates` array provides normalized date-to-band mapping
   
2. **API Events**: Backend API → eventService → Calendar/CalendarView components
   - Events fetched via `/api/events` endpoint
   - Stored with full datetime format

3. **Local Storage Events**:
   - Band events: `localStorage.getItem('beach_bands')`
   - Tournament events: `localStorage.getItem('bags_tournaments')`

4. **Combined Display**:
   - Calendar component merges all three sources
   - Shows bands as purple badges on calendar dates
   - Shows API events with attendance tracking
   - Selected date shows detailed band/event info

#### Band Date Processing:
- Raw format in `bandGuideData.js`: "June 21", "July 17, August 24, September 14"
- Calendar parses these by:
  1. Splitting multiple dates by comma
  2. Adding year (2025) for full date parsing
  3. Matching against calendar grid dates
- The `allDates` array provides pre-processed date mappings

### 9. Key Features

#### Calendar Features:
- Monthly calendar grid view
- Event creation with types: party, concert, gathering, dinner
- Band guide integration with search/filter
- Attendance tracking (I'm Going / Can't Make It)
- Band performance schedule from real data
- Upcoming bands preview

#### Band Guide Features:
- Categorized band listings
- Search by name, description, or vibe
- Filter by category/rating
- Performance dates and times
- Rating system (1-5 stars)
- Venue and social media info

### 10. Component Connections

```
App.js
  └── MobileApp.js (Protected Route)
       ├── HomeView.js
       ├── Calendar.js ← Uses bandGuideData.js
       │    ├── Fetches API events
       │    ├── Loads localStorage events  
       │    └── Displays band performances
       ├── BagsView.js
       ├── SasqWatch.js
       └── Messages.js
```

### 11. Important Notes

- The app assumes all band performances are in 2025
- Band dates need year appended for proper parsing
- Multiple performance dates are comma-separated in source data
- The Calendar component is the primary integration point for all event types
- Local storage is used for offline band/tournament data persistence