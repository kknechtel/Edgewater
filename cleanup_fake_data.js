#!/usr/bin/env node

// Cleanup script to remove all fake/test data from localStorage and prepare for production

console.log('🧹 Cleaning up fake data...\n');

// List of localStorage keys that contain test/fake data
const keysToRemove = [
  'test_events',
  'beach_club_messages',
  'beach_club_unread',
  'beach_club_rsvps',
  'beach_club_attendees',
  'bags_tournaments',
  'bagsDailyStats',
  'bagsPlayerStats',
  'bagsWaitlist',
  'beach_bands',
  'user_profile',
  'userLocation'
];

// Remove from localStorage (for browser execution)
const cleanupBrowser = () => {
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`✅ Removed: ${key}`);
    }
  });
  console.log('\n🎉 All fake data cleared! App is ready for real users.');
};

// Instructions for running in browser console
console.log('To clean up fake data, run this in your browser console:');
console.log('----------------------------------------');
console.log(`
const keysToRemove = ${JSON.stringify(keysToRemove, null, 2)};

keysToRemove.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log('✅ Removed:', key);
  }
});

console.log('\\n🎉 All fake data cleared!');
`);
console.log('----------------------------------------');

// Also remove fake users from components
console.log('\n📝 Components to update:');
console.log('1. Remove fallback test users from BagsView.js');
console.log('2. Remove hardcoded attendees from HomeView.js');
console.log('3. Remove test data creation from rsvpService.js');