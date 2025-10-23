/**
 * Billing Hook
 * Provides billing and subscription management functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

interface SubscriptionStatus {
  isActive: boolean;
  isTester: boolean;
  plan: 'basic' | 'pro' | null;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'unpaid' | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId: string | null;
  limits: {
    maxProjects: number;
    maxClients: number;
    maxChatbots: number;
    analyticsAccess: boolean;
    customBranding: boolean;
    apiAccess: boolean;
  };
}

interface BillingHookReturn {
  subscriptionStatus: SubscriptionStatus | null;
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  cancelSubscription: (cancelAtPeriodEnd?: boolean) => Promise<boolean>;
  reactivateSubscription: () => Promise<boolean>;
  openCustomerPortal: () => Promise<void>;
  hasFeatureAccess: (feature: 'basic' | 'pro') => boolean;
  canCreateProject: (currentCount: number) => boolean;
  canAddClient: (currentCount: number) => boolean;
  canCreateChatbot: (currentCount: number) => boolean;
}

export const useBilling = (): BillingHookReturn => {
  const { toast } = useToast();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/billing/subscription-status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('jwt_token');
        throw new Error('Authentication token expired');
      }

      const data = await response.json();

      if (data.success) {
        setSubscriptionStatus(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch subscription status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching subscription status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSubscription = useCallback(async () => {
    await fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  const cancelSubscription = useCallback(async (cancelAtPeriodEnd: boolean = true): Promise<boolean> => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/billing/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ cancelAtPeriodEnd }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Subscription Updated',
          description: data.message,
        });
        
        // Refresh subscription status
        await refreshSubscription();
        return true;
      } else {
        throw new Error(data.error || 'Failed to cancel subscription');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  }, [toast, refreshSubscription]);

  const reactivateSubscription = useCallback(async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

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
          description: data.message,
        });
        
        // Refresh subscription status
        await refreshSubscription();
        return true;
      } else {
        throw new Error(data.error || 'Failed to reactivate subscription');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  }, [toast, refreshSubscription]);

  const openCustomerPortal = useCallback(async (): Promise<void> => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

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
        throw new Error(data.error || 'Failed to open customer portal');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [toast]);

  const hasFeatureAccess = useCallback((feature: 'basic' | 'pro'): boolean => {
    if (!subscriptionStatus) return false;
    
    // Testers have access to all features
    if (subscriptionStatus.isTester) return true;
    
    // Check if subscription is active
    if (!subscriptionStatus.isActive) return false;
    
    // Check feature access based on plan
    if (feature === 'basic') return true; // any active plan

    if (feature === 'pro') return subscriptionStatus.plan === 'pro' || subscriptionStatus.plan === 'pro_plus';
    
    return false;
  }, [subscriptionStatus]);

  const canCreateProject = useCallback((currentCount: number): boolean => {
    if (!subscriptionStatus) return false;
    
    // Testers have unlimited access
    if (subscriptionStatus.isTester) return true;
    
    // Check if subscription is active
    if (!subscriptionStatus.isActive) return false;
    
    // Check limits
    const maxProjects = subscriptionStatus.limits.maxProjects;
    return maxProjects === -1 || currentCount < maxProjects;
  }, [subscriptionStatus]);

  const canAddClient = useCallback((currentCount: number): boolean => {
    if (!subscriptionStatus) return false;
    
    // Testers have unlimited access
    if (subscriptionStatus.isTester) return true;
    
    // Check if subscription is active
    if (!subscriptionStatus.isActive) return false;
    
    // Check limits
    const maxClients = subscriptionStatus.limits.maxClients;
    return maxClients === -1 || currentCount < maxClients;
  }, [subscriptionStatus]);

  const canCreateChatbot = useCallback((currentCount: number): boolean => {
    if (!subscriptionStatus) return false;
    
    // Testers have unlimited access
    if (subscriptionStatus.isTester) return true;
    
    // Check if subscription is active
    if (!subscriptionStatus.isActive) return false;
    
    // Check limits
    const maxChatbots = subscriptionStatus.limits.maxChatbots;
    return maxChatbots === -1 || currentCount < maxChatbots;
  }, [subscriptionStatus]);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  return {
    subscriptionStatus,
    loading,
    error,
    refreshSubscription,
    cancelSubscription,
    reactivateSubscription,
    openCustomerPortal,
    hasFeatureAccess,
    canCreateProject,
    canAddClient,
    canCreateChatbot,
  };
};


