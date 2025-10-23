/**
 * Stripe Service - Main entry point for Stripe operations
 * Centralized service for all Stripe-related functionality
 */

import Stripe from 'stripe';
import { externalServices } from '../../backend/config/env.js';

// Initialize Stripe with secret key
const stripe = new Stripe(externalServices.stripe.secretKey, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

export { stripe };

// Export Stripe types for use in other modules
export type StripeCustomer = Stripe.Customer;

// Centralized price IDs per plan tier
export const STRIPE_PRICE_IDS = {
  BASIC: externalServices.stripe.priceIdBasic,
  PRO: externalServices.stripe.priceIdPro,
} as const;

export const STRIPE_WEBHOOK_SECRET = externalServices.stripe.webhookSecret;

export const constructEvent = (payload: Buffer | string, signature: string, secret = STRIPE_WEBHOOK_SECRET) => {
  return stripe.webhooks.constructEvent(payload, signature, secret);
};
export type StripeSubscription = Stripe.Subscription;
export type StripePrice = Stripe.Price;
export type StripeProduct = Stripe.Product;
export type StripeCheckoutSession = Stripe.Checkout.Session;
export type StripeWebhookEvent = Stripe.Event;

// Export price IDs from environment
export const STRIPE_PRICE_IDS = {
  BASIC: externalServices.stripe.priceIdBasic,
  PRO: externalServices.stripe.priceIdPro,
} as const;

// Export webhook secret
export const STRIPE_WEBHOOK_SECRET = externalServices.stripe.webhookSecret;

// Common Stripe error types
export class StripeError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'StripeError';
  }
}

// Utility function to handle Stripe errors
export const handleStripeError = (error: unknown): StripeError => {
  if (error instanceof Stripe.errors.StripeError) {
    return new StripeError(
      error.message,
      error.code,
      error.statusCode
    );
  }
  
  if (error instanceof Error) {
    return new StripeError(error.message);
  }
  
  return new StripeError('Unknown Stripe error occurred');
};

// Utility function to validate Stripe webhook signature
export const validateWebhookSignature = (
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event => {
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    throw new StripeError(
      `Webhook signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'WEBHOOK_SIGNATURE_VERIFICATION_FAILED',
      400
    );
  }
};

// Export all service modules
export * from './checkout';
export * from './subscriptions';
export * from './webhooks';


