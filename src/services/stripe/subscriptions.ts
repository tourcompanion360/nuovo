/**
 * Stripe Subscriptions Service
 * Handles subscription management and status checking
 */

import { stripe, StripeError, handleStripeError } from './index';
import { supabaseAdmin } from '../../backend/config/db.js';

export interface SubscriptionStatus {
  isActive: boolean;
  isTester: boolean;
  plan: 'basic' | 'pro' | null;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'unpaid' | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId: string | null;
}

export interface CancelSubscriptionResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Get subscription status for a user
 */
export const getSubscriptionStatus = async (
  userId: string
): Promise<SubscriptionStatus> => {
  try {
    // Get creator record
    const { data: creator, error } = await supabaseAdmin
      .from('creators')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !creator) {
      return {
        isActive: false,
        isTester: false,
        plan: null,
        status: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        stripeSubscriptionId: null,
      };
    }

    // If user is a tester, they have full access
    if (creator.is_tester) {
      return {
        isActive: true,
        isTester: true,
        plan: 'pro', // Testers get Pro access
        status: 'active',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        stripeSubscriptionId: null,
      };
    }

    // Check if user has an active subscription
    if (!creator.stripe_subscription_id) {
      return {
        isActive: false,
        isTester: false,
        plan: null,
        status: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        stripeSubscriptionId: null,
      };
    }

    // Get subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(
      creator.stripe_subscription_id
    );

    const isActive = subscription.status === 'active';
    const plan = getPlanFromPriceId(subscription.items.data[0]?.price.id);
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

    return {
      isActive,
      isTester: false,
      plan,
      status: subscription.status as any,
      currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      stripeSubscriptionId: subscription.id,
    };
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return {
      isActive: false,
      isTester: false,
      plan: null,
      status: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      stripeSubscriptionId: null,
    };
  }
};

/**
 * Cancel a user's subscription
 */
export const cancelSubscription = async (
  userId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<CancelSubscriptionResult> => {
  try {
    // Get creator record
    const { data: creator, error } = await supabaseAdmin
      .from('creators')
      .select('stripe_subscription_id')
      .eq('user_id', userId)
      .single();

    if (error || !creator?.stripe_subscription_id) {
      return {
        success: false,
        error: 'No active subscription found',
      };
    }

    // Cancel subscription in Stripe
    const subscription = await stripe.subscriptions.update(
      creator.stripe_subscription_id,
      {
        cancel_at_period_end: cancelAtPeriodEnd,
      }
    );

    // Update database
    await supabaseAdmin
      .from('creators')
      .update({
        subscription_status: cancelAtPeriodEnd ? 'active' : 'cancelled',
      })
      .eq('user_id', userId);

    // Log the event
    await supabaseAdmin.rpc('log_subscription_event', {
      p_creator_id: creator.id,
      p_event_type: 'subscription_cancelled',
      p_stripe_subscription_id: subscription.id,
      p_metadata: {
        cancel_at_period_end: cancelAtPeriodEnd,
        cancelled_at: new Date().toISOString(),
      },
    });

    return {
      success: true,
      message: cancelAtPeriodEnd
        ? 'Subscription will be cancelled at the end of the current period'
        : 'Subscription has been cancelled immediately',
    };
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    const stripeError = handleStripeError(error);
    return {
      success: false,
      error: stripeError.message,
    };
  }
};

/**
 * Reactivate a cancelled subscription
 */
export const reactivateSubscription = async (
  userId: string
): Promise<CancelSubscriptionResult> => {
  try {
    // Get creator record
    const { data: creator, error } = await supabaseAdmin
      .from('creators')
      .select('stripe_subscription_id')
      .eq('user_id', userId)
      .single();

    if (error || !creator?.stripe_subscription_id) {
      return {
        success: false,
        error: 'No subscription found',
      };
    }

    // Reactivate subscription in Stripe
    const subscription = await stripe.subscriptions.update(
      creator.stripe_subscription_id,
      {
        cancel_at_period_end: false,
      }
    );

    // Update database
    await supabaseAdmin
      .from('creators')
      .update({
        subscription_status: 'active',
      })
      .eq('user_id', userId);

    // Log the event
    await supabaseAdmin.rpc('log_subscription_event', {
      p_creator_id: creator.id,
      p_event_type: 'subscription_updated',
      p_stripe_subscription_id: subscription.id,
      p_metadata: {
        reactivated_at: new Date().toISOString(),
      },
    });

    return {
      success: true,
      message: 'Subscription has been reactivated',
    };
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    const stripeError = handleStripeError(error);
    return {
      success: false,
      error: stripeError.message,
    };
  }
};

/**
 * Update subscription status in database
 */
export const updateSubscriptionInDatabase = async (
  subscriptionId: string,
  status: string,
  currentPeriodEnd?: number
): Promise<void> => {
  try {
    const updateData: any = {
      subscription_status: status,
    };

    if (currentPeriodEnd) {
      updateData.subscription_period_end = new Date(currentPeriodEnd * 1000);
    }

    await supabaseAdmin
      .from('creators')
      .update(updateData)
      .eq('stripe_subscription_id', subscriptionId);
  } catch (error) {
    console.error('Error updating subscription in database:', error);
    throw error;
  }
};

/**
 * Get plan type from Stripe price ID
 */
const getPlanFromPriceId = (priceId: string | undefined): 'basic' | 'pro' | null => {
  if (!priceId) return null;
  
  // You'll need to replace these with your actual price IDs
  if (priceId.includes('basic') || priceId === process.env.STRIPE_PRICE_ID_BASIC) {
    return 'basic';
  }
  if (priceId.includes('pro') || priceId === process.env.STRIPE_PRICE_ID_PRO) {
    return 'pro';
  }
  
  return null;
};

/**
 * Check if user has access to a feature
 */
export const hasFeatureAccess = async (
  userId: string,
  feature: 'basic' | 'pro'
): Promise<boolean> => {
  const status = await getSubscriptionStatus(userId);
  
  if (status.isTester) {
    return true; // Testers have access to all features
  }
  
  if (!status.isActive) {
    return false;
  }
  
  if (feature === 'basic') {
    return status.plan === 'basic' || status.plan === 'pro';
  }
  
  if (feature === 'pro') {
    return status.plan === 'pro';
  }
  
  return false;
};

/**
 * Get subscription usage limits
 */
export const getSubscriptionLimits = async (userId: string) => {
  const status = await getSubscriptionStatus(userId);
  
  if (status.isTester) {
    // Testers get unlimited access
    return {
      maxProjects: -1, // Unlimited
      maxClients: -1, // Unlimited
      maxChatbots: -1, // Unlimited
      analyticsAccess: true,
      customBranding: true,
      apiAccess: true,
    };
  }
  
  if (status.plan === 'pro') {
    return {
      maxProjects: -1, // Unlimited
      maxClients: -1, // Unlimited
      maxChatbots: 5,
      analyticsAccess: true,
      customBranding: true,
      apiAccess: true,
    };
  }
  
  if (status.plan === 'basic') {
    return {
      maxProjects: 1,
      maxClients: 1,
      maxChatbots: 0,
      analyticsAccess: false,
      customBranding: false,
      apiAccess: false,
    };
  }
  
  // No subscription
  return {
    maxProjects: 0,
    maxClients: 0,
    maxChatbots: 0,
    analyticsAccess: false,
    customBranding: false,
    apiAccess: false,
  };
};


