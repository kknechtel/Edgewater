import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/darkMode.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful:', registration.scope);
      })
      .catch(err => {
        console.log('ServiceWorker registration failed:', err);
      });
  });
}

// Check if app is installed as PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Could show install button here
});

console.log('App updated at: Tue July 1 16:54:00 EDT 2025');
/* PWA Support Added */
