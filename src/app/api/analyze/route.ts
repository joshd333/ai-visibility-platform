import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { generateMonthlyReport } from '@/lib/seo-engine';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { domain } = body;

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    const cleanDomain = domain
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .trim();

    console.log(`[API] Starting analysis for: ${cleanDomain}`);

    const report = await generateMonthlyReport(cleanDomain);

    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      const userId = session.user.id as string;

      let domainRecord = await prisma.domain.findFirst({
        where: { url: cleanDomain, userId },
      });
      if (!domainRecord) {
        domainRecord = await prisma.domain.create({
          data: { url: cleanDomain, userId },
        });
      }

      const now = new Date();
      await prisma.report.create({
        data: {
          domainId: domainRecord.id,
          data: JSON.stringify(report),
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          overallScore: report.overallScore,
        },
      });
    }

    return NextResponse.json({ success: true, domain: cleanDomain, report });
  } catch (error: any) {
    console.error('[API] Analysis failed:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const maxDuration = 300;
