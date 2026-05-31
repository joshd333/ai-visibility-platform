import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id as string;

  const domains = await prisma.domain.findMany({
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
  });

  return NextResponse.json({ domains });
}

export const dynamic = 'force-dynamic';
