import React from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './index.css';

// Get Google Client ID from environment variable
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Validate Google Client ID
if (!GOOGLE_CLIENT_ID) {
  console.error('Google Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file.');
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <React.StrictMode>
    <GoogleOAuthProvider 
      clientId={GOOGLE_CLIENT_ID || ''} 
      onScriptLoadError={() => console.error('Failed to load Google OAuth script')}
    >
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);