/**
 * Billing Management Page
 * Allows users to manage their subscription, view billing history, and access Stripe Customer Portal
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Settings, 
  AlertCircle, 
  CheckCircle2, 
  Crown,
  Zap,
  Loader2,
  ExternalLink
} from 'lucide-react';
// Dev-mode bypass removed for production safety

interface SubscriptionData {
  plan: 'basic' | 'pro' | null;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'unpaid' | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  isTester: boolean;
  limits: {
    maxProjects: number;
    maxClients: number;
    maxChatbots: number;
    analyticsAccess: boolean;
    customBranding: boolean;
    apiAccess: boolean;
  };
}

const Billing: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      // No dev-mode mock; always load real subscription data

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
        localStorage.removeItem('jwt_token');
        navigate('/auth');
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        setSubscriptionData(data.data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load subscription data',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setActionLoading('manage');
    try {
      // Always open real customer portal

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
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access at the end of your current billing period.')) {
      return;
    }

    setActionLoading('cancel');
    try {
      // Always perform real cancellation

      const token = localStorage.getItem('jwt_token');
      if (!token) return;

      const response = await fetch('/api/billing/cancel-subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Subscription Cancelled',
          description: 'Your subscription will be cancelled at the end of the current period.',
        });
        loadSubscriptionData(); // Refresh data
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to cancel subscription',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivateSubscription = async () => {
    setActionLoading('reactivate');
    try {
      // Always perform real reactivation

      const token = localStorage.getItem('jwt_token');
      if (!token) return;

      const response = await fetch('/api/billing/reactivate-subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Subscription Reactivated',
          description: 'Your subscription has been reactivated.',
        });
        loadSubscriptionData(); // Refresh data
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to reactivate subscription',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to reactivate subscription',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="ml-4 text-lg text-gray-700 dark:text-gray-300">Loading billing information...</p>
      </div>
    );
  }

  if (!subscriptionData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle>No Subscription Found</CardTitle>
            <CardDescription>
              You don't have an active subscription. Choose a plan to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleUpgrade} className="w-full">
              Choose a Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'past_due': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="h-4 w-4" />;
      case 'past_due': return <AlertCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatLimits = (limit: number) => {
    return limit === -1 ? 'Unlimited' : limit.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Billing & Subscription
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your subscription, billing information, and account settings.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {subscriptionData.plan === 'pro' ? (
                  <Crown className="h-5 w-5 text-purple-600 mr-2" />
                ) : (
                  <Zap className="h-5 w-5 text-blue-600 mr-2" />
                )}
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {subscriptionData.plan ? subscriptionData.plan.charAt(0).toUpperCase() + subscriptionData.plan.slice(1) : 'No Plan'}
                </span>
                <Badge className={getStatusColor(subscriptionData.status || 'inactive')}>
                  {getStatusIcon(subscriptionData.status || 'inactive')}
                  <span className="ml-1">{subscriptionData.status || 'Inactive'}</span>
                </Badge>
              </div>

              {subscriptionData.isTester && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <Crown className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-900">Tester Account</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    You have full access to all features as a tester.
                  </p>
                </div>
              )}

              {subscriptionData.currentPeriodEnd && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    {subscriptionData.cancelAtPeriodEnd ? 'Cancels on' : 'Renews on'}: {formatDate(subscriptionData.currentPeriodEnd)}
                  </span>
                </div>
              )}

              {subscriptionData.cancelAtPeriodEnd && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                    <span className="text-sm font-medium text-yellow-900">Cancellation Scheduled</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your subscription will be cancelled at the end of the current period.
                  </p>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Plan Limits</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Projects: {formatLimits(subscriptionData.limits.maxProjects)}</div>
                  <div>Clients: {formatLimits(subscriptionData.limits.maxClients)}</div>
                  <div>Chatbots: {formatLimits(subscriptionData.limits.maxChatbots)}</div>
                  <div>Analytics: {subscriptionData.limits.analyticsAccess ? 'Yes' : 'No'}</div>
                  <div>Custom Branding: {subscriptionData.limits.customBranding ? 'Yes' : 'No'}</div>
                  <div>API Access: {subscriptionData.limits.apiAccess ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Manage Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!subscriptionData.isTester && (
                <>
                  <Button
                    onClick={handleManageBilling}
                    disabled={actionLoading === 'manage'}
                    className="w-full"
                    variant="outline"
                  >
                    {actionLoading === 'manage' ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CreditCard className="h-4 w-4 mr-2" />
                    )}
                    Manage Billing
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>

                  {subscriptionData.plan === 'basic' && subscriptionData.status === 'active' && (
                    <Button
                      onClick={handleUpgrade}
                      className="w-full"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to Pro
                    </Button>
                  )}

                  {subscriptionData.status === 'active' && !subscriptionData.cancelAtPeriodEnd && (
                    <Button
                      onClick={handleCancelSubscription}
                      disabled={actionLoading === 'cancel'}
                      variant="destructive"
                      className="w-full"
                    >
                      {actionLoading === 'cancel' ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <AlertCircle className="h-4 w-4 mr-2" />
                      )}
                      Cancel Subscription
                    </Button>
                  )}

                  {subscriptionData.cancelAtPeriodEnd && (
                    <Button
                      onClick={handleReactivateSubscription}
                      disabled={actionLoading === 'reactivate'}
                      className="w-full"
                    >
                      {actionLoading === 'reactivate' ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                      )}
                      Reactivate Subscription
                    </Button>
                  )}

                  {subscriptionData.status !== 'active' && !subscriptionData.isTester && (
                    <Button
                      onClick={handleUpgrade}
                      className="w-full"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Subscribe to a Plan
                    </Button>
                  )}
                </>
              )}

              {subscriptionData.isTester && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600">
                    As a tester, you have full access to all features without a subscription.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Billing History */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>
              View your past invoices and payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Billing history will be available through the Stripe Customer Portal.
              </p>
              {!subscriptionData.isTester && (
                <Button
                  onClick={handleManageBilling}
                  variant="outline"
                  className="mt-4"
                >
                  View Billing History
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Billing;
