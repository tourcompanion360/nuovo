/**
 * Stripe Webhooks Service
 * Handles Stripe webhook events for subscription lifecycle management
 */

import { stripe, STRIPE_WEBHOOK_SECRET, StripeError, handleStripeError } from './index';
import { supabaseAdmin } from '../../backend/config/db.js';
import { updateSubscriptionInDatabase } from './subscriptions';

export interface WebhookEventResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Process Stripe webhook events
 */
export const processWebhookEvent = async (
  event: import('stripe').Event
): Promise<WebhookEventResult> => {
  try {
    console.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        return await handleCheckoutSessionCompleted(event);
      
      case 'customer.subscription.created':
        return await handleSubscriptionCreated(event);
      
      case 'customer.subscription.updated':
        return await handleSubscriptionUpdated(event);
      
      case 'customer.subscription.deleted':
        return await handleSubscriptionDeleted(event);
      
      case 'invoice.payment_succeeded':
        return await handlePaymentSucceeded(event);
      
      case 'invoice.payment_failed':
        return await handlePaymentFailed(event);
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
        return {
          success: true,
          message: `Event ${event.type} not handled`,
        };
    }
  } catch (error) {
    console.error('Error processing webhook event:', error);
    const stripeError = handleStripeError(error);
    return {
      success: false,
      error: stripeError.message,
    };
  }
};

/**
 * Handle checkout session completed
 */
const handleCheckoutSessionCompleted = async (
  event: import('stripe').Event
): Promise<WebhookEventResult> => {
  const session = event.data.object as import('stripe').Checkout.Session;
  
  if (session.mode !== 'subscription') {
    return {
      success: true,
      message: 'Non-subscription checkout session, ignoring',
    };
  }

  const userId = session.metadata?.userId;
  if (!userId) {
    throw new StripeError('No userId in checkout session metadata', 'MISSING_USER_ID', 400);
  }

  // Get creator record
  const { data: creator, error } = await supabaseAdmin
    .from('creators')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (error || !creator) {
    throw new StripeError('Creator not found', 'CREATOR_NOT_FOUND', 404);
  }

  // Log the event
  await supabaseAdmin.rpc('log_subscription_event', {
    p_creator_id: creator.id,
    p_event_type: 'subscription_created',
    p_stripe_event_id: event.id,
    p_stripe_subscription_id: session.subscription as string,
    p_metadata: {
      session_id: session.id,
      customer_id: session.customer,
      amount_total: session.amount_total,
      currency: session.currency,
    },
  });

  return {
    success: true,
    message: 'Checkout session completed successfully',
  };
};

/**
 * Handle subscription created
 */
const handleSubscriptionCreated = async (
  event: import('stripe').Event
): Promise<WebhookEventResult> => {
  const subscription = event.data.object as import('stripe').Subscription;
  
  // Find creator by customer ID
  const { data: creator, error } = await supabaseAdmin
    .from('creators')
    .select('id, user_id')
    .eq('stripe_customer_id', subscription.customer as string)
    .single();

  if (error || !creator) {
    throw new StripeError('Creator not found for subscription', 'CREATOR_NOT_FOUND', 404);
  }

  // Update creator with subscription info
  await supabaseAdmin
    .from('creators')
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_period_end: new Date(subscription.current_period_end * 1000),
    })
    .eq('user_id', creator.user_id);

  // Log the event
  await supabaseAdmin.rpc('log_subscription_event', {
    p_creator_id: creator.id,
    p_event_type: 'subscription_created',
    p_stripe_event_id: event.id,
    p_stripe_subscription_id: subscription.id,
    p_metadata: {
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    },
  });

  return {
    success: true,
    message: 'Subscription created successfully',
  };
};

/**
 * Handle subscription updated
 */
const handleSubscriptionUpdated = async (
  event: import('stripe').Event
): Promise<WebhookEventResult> => {
  const subscription = event.data.object as import('stripe').Subscription;
  
  // Update subscription in database
  await updateSubscriptionInDatabase(
    subscription.id,
    subscription.status,
    subscription.current_period_end
  );

  // Find creator for logging
  const { data: creator, error } = await supabaseAdmin
    .from('creators')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (!error && creator) {
    // Log the event
    await supabaseAdmin.rpc('log_subscription_event', {
      p_creator_id: creator.id,
      p_event_type: 'subscription_updated',
      p_stripe_event_id: event.id,
      p_stripe_subscription_id: subscription.id,
      p_metadata: {
        status: subscription.status,
        cancel_at_period_end: subscription.cancel_at_period_end,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      },
    });
  }

  return {
    success: true,
    message: 'Subscription updated successfully',
  };
};

