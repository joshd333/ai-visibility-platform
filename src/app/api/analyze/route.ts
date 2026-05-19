import { NextResponse } from 'next/server';
import { generateMonthlyReport } from '@/lib/seo-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { domain } = body;

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    // Clean the domain — strip http/https/www if user pastes a full URL
    const cleanDomain = domain
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .trim();

    console.log(`[API] Starting analysis for: ${cleanDomain}`);

    const report = await generateMonthlyReport(cleanDomain);

    return NextResponse.json({
      success: true,
      domain: cleanDomain,
      report,
    });

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