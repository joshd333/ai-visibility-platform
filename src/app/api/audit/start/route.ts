import { NextResponse } from 'next/server';

const dataForSEOAuth = Buffer.from(
  process.env.DATAFORSEO_LOGIN + ':' + process.env.DATAFORSEO_PASSWORD
).toString('base64');

export async function POST(request: Request) {
  const { domain } = await request.json();
  if (!domain) return NextResponse.json({ error: 'Domain required' }, { status: 400 });

  const res = await fetch('https://api.dataforseo.com/v3/on_page/task_post', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + dataForSEOAuth,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([{
      target: domain,
      max_crawl_pages: 3,
      load_resources: false,
      enable_javascript: false,
    }]),
  });

  const data = await res.json();
  const taskId = data.tasks?.[0]?.id;
  if (!taskId) return NextResponse.json({ error: 'Failed to start audit task' }, { status: 500 });

  return NextResponse.json({ taskId });
}

export const dynamic = 'force-dynamic';
