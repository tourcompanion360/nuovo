/**
 * Subscription Gate Component
 * Blocks access to features based on subscription status
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Crown, Lock, CreditCard, AlertCircle } from 'lucide-react';
// Dev-mode bypass removed; only testers or active subs allowed

interface SubscriptionStatus {
  isActive: boolean;
  isTester: boolean;
  plan: 'basic' | 'pro' | null;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'unpaid' | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  limits: {
    maxProjects: number;
    maxClients: number;
    maxChatbots: number;
    analyticsAccess: boolean;
    customBranding: boolean;
    apiAccess: boolean;
  };
}

interface SubscriptionGateProps {
  children: React.ReactNode;
  requiredFeature?: 'basic' | 'pro';
  fallbackMessage?: string;
  showUpgradePrompt?: boolean;
}

const SubscriptionGate: React.FC<SubscriptionGateProps> = ({
  children,
  requiredFeature = 'basic',
  fallbackMessage,
  showUpgradePrompt = true,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        navigate('/auth');
        return;
      }

      const response = await fetch('/api/billing/subscription-status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('jwt_token');
        navigate('/auth');
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        setSubscriptionStatus(data.data);
        
        // Check if user has access
        const access = data.data.isTester || 
                      (data.data.isActive && 
                       (requiredFeature === 'basic' || 
                        (requiredFeature === 'pro' && data.data.plan === 'pro')));
        
        setHasAccess(access);
      } else {
        console.error('Failed to get subscription status:', data.error);
        setHasAccess(false);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  const handleManageBilling = async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) return;

      const response = await fetch('/api/billing/customer-portal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        window.open(data.data.url, '_blank');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to open billing portal',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast({
        title: 'Error',
        description: 'Failed to open billing portal',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  // Show subscription required message
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <Lock className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle className="text-xl">Subscription Required</CardTitle>
          <CardDescription>
            {fallbackMessage || `This feature requires a ${requiredFeature} subscription.`}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {subscriptionStatus && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Status:</span>
                <Badge variant={subscriptionStatus.isActive ? 'default' : 'destructive'}>
                  {subscriptionStatus.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              {subscriptionStatus.plan && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Plan:</span>
                  <Badge variant="outline">
                    {subscriptionStatus.plan.charAt(0).toUpperCase() + subscriptionStatus.plan.slice(1)}
                  </Badge>
                </div>
              )}

              {subscriptionStatus.cancelAtPeriodEnd && (
                <div className="flex items-center space-x-2 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Subscription will cancel at period end</span>
                </div>
              )}
            </div>
          )}

          {showUpgradePrompt && (
            <div className="space-y-3">
              <Button 
                onClick={handleUpgrade} 
                className="w-full"
                size="lg"
              >
                <Crown className="h-4 w-4 mr-2" />
                {subscriptionStatus?.isActive ? 'Upgrade Plan' : 'Choose a Plan'}
              </Button>
              
              {subscriptionStatus?.isActive && (
                <Button 
                  onClick={handleManageBilling} 
                  variant="outline" 
                  className="w-full"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Billing
                </Button>
              )}
            </div>
          )}

          {requiredFeature === 'pro' && subscriptionStatus?.plan === 'basic' && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-1">Upgrade to Pro</h4>
              <p className="text-sm text-blue-700">
                Unlock unlimited projects, advanced analytics, custom branding, and API access.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionGate;
