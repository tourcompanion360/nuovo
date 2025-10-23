/**
 * Billing Routes
 * API routes for billing and subscription management
 */

import express from 'express';
import {
  createCheckoutSessionController,
  getSubscriptionStatusController,
  cancelSubscriptionController,
  reactivateSubscriptionController,
  createCustomerPortalController,
  getPlansController,
  checkFeatureAccessController,
  webhookController,
  setTesterStatusController,
} from '../controllers/billing.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Webhook endpoint (no auth required, uses Stripe signature verification)
router.post('/webhook', webhookController);

// Public endpoints
router.get('/plans', getPlansController);

// Protected endpoints (require authentication)
router.use(authenticateToken);

// Creator-only guard for billing actions
const requireCreator = (req, res, next) => {
  if (!req.user?.creatorId) {
    return res.status(403).json({
      success: false,
      error: 'Creator account required',
      code: 'CREATOR_REQUIRED',
    });
  }
  next();
};

// Subscription management (creator only)
router.post('/create-checkout-session', requireCreator, createCheckoutSessionController);
router.get('/subscription-status', requireCreator, getSubscriptionStatusController);
router.post('/cancel-subscription', requireCreator, cancelSubscriptionController);
router.post('/reactivate-subscription', requireCreator, reactivateSubscriptionController);
router.post('/customer-portal', requireCreator, createCustomerPortalController);

// Feature access
router.get('/feature-access/:feature', checkFeatureAccessController);

// Admin endpoints
router.post('/set-tester', setTesterStatusController);

export default router;


