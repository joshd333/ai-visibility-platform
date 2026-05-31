import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { generateMonthlyReport } from '@/lib/seo-engine';
import { prisma } from '@/lib/prisma';

const FREE_LIMIT = 1;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { domain } = body;

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id as string | undefined;

    // Enforce free tier limit before running the expensive analysis
    if (userId) {
      const subscription = (session?.user as any)?.subscription ?? 'free';
      if (subscription === 'free') {
        const now = new Date();
        const usedThisMonth = await prisma.report.count({
          where: {
            domain: { userId },
            month: now.getMonth() + 1,
            year: now.getFullYear(),
          },
        });
        if (usedThisMonth >= FREE_LIMIT) {
          return NextResponse.json(
            {
              error: 'You have used your 1 free analysis for this month.',
              limitReached: true,
            },
            { status: 403 }
          );
        }
      }
    }

    const cleanDomain = domain
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .trim();

    console.log(`[API] Starting analysis for: ${cleanDomain}`);

    const report = await generateMonthlyReport(cleanDomain);

    if (userId) {
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
