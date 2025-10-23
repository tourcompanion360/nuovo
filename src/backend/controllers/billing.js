/**
 * Billing Controller
 * HTTP request handlers for billing and subscription endpoints
 */

import {
  createCheckoutSession,
  createCustomerPortalSession,
  getSubscriptionPlans,
} from '../../services/stripe/checkout.js';
import {
  getSubscriptionStatus,
  cancelSubscription,
  reactivateSubscription,
  hasFeatureAccess,
  getSubscriptionLimits,
} from '../../services/stripe/subscriptions.js';
import {
  processWebhookEvent,
  constructWebhookEvent,
} from '../../services/stripe/webhooks.js';
import { supabaseAdmin } from '../config/db.js';
import { authConfig } from '../config/env.js';
import jwt from 'jsonwebtoken';

/**
 * Create Stripe Checkout Session
 * POST /api/billing/create-checkout-session
 */
export const createCheckoutSessionController = async (req, res) => {
  try {
    const { priceId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    if (!priceId) {
      return res.status(400).json({
        success: false,
        error: 'Price ID is required',
        code: 'MISSING_PRICE_ID',
      });
    }

    // Get user email
    const { data: creator, error } = await supabaseAdmin
      .from('creators')
      .select('contact_email')
      .eq('user_id', userId)
      .single();

    if (error || !creator) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    const result = await createCheckoutSession({
      userId,
      email: creator.contact_email,
      priceId,
      successUrl: `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.FRONTEND_URL}/billing/cancelled`,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
        code: 'CHECKOUT_SESSION_FAILED',
      });
    }

    res.json({
      success: true,
      data: {
        sessionId: result.sessionId,
        url: result.url,
      },
    });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * Get Subscription Status
 * GET /api/billing/subscription-status
 */
export const getSubscriptionStatusController = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    const status = await getSubscriptionStatus(userId);
    const limits = await getSubscriptionLimits(userId);

    res.json({
      success: true,
      data: {
        ...status,
        limits,
      },
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * Cancel Subscription
 * POST /api/billing/cancel-subscription
 */
export const cancelSubscriptionController = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { cancelAtPeriodEnd = true } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    const result = await cancelSubscription(userId, cancelAtPeriodEnd);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
        code: 'CANCEL_SUBSCRIPTION_FAILED',
      });
    }

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * Reactivate Subscription
 * POST /api/billing/reactivate-subscription
 */
export const reactivateSubscriptionController = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    const result = await reactivateSubscription(userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
        code: 'REACTIVATE_SUBSCRIPTION_FAILED',
      });
    }

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Reactivate subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * Create Customer Portal Session
 * POST /api/billing/customer-portal
 */
export const createCustomerPortalController = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    const result = await createCustomerPortalSession(
      userId,
      `${process.env.FRONTEND_URL}/billing`
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
        code: 'CUSTOMER_PORTAL_FAILED',
      });
    }

    res.json({
      success: true,
      data: {
        url: result.url,
      },
    });
  } catch (error) {
    console.error('Create customer portal error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * Get Subscription Plans
 * GET /api/billing/plans
 */
export const getPlansController = async (req, res) => {
  try {
    const plans = await getSubscriptionPlans();

    res.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * Check Feature Access
 * GET /api/billing/feature-access/:feature
 */
export const checkFeatureAccessController = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { feature } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    if (!['basic', 'pro'].includes(feature)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid feature type',
        code: 'INVALID_FEATURE',
      });
    }

    const hasAccess = await hasFeatureAccess(userId, feature);

    res.json({
      success: true,
      data: {
        hasAccess,
        feature,
      },
    });
  } catch (error) {
    console.error('Check feature access error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * Stripe Webhook Handler
 * POST /api/billing/webhook
 */
export const webhookController = async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const payload = req.body;

    if (!signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing Stripe signature',
        code: 'MISSING_SIGNATURE',
      });
    }

    // Construct and verify webhook event
    const event = constructWebhookEvent(payload, signature);

    // Process the webhook event
    const result = await processWebhookEvent(event);

    if (!result.success) {
      console.error('Webhook processing failed:', result.error);
      return res.status(400).json({
        success: false,
        error: result.error,
        code: 'WEBHOOK_PROCESSING_FAILED',
      });
    }

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Webhook processing failed',
      code: 'WEBHOOK_ERROR',
    });
  }
};

/**
 * Set Tester Status (Admin only)
 * POST /api/billing/set-tester
 */
export const setTesterStatusController = async (req, res) => {
  try {
    const { userId, isTester } = req.body;
    const adminUserId = req.user?.id;

    if (!adminUserId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    // Check if admin user is a tester (simple admin check)
    const { data: adminCreator } = await supabaseAdmin
      .from('creators')
      .select('is_tester')
      .eq('user_id', adminUserId)
      .single();

    if (!adminCreator?.is_tester) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
        code: 'ADMIN_REQUIRED',
      });
    }

    if (!userId || typeof isTester !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'userId and isTester are required',
        code: 'INVALID_PARAMETERS',
      });
    }

    // Update tester status
    const { error } = await supabaseAdmin
      .from('creators')
      .update({ is_tester: isTester })
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Failed to update tester status',
        code: 'UPDATE_FAILED',
      });
    }

    res.json({
      success: true,
      message: `User tester status updated to ${isTester}`,
    });
  } catch (error) {
    console.error('Set tester status error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
};


