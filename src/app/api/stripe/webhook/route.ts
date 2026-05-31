import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new NextResponse('Webhook configuration missing', { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;
        if (userId && plan) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              subscription: plan,
              stripeId: session.customer,
            },
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as any;
        const userId = sub.metadata?.userId;
        const plan = sub.metadata?.plan;
        if (userId && plan) {
          const subscription = sub.status === 'active' ? plan : 'free';
          await prisma.user.update({
            where: { id: userId },
            data: { subscription },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as any;
        const userId = sub.metadata?.userId;
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: { subscription: 'free' },
          });
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error('Error processing webhook event:', err);
    return new NextResponse('Webhook handler failed', { status: 500 });
  }

  return NextResponse.json({ received: true });
}

export const dynamic = 'force-dynamic';
