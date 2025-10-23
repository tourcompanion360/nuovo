// PWA Service Worker Registration
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Detect if we're in a client portal
      const isClientPortal = window.location.pathname.startsWith('/client/');
      const scope = isClientPortal ? window.location.pathname : '/';
      
      console.log('Registering service worker with scope:', scope);
      
      navigator.serviceWorker.register('/sw.js', { scope })
        .then((registration) => {
          console.log('SW registered with scope:', scope, registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, show update notification
                  const message = isClientPortal 
                    ? 'New version available! Reload to update?' 
                    : 'Nuova versione disponibile! Vuoi ricaricare per aggiornare?';
                  
                  if (confirm(message)) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });

      // Listen for controlling service worker change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    });
  }
};

// PWA install prompt functionality removed - no more install popups

// Check if running as PWA
export const isPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone ||
         document.referrer.includes('android-app://');
};

// Handle shortcut parameters
export const handleShortcuts = (onPageChange: (page: string) => void) => {
  const urlParams = new URLSearchParams(window.location.search);
  const shortcut = urlParams.get('shortcut');
  
  switch (shortcut) {
    case 'tours':
      onPageChange('tour-virtuali');
      break;
    case 'appointments':
      onPageChange('appuntamenti');
      break;
    case 'stats':
      onPageChange('statistiche');
      break;
    default:
      break;
  }
};

// Offline detection
export const setupOfflineDetection = () => {
  const updateOnlineStatus = () => {
    const status = navigator.onLine ? 'online' : 'offline';
    document.body.setAttribute('data-connection', status);
    
    if (!navigator.onLine) {
      showOfflineMessage();
    } else {
      hideOfflineMessage();
    }
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();
};

const showOfflineMessage = () => {
  const existingMessage = document.querySelector('[data-offline-message]');
  if (existingMessage) return;

  const offlineMessage = document.createElement('div');
  offlineMessage.setAttribute('data-offline-message', 'true');
  offlineMessage.textContent = '📡 Modalità offline - Alcune funzioni potrebbero non essere disponibili';
  offlineMessage.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: hsl(var(--warning));
    color: hsl(var(--warning-foreground));
    text-align: center;
    padding: 8px;
    font-size: 14px;
    z-index: 9999;
    animation: slideInDown 0.3s ease;
  `;

  document.body.appendChild(offlineMessage);
};

const hideOfflineMessage = () => {
  const offlineMessage = document.querySelector('[data-offline-message]');
  if (offlineMessage) {
    offlineMessage.remove();
  }
};