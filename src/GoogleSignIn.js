import React, { useEffect } from 'react';

const GoogleSignIn = ({ onSuccess, onError }) => {
  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com',
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left'
        }
      );
    }
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      // Send the credential to our backend
      const result = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: response.credential
        })
      });

      const data = await result.json();

      if (result.ok) {
        onSuccess(data);
      } else {
        onError(data.message || 'Google sign-in failed');
      }
    } catch (error) {
      onError('Network error during Google sign-in');
    }
  };

  return (
    <div>
      <div id="google-signin-button"></div>
      <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
        Note: You'll need to configure Google OAuth credentials to use this feature.
        See GOOGLE_OAUTH_SETUP.md for instructions.
      </p>
    </div>
  );
};

export default GoogleSignIn;