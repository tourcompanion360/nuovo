import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Bell, 
  BarChart3, 
  Download, 
  Star
} from 'lucide-react';

interface ClientWelcomeBannerProps {
  clientName: string;
  projectTitle: string;
  stats?: {
    views: number;
    visitors: number;
    interactions: number;
  };
  onDismiss: () => void;
  onShowOnboarding: () => void;
}

export const ClientWelcomeBanner: React.FC<ClientWelcomeBannerProps> = ({
  clientName,
  projectTitle,
  stats,
  onDismiss,
  onShowOnboarding
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  if (!isVisible) return null;

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Welcome back, {clientName}!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your "{projectTitle}" project portal
                </p>
              </div>
            </div>


            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onShowOnboarding}
                className="flex items-center gap-2"
              >
                <Star className="h-4 w-4" />
                Take Tour
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                View Analytics
              </Button>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