/**
 * Handle subscription deleted
 */
const handleSubscriptionDeleted = async (
  event: import('stripe').Event
): Promise<WebhookEventResult> => {
  const subscription = event.data.object as import('stripe').Subscription;
  
  // Update subscription in database
  await updateSubscriptionInDatabase(subscription.id, 'cancelled');

  // Find creator for logging
  const { data: creator, error } = await supabaseAdmin
    .from('creators')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (!error && creator) {
    // Log the event
    await supabaseAdmin.rpc('log_subscription_event', {
      p_creator_id: creator.id,
      p_event_type: 'subscription_cancelled',
      p_stripe_event_id: event.id,
      p_stripe_subscription_id: subscription.id,
      p_metadata: {
        cancelled_at: new Date().toISOString(),
        cancel_reason: subscription.cancellation_details?.reason || 'unknown',
      },
    });
  }

  return {
    success: true,
    message: 'Subscription cancelled successfully',
  };
};

/**
 * Handle payment succeeded
 */
const handlePaymentSucceeded = async (
  event: import('stripe').Event
): Promise<WebhookEventResult> => {
  const invoice = event.data.object as import('stripe').Invoice;
  
  if (!invoice.subscription) {
    return {
      success: true,
      message: 'Non-subscription invoice, ignoring',
    };
  }

  // Find creator for logging
  const { data: creator, error } = await supabaseAdmin
    .from('creators')
    .select('id')
    .eq('stripe_subscription_id', invoice.subscription as string)
    .single();

  if (!error && creator) {
    // Log the event
    await supabaseAdmin.rpc('log_subscription_event', {
      p_creator_id: creator.id,
      p_event_type: 'payment_succeeded',
      p_stripe_event_id: event.id,
      p_stripe_subscription_id: invoice.subscription as string,
      p_metadata: {
        invoice_id: invoice.id,
        amount_paid: invoice.amount_paid,
        currency: invoice.currency,
        period_start: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString() : null,
        period_end: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null,
      },
    });
  }

  return {
    success: true,
    message: 'Payment succeeded',
  };
};

/**
 * Handle payment failed
 */
const handlePaymentFailed = async (
  event: import('stripe').Event
): Promise<WebhookEventResult> => {
  const invoice = event.data.object as import('stripe').Invoice;
  
  if (!invoice.subscription) {
    return {
      success: true,
      message: 'Non-subscription invoice, ignoring',
    };
  }

  // Update subscription status to past_due
  await updateSubscriptionInDatabase(invoice.subscription as string, 'past_due');

  // Find creator for logging
  const { data: creator, error } = await supabaseAdmin
    .from('creators')
    .select('id')
    .eq('stripe_subscription_id', invoice.subscription as string)
    .single();

  if (!error && creator) {
    // Log the event
    await supabaseAdmin.rpc('log_subscription_event', {
      p_creator_id: creator.id,
      p_event_type: 'payment_failed',
      p_stripe_event_id: event.id,
      p_stripe_subscription_id: invoice.subscription as string,
      p_metadata: {
        invoice_id: invoice.id,
        amount_due: invoice.amount_due,
        currency: invoice.currency,
        attempt_count: invoice.attempt_count,
        next_payment_attempt: invoice.next_payment_attempt ? new Date(invoice.next_payment_attempt * 1000).toISOString() : null,
      },
    });
  }

  return {
    success: true,
    message: 'Payment failed - subscription status updated',
  };
};

/**
 * Validate webhook signature and construct event
 */
export const constructWebhookEvent = (
  payload: string | Buffer,
  signature: string
): import('stripe').Event => {
  try {
    return stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    throw new StripeError(
      `Webhook signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'WEBHOOK_SIGNATURE_VERIFICATION_FAILED',
      400
    );
  }
};


