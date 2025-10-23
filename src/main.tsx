import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import React from 'react';
import App from './App';
import './index.css';

// Error Boundary Component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean; error?: Error}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // You can also log the error to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          maxWidth: '600px',
          margin: '0 auto',
          textAlign: 'center',
          color: '#1f2937'
        }}>
          <h1 style={{ color: '#ef4444', marginBottom: '1rem' }}>Something went wrong</h1>
          {import.meta.env.DEV && this.state.error && (
            <details style={{ 
              marginBottom: '1.5rem',
              textAlign: 'left',
              backgroundColor: '#f3f4f6',
              padding: '1rem',
              borderRadius: '0.5rem',
              overflow: 'auto',
              maxHeight: '200px'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 500 }}>Error details</summary>
              <pre style={{ whiteSpace: 'pre-wrap', margin: '0.5rem 0 0', color: '#dc2626' }}>
                {this.state.error.toString()}
                {this.state.error.stack && `\n\n${this.state.error.stack}`}
              </pre>
            </details>
          )}
          <p style={{ marginBottom: '1.5rem' }}>
            Please refresh the page or try again later.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1.25rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Simple console log to verify script execution
console.log('🚀 Application initializing...');

// Initialize PWA in the background
const initPWA = async () => {
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    try {
      // Dynamically import the service worker registration
      const { registerServiceWorker } = await import('./utils/pwaUtils');
      await registerServiceWorker();
    } catch (error) {
      console.warn('Failed to initialize PWA:', error);
    }
  }
};

// Get root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  // If root element is not found, show error and prevent further execution
  document.body.innerHTML = `
    <div style="
      padding: 2rem;
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      text-align: center;
      color: #1f2937;
    ">
      <h1 style="color: #ef4444; margin-bottom: 1rem;">Application Error</h1>
      <p style="margin-bottom: 1.5rem;">
        Failed to initialize the application. The root element was not found.
      </p>
      <button 
        onclick="window.location.reload()"
        style="
          padding: 0.5rem 1.25rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.2s;
        "
        onmouseover="this.style.backgroundColor='#2563eb'"
        onmouseout="this.style.backgroundColor='#3b82f6'"
      >
        Reload Page
      </button>
    </div>
  `;
  throw new Error('Root element not found');
}

// Initialize the application
try {
  // Create root once
  const root = createRoot(rootElement);
  
  // Single render with proper error boundaries
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
  
  console.log('✅ Application initialized successfully');
  
  // Initialize PWA after initial render
  initPWA().catch(console.error);
  
} catch (error) {
  console.error('❌ Failed to initialize application:', error);
  
  // Fallback error UI in case rendering fails
  rootElement.innerHTML = `
    <div style="
      padding: 2rem;
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      text-align: center;
    ">
      <h1 style="color: #ef4444; margin-bottom: 1rem;">Critical Error</h1>
      <p style="margin-bottom: 1.5rem;">
        ${error instanceof Error ? error.message : 'An unexpected error occurred while initializing the application.'}
      </p>
      <button 
        onclick="window.location.reload()"
        style="
          padding: 0.5rem 1.25rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.2s;
        "
        onmouseover="this.style.backgroundColor='#2563eb'"
        onmouseout="this.style.backgroundColor='#3b82f6'"
      >
        Reload Application
      </button>
    </div>
  `;
}
