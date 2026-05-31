import { NextResponse } from 'next/server';
import { generateMonthlyReport } from '@/lib/seo-engine';
import { prisma } from '@/lib/prisma';
import { sendSEOReport } from '@/lib/email';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    console.log('Starting monthly autonomous SEO update...');

    const domains = await prisma.domain.findMany({
      include: { user: { select: { id: true, email: true, subscription: true } } },
    });

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const results = await Promise.all(
      domains.map(async (domain) => {
        try {
          const reportData = await generateMonthlyReport(domain.url);

          await prisma.report.create({
            data: {
              domainId: domain.id,
              data: JSON.stringify(reportData),
              month: currentMonth,
              year: currentYear,
              overallScore: reportData.overallScore,
            },
          });

          if (domain.user?.email) {
            await sendSEOReport(domain.user.email, domain.url, reportData).catch((err) =>
              console.error(`[${domain.url}] Email failed:`, err.message)
            );
          }

          console.log(`[${domain.url}] Report saved + email sent. Score: ${reportData.overallScore}`);
          return { domain: domain.url, status: 'success', score: reportData.overallScore };
        } catch (err: any) {
          console.error(`[${domain.url}] Failed:`, err.message);
          return { domain: domain.url, status: 'error', error: err.message };
        }
      })
    );

    return NextResponse.json({
      message: 'Monthly SEO updates completed',
      processed: domains.length,
      results,
    });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json({ error: 'Failed to process monthly updates' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
