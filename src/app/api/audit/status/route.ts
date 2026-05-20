import { NextResponse } from 'next/server';

const dataForSEOAuth = Buffer.from(
  process.env.DATAFORSEO_LOGIN + ':' + process.env.DATAFORSEO_PASSWORD
).toString('base64');

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');
  if (!taskId) return NextResponse.json({ error: 'taskId required' }, { status: 400 });

  const res = await fetch(`https://api.dataforseo.com/v3/on_page/summary/${taskId}`, {
    headers: { 'Authorization': 'Basic ' + dataForSEOAuth },
  });
  const data = await res.json();
  const result = data.tasks?.[0]?.result?.[0];

  if (!result || result.crawl_progress !== 'finished') {
    return NextResponse.json({ status: 'pending' });
  }

  const checks = result.page_metrics?.checks || {};
  const issues: { severity: string; category: string; message: string }[] = [];
  if (checks.no_description > 0) issues.push({ severity: 'medium', category: 'seo', message: `${checks.no_description} pages missing meta descriptions` });
  if (checks.no_image_alt > 0) issues.push({ severity: 'low', category: 'seo', message: `${checks.no_image_alt} images missing alt tags` });
  if (checks.title_too_long > 0) issues.push({ severity: 'low', category: 'seo', message: `${checks.title_too_long} pages with title too long` });
  if (checks.is_http > 0) issues.push({ severity: 'high', category: 'seo', message: `${checks.is_http} pages served over HTTP instead of HTTPS` });
  if (checks.broken_links > 0) issues.push({ severity: 'high', category: 'seo', message: `${checks.broken_links} broken links found` });
  if (checks.no_h1_tag > 0) issues.push({ severity: 'medium', category: 'seo', message: `${checks.no_h1_tag} pages missing H1 tag` });
  if (checks.duplicate_content > 0) issues.push({ severity: 'medium', category: 'seo', message: `${checks.duplicate_content} pages with duplicate content` });
  if (checks.https_to_http_links > 0) issues.push({ severity: 'low', category: 'seo', message: `${checks.https_to_http_links} HTTPS pages linking to HTTP resources` });

  return NextResponse.json({
    status: 'finished',
    score: result.page_metrics?.onpage_score || 0,
    issues: issues.slice(0, 10),
  });
}

export const dynamic = 'force-dynamic';
