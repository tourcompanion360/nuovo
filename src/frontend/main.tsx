/**
 * Frontend Entry Point
 * Main entry point for the TourCompanion SaaS frontend
 */

import { createRoot } from 'react-dom/client';
import React from 'react';
import App from './App.tsx';
import './styles/index.css';

// Import PWA utilities
import { registerServiceWorker, setupOfflineDetection } from '../utils/pwaUtils';

// Ensure favicon loads immediately
const updateFavicon = () => {
  const favicon = document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement;
  if (favicon) {
    favicon.href = '/favicon.ico?v=' + Date.now();
  }
  
  // Also update other favicon links
  const faviconPng = document.querySelector('link[rel="icon"][type="image/png"]') as HTMLLinkElement;
  if (faviconPng) {
    faviconPng.href = '/favicon-96x96.png?v=' + Date.now();
  }
  
  const faviconSvg = document.querySelector('link[rel="icon"][type="image/svg+xml"]') as HTMLLinkElement;
  if (faviconSvg) {
    faviconSvg.href = '/favicon.svg?v=' + Date.now();
  }
};

// Update favicon immediately when the app loads
updateFavicon();

// Initialize PWA features only in production to avoid dev caching/blank screens
if (import.meta.env.PROD) {
  registerServiceWorker();
  setupOfflineDetection();
} else {
  // In development, proactively unregister any existing service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    }).catch(() => {});
  }
}

// Create React root and render app
const container = document.getElementById("root");
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(<App />);

