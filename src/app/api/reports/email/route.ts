import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { sendSEOReport } from '@/lib/email';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { domain, report } = await request.json();
  if (!domain || !report) {
    return NextResponse.json({ error: 'domain and report are required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string },
    select: { email: true },
  });

  if (!user?.email) {
    return NextResponse.json({ error: 'No email on account' }, { status: 404 });
  }

  await sendSEOReport(user.email, domain, report);

  return NextResponse.json({ sent: true, to: user.email });
}

export const dynamic = 'force-dynamic';
