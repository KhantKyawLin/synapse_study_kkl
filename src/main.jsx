import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register offline resilience Service Worker (like kkl-portfolio)
if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      console.log('[Synapse] Service Worker registered with scope:', registration.scope);
    }).catch((err) => {
      console.warn('[Synapse] Service Worker registration failed:', err);
    });
  });
}
