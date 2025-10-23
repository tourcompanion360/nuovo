/**
 * Pricing Page
 * Displays subscription plans and handles Stripe Checkout
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { env } from '../config/env';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Check, Star, Zap, Crown } from 'lucide-react';
// Dev-mode bypass removed for production safety

// Initialize Stripe
const stripePromise = loadStripe(env.VITE_STRIPE_PUBLISHABLE_KEY);

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
}

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);

  // Default plans (will be replaced by API call)
  const defaultPlans: Plan[] = [
    {
      id: 'basic',
      name: 'Basic',
      description: 'Perfect for small agencies and freelancers',
      price: 50,
      currency: 'usd',
      interval: 'month',
      features: [
        '5 Virtual Tours',
        '10 End Clients',
        '10 Chatbots',
        'Basic Analytics',
        'Email Support',
        'Standard Templates',
      ],
      icon: <Zap className="h-6 w-6" />,
      color: 'bg-blue-500',
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For growing agencies and businesses',
      price: 99,
      currency: 'usd',
      interval: 'month',
      features: [
        'Unlimited Virtual Tours',
        'Unlimited End Clients',
        'Unlimited Chatbots',
        'Advanced Analytics',
        'Priority Support',
        'Custom Branding',
        'API Access',
        'White-label Options',
      ],
      popular: true,
      icon: <Crown className="h-6 w-6" />,
      color: 'bg-purple-500',
    },
  ];

  useEffect(() => {
    // Load plans from API
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await fetch('/api/billing/plans');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Transform API data to our format
          const transformedPlans: Plan[] = [
            {
              id: 'basic',
              name: 'Basic',
              description: 'Perfect for small agencies and freelancers',
              price: data.data.basic.amount / 100,
              currency: data.data.basic.currency.toUpperCase(),
              interval: data.data.basic.interval,
              features: [
                '5 Virtual Tours',
                '10 End Clients',
                '10 Chatbots',
                'Basic Analytics',
                'Email Support',
                'Standard Templates',
              ],
              icon: <Zap className="h-6 w-6" />,
              color: 'bg-blue-500',
            },
            {
              id: 'pro',
              name: 'Pro',
              description: 'For growing agencies and businesses',
              price: data.data.pro.amount / 100,
              currency: data.data.pro.currency.toUpperCase(),
              interval: data.data.pro.interval,
              features: [
                'Unlimited Virtual Tours',
                'Unlimited End Clients',
                'Unlimited Chatbots',
                'Advanced Analytics',
                'Priority Support',
                'Custom Branding',
                'API Access',
                'White-label Options',
              ],
              popular: true,
              icon: <Crown className="h-6 w-6" />,
              color: 'bg-purple-500',
            },
          ];
          setPlans(transformedPlans);
        }
      }
    } catch (error) {
      console.error('Error loading plans:', error);
      // Use default plans if API fails
      setPlans(defaultPlans);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    setLoading(planId);
    
    try {
      // No dev-mode bypass: always require checkout

      // Get JWT token from localStorage
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to continue with your subscription.',
          variant: 'destructive',
        });
        navigate('/auth');
        return;
      }

      // Create checkout session
      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          priceId: planId === 'basic' ? 'price_basic_monthly' : 'price_pro_monthly', // You'll need to replace with actual price IDs
        }),
      });

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.data.sessionId,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start checkout process',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start creating amazing virtual tours and chatbots for your clients. 
            All plans include our core features with no setup fees.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-purple-500 text-white px-4 py-1 text-sm font-medium">
                  <Star className="h-4 w-4 inline mr-1" />
                  Most Popular
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${plan.color} text-white mb-4`}>
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-gray-600">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-gray-600">/{plan.interval}</span>
                </div>
              </CardHeader>

              <CardContent className="px-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="px-6 pb-6">
                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full py-3 text-lg font-medium ${
                    plan.popular 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading === plan.id ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    `Get ${plan.name} Plan`
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            All Plans Include
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Setup Fees</h3>
              <p className="text-gray-600">Start immediately with no hidden costs</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Easy Setup</h3>
              <p className="text-gray-600">Get started in minutes, not hours</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">We're here to help you succeed</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto text-left space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Can I change my plan later?</h3>
              <p className="text-gray-600">Yes! You can upgrade or downgrade your plan at any time from your billing dashboard.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">What happens if I cancel?</h3>
              <p className="text-gray-600">You'll continue to have access to your plan until the end of your current billing period.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-gray-600">We offer a 14-day free trial for all new users. No credit card required to start.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
