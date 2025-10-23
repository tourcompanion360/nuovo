/**
 * Developer Mode Banner
 * Shows when the app is running in developer mode
 */

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { isDevMode, shouldShowDevBanner } from '../config/dev-mode';

const DevModeBanner: React.FC = () => {
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isDevMode() || !shouldShowDevBanner() || !isVisible) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-30 p-4">
      <Card className="bg-yellow-50 border-yellow-200 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-800">Developer Mode Active</h3>
                <p className="text-sm text-yellow-700">
                  All subscription and payment restrictions are bypassed. This is for testing only.
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="text-yellow-600 hover:text-yellow-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevModeBanner;
