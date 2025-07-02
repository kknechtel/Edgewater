import React from 'react';

const HomeEventsSection = ({ upcomingEvents, setActiveTab, handleRsvp, getEventDateLabel, styles }) => {
  return (
    <div style={styles.card}>
      <h2 
        style={{...styles.cardTitle, cursor: 'pointer'}}
        onClick={() => {
          setActiveTab('calendar');
        }}
      >
        <span>📅</span> Upcoming Events
      </h2>
      
      {upcomingEvents.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          backgroundColor: '#f9fafb',
          borderRadius: '0.75rem',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
          <p style={{ 
            color: '#6b7280', 
            marginBottom: '1rem',
            fontSize: '1rem'
          }}>
            No upcoming events found
          </p>
          <button
            onClick={() => setActiveTab('calendar')}
            style={{
              backgroundColor: '#0891b2',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            View Calendar
          </button>
        </div>
      ) : (
        <div>
          {upcomingEvents.map(event => (
            <div 
              key={event.id} 
              style={{
                backgroundColor: '#f3f4f6',
                borderRadius: '0.75rem',
                padding: '1rem',
                border: '1px solid #e5e7eb',
                marginBottom: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => {
                setActiveTab('calendar');
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    marginBottom: '0.25rem',
                    color: '#111827'
                  }}>
                    {event.title}
                  </h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#4b5563'
                  }}>
                    {getEventDateLabel(event.event_date)} • {event.event_time || 'Time TBD'}
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    marginTop: '0.25rem'
                  }}>
                    👥 {event.attendeeCount || 0} attending
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRsvp(event.id);
                  }}
                  style={{
                    backgroundColor: event.userRsvp ? '#10b981' : '#0891b2',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    minHeight: '44px'
                  }}
                >
                  {event.userRsvp ? '✓ Going' : 'RSVP'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomeEventsSection;