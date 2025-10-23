import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Creator } from '@/integrations/supabase/types';

interface SubscriptionFeatures {
  maxChatbots: number;
  maxProjects: number;
  maxClients: number;
  analyticsAccess: boolean;
  customBranding: boolean;
  apiAccess: boolean;
  storage: number; // in GB
  apiCalls: number; // per month
}

interface SubscriptionData {
  plan: 'basic' | 'pro';
  status: 'active' | 'inactive' | 'cancelled';
  features: SubscriptionFeatures;
  limits: SubscriptionFeatures;
  isLoading: boolean;
  error: string | null;
}

const PLAN_FEATURES = {
  basic: {
    maxChatbots: 0,
    maxProjects: 1,
    maxClients: 1,
    analyticsAccess: false,
    customBranding: false,
    apiAccess: false,
    storage: 1, // GB
    apiCalls: 1000,
  },
  pro: {
    maxChatbots: 5,
    maxProjects: 50,
    maxClients: -1, // unlimited
    analyticsAccess: true,
    customBranding: true,
    apiAccess: true,
    storage: 10, // GB
    apiCalls: 10000,
  },
} as const;

export const useSubscription = (userId: string | null) => {
  const [subscription, setSubscription] = useState<SubscriptionData>({
    plan: 'basic',
    status: 'active',
    features: PLAN_FEATURES.basic,
    limits: PLAN_FEATURES.basic,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!userId) {
      setSubscription(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchSubscription = async () => {
      try {
        setSubscription(prev => ({ ...prev, isLoading: true, error: null }));

        const { data: creator, error } = await supabase
          .from('creators')
          .select('subscription_plan, subscription_status')
          .eq('user_id', userId)
          .single();

        if (error) {
          // If creator doesn't exist, default to basic plan
          if (error.code === 'PGRST116') {
            setSubscription({
              plan: 'basic',
              status: 'active',
              features: PLAN_FEATURES.basic,
              limits: PLAN_FEATURES.basic,
              isLoading: false,
              error: null,
            });
            return;
          }
          throw error;
        }

        const planType = (creator?.subscription_plan || 'basic') as 'basic' | 'pro';
        const status = creator?.subscription_status || 'active';

        setSubscription({
          plan: planType,
          status: status as 'active' | 'inactive' | 'cancelled',
          features: PLAN_FEATURES[planType as keyof typeof PLAN_FEATURES],
          limits: PLAN_FEATURES[planType as keyof typeof PLAN_FEATURES],
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching subscription:', error);
        setSubscription(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'An unknown error occurred',
        }));
      }
    };

    fetchSubscription();
  }, [userId]);

  // Helper functions
  const canCreateChatbot = (currentCount: number) => {
    return currentCount < subscription.features.maxChatbots;
  };

  const canCreateProject = (currentCount: number) => {
    return currentCount < subscription.features.maxProjects;
  };

  const canAddClient = (currentCount: number) => {
    return currentCount < subscription.features.maxClients;
  };

  const hasAnalyticsAccess = () => {
    return subscription.features.analyticsAccess;
  };

  const hasCustomBranding = () => {
    return subscription.features.customBranding;
  };

  const hasApiAccess = () => {
    return subscription.features.apiAccess;
  };

  const getUsageStats = async () => {
    if (!userId) return null;

    try {
      const { data: stats, error } = await supabase.rpc('get_creator_stats', {
        creator_user_id: userId,
      });

      if (error) {
        console.error('Error fetching usage stats:', error);
        return null;
      }

      return stats;
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      return null;
    }
  };

  const upgradePlan = async () => {
    // This would typically integrate with Stripe or another payment processor
    // For now, we'll just show a placeholder
    console.log('Upgrade plan functionality would be implemented here');
    return { success: false, message: 'Upgrade functionality not implemented yet' };
  };

  const downgradePlan = async () => {
    // This would typically integrate with Stripe or another payment processor
    // For now, we'll just show a placeholder
    console.log('Downgrade plan functionality would be implemented here');
    return { success: false, message: 'Downgrade functionality not implemented yet' };
  };

  return {
    ...subscription,
    canCreateChatbot,
    canCreateProject,
    canAddClient,
    hasAnalyticsAccess,
    hasCustomBranding,
    hasApiAccess,
    getUsageStats,
    upgradePlan,
    downgradePlan,
  };
};







