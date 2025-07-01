import React, { useEffect } from 'react';

const GoogleSignIn = ({ onSuccess, onError }) => {
  useEffect(() => {
    console.log('Google Client ID:', '951154910259-j8tncrdvanjn5d7drn167mvjf56tln3r.apps.googleusercontent.com');
    console.log('Current domain:', window.location.hostname);
    
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: '951154910259-j8tncrdvanjn5d7drn167mvjf56tln3r.apps.googleusercontent.com',
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

  const handleCredentialResponse = (response) => {
    // Pass the credential response directly to the parent
    onSuccess({ token: response.credential });
  };

  return (
    <div>
      <div id="google-signin-button"></div>
    </div>
  );
};

export default GoogleSignIn;