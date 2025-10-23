import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Smartphone, Monitor, X } from 'lucide-react';

interface ClientPortalPWAProps {
  projectId: string;
  clientName: string;
  className?: string;
}

export const ClientPortalPWA: React.FC<ClientPortalPWAProps> = ({ 
  projectId, 
  clientName, 
  className 
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(true); // Always show by default
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    console.log('ClientPortalPWA component mounted for project:', projectId, 'client:', clientName);
    
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('App is already installed (standalone mode)');
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app was installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed or dismissed
  if (isInstalled || sessionStorage.getItem('pwa-install-dismissed')) {
    console.log('PWA Install prompt not showing:', { isInstalled, dismissed: sessionStorage.getItem('pwa-install-dismissed') });
    return null;
  }

  // Always show the install prompt (unless dismissed or installed)
  console.log('PWA Install prompt showing:', { showInstallPrompt, isInstalled });

  return (
    <Card className={`border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
              Install App
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-blue-700 dark:text-blue-300">
          Install this portal as an app on your device for quick access to your {clientName} dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-blue-700 dark:text-blue-300">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            <span>Mobile App</span>
          </div>
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            <span>Desktop App</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          {deferredPrompt ? (
            <Button 
              onClick={handleInstallClick}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Install App
            </Button>
          ) : (
            <div className="flex-1 space-y-2">
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                Manual Installation:
              </p>
              <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                <p><strong>Mobile:</strong> Tap browser menu → "Add to Home Screen"</p>
                <p><strong>Desktop:</strong> Click browser menu → "Install App"</p>
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-blue-600 dark:text-blue-400">
          <p>• Quick access from your home screen</p>
          <p>• Works offline with cached data</p>
          <p>• Push notifications for updates</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Hook to detect PWA installation
export const usePWAInstall = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return { isInstallable, isInstalled };
};
