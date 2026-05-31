import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

export const PLANS = {
  pro: {
    name: 'Pro',
    price: 4900,
    interval: 'month' as const,
    lookupKey: 'pro_monthly',
  },
  agency: {
    name: 'Agency',
    price: 19900,
    interval: 'month' as const,
    lookupKey: 'agency_monthly',
  },
} as const;
