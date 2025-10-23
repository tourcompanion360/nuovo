/**
 * Stripe Checkout Service
 * Handles Stripe Checkout session creation and management
 */

import { stripe, STRIPE_PRICE_IDS, StripeError, handleStripeError } from './index';
import { supabaseAdmin } from '../../backend/config/db.js';

export interface CreateCheckoutSessionParams {
  userId: string;
  email: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResult {
  success: boolean;
  sessionId?: string;
  url?: string;
  error?: string;
}

/**
 * Create a Stripe Checkout session for subscription
 */
export const createCheckoutSession = async (
  params: CreateCheckoutSessionParams
): Promise<CheckoutSessionResult> => {
  try {
    const { userId, email, priceId, successUrl, cancelUrl } = params;

    // Validate price ID
    if (!Object.values(STRIPE_PRICE_IDS).includes(priceId)) {
      throw new StripeError('Invalid price ID', 'INVALID_PRICE_ID', 400);
    }

    // Get or create Stripe customer
    const customer = await getOrCreateCustomer(userId, email);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        priceId,
      },
      subscription_data: {
        metadata: {
          userId,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    return {
      success: true,
      sessionId: session.id,
      url: session.url || undefined,
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    const stripeError = handleStripeError(error);
    return {
      success: false,
      error: stripeError.message,
    };
  }
};

/**
 * Get or create a Stripe customer for the user
 */
export const getOrCreateCustomer = async (
  userId: string,
  email: string
): Promise<import('stripe').Customer> => {
  try {
    // First, check if customer already exists in our database
    const { data: creator } = await supabaseAdmin
      .from('creators')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (creator?.stripe_customer_id) {
      // Customer exists, retrieve from Stripe
      const customer = await stripe.customers.retrieve(creator.stripe_customer_id);
      if (customer.deleted) {
        throw new StripeError('Customer was deleted', 'CUSTOMER_DELETED', 404);
      }
      return customer as import('stripe').Customer;
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      metadata: {
        userId,
      },
    });

    // Update creator record with customer ID
    await supabaseAdmin
      .from('creators')
      .update({ stripe_customer_id: customer.id })
      .eq('user_id', userId);

    return customer;
  } catch (error) {
    console.error('Error getting/creating customer:', error);
    throw handleStripeError(error);
  }
};

/**
 * Create a customer portal session for subscription management
 */
export const createCustomerPortalSession = async (
  userId: string,
  returnUrl: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    // Get customer ID from database
    const { data: creator } = await supabaseAdmin
      .from('creators')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (!creator?.stripe_customer_id) {
      throw new StripeError('No Stripe customer found', 'CUSTOMER_NOT_FOUND', 404);
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: creator.stripe_customer_id,
      return_url: returnUrl,
    });

    return {
      success: true,
      url: session.url,
    };
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    const stripeError = handleStripeError(error);
    return {
      success: false,
      error: stripeError.message,
    };
  }
};

/**
 * Retrieve a checkout session by ID
 */
export const getCheckoutSession = async (
  sessionId: string
): Promise<import('stripe').Checkout.Session | null> => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    return null;
  }
};

/**
 * Get available subscription plans
 */
export const getSubscriptionPlans = async () => {
  try {
    const [basicPrice, proPrice] = await Promise.all([
      stripe.prices.retrieve(STRIPE_PRICE_IDS.BASIC, {
        expand: ['product'],
      }),
      stripe.prices.retrieve(STRIPE_PRICE_IDS.PRO, {
        expand: ['product'],
      }),
    ]);

    return {
      basic: {
        id: basicPrice.id,
        amount: basicPrice.unit_amount,
        currency: basicPrice.currency,
        interval: basicPrice.recurring?.interval,
        product: basicPrice.product,
      },
      pro: {
        id: proPrice.id,
        amount: proPrice.unit_amount,
        currency: proPrice.currency,
        interval: proPrice.recurring?.interval,
        product: proPrice.product,
      },
    };
  } catch (error) {
    console.error('Error retrieving subscription plans:', error);
    throw handleStripeError(error);
  }
};


