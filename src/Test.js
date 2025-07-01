import React from 'react';

const Test = () => {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Frontend Test Page</h1>
      <p>If you can see this, the React app is running!</p>
      <button onClick={() => {
        fetch('/api/auth/me')
          .then(res => res.json())
          .then(data => console.log('API test:', data))
          .catch(err => console.error('API error:', err));
      }}>
        Test API Connection
      </button>
    </div>
  );
};

export default Test;