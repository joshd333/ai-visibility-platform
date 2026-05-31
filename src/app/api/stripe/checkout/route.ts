import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { stripe, PLANS } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { plan } = await request.json();
  if (!plan || !(plan in PLANS)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const userId = session.user.id as string;
  const planConfig = PLANS[plan as keyof typeof PLANS];
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, stripeId: true },
  });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  let customerId = user.stripeId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: userId },
      data: { stripeId: customerId },
    });
  }

  const prices = await stripe.prices.list({
    lookup_keys: [planConfig.lookupKey],
    expand: ['data.product'],
  });

  let priceId: string;

  if (prices.data.length > 0) {
    priceId = prices.data[0].id;
  } else {
    const product = await stripe.products.create({ name: planConfig.name });
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: planConfig.price,
      currency: 'usd',
      recurring: { interval: planConfig.interval },
      lookup_key: planConfig.lookupKey,
    });
    priceId = price.id;
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/dashboard?upgraded=1`,
    cancel_url: `${baseUrl}/#pricing`,
    metadata: { userId, plan },
    subscription_data: {
      metadata: { userId, plan },
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
