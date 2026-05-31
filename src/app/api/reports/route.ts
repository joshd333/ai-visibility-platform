import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

const LIMITS: Record<string, number> = {
  free: 1,
  pro: Infinity,
  agency: Infinity,
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id as string;
  const subscription = ((session.user as any).subscription ?? 'free') as string;
  const now = new Date();

  const [domains, usedThisMonth] = await Promise.all([
    prisma.domain.findMany({
      where: { userId },
      include: {
        reports: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            overallScore: true,
            month: true,
            year: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.report.count({
      where: {
        domain: { userId },
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    }),
  ]);

  const limit = LIMITS[subscription] ?? 1;

  return NextResponse.json({
    domains,
    usage: {
      used: usedThisMonth,
      limit: limit === Infinity ? null : limit,
      subscription,
    },
  });
}

export const dynamic = 'force-dynamic';
