import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export async function sendSEOReport(email: string, domain: string, report: any) {
  const now = new Date();
  const subject = `Your SEO Report for ${domain} — ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;

  await resend.emails.send({
    from: 'RankCommander <reports@rankcommander.com>',
    to: email,
    subject,
    html: buildReportEmail(domain, report, now),
  });
}

function buildReportEmail(domain: string, report: any, date: Date): string {
  const score = report.overallScore ?? 0;
  const keywords = report.domainOverview?.organicKeywords?.toLocaleString() ?? '—';
  const traffic = report.domainOverview?.organicTraffic?.toLocaleString() ?? '—';
  const backlinks = report.backlinks?.totalBacklinks?.toLocaleString() ?? '—';
  const topKeywords = (report.topKeywords ?? []).slice(0, 5);
  const nextSteps = (report.nextSteps ?? []).slice(0, 3);

  const keywordRows = topKeywords
    .map((k: any) => `
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #2a2a2a;color:#e5e5e5;font-size:14px;">${k.keyword}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #2a2a2a;color:#a3a3a3;font-size:14px;text-align:right;">${k.volume?.toLocaleString() ?? '—'}</td>
      </tr>`)
    .join('');

  const nextStepItems = nextSteps
    .map((s: string, i: number) => `
      <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;">
        <div style="width:24px;height:24px;border-radius:50%;background:#3730a3;color:#818cf8;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:24px;text-align:center;">${i + 1}</div>
        <p style="margin:0;color:#d4d4d4;font-size:14px;line-height:1.5;">${s}</p>
      </div>`)
    .join('');

  const scoreColor = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#f43f5e';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">

    <!-- Header -->
    <div style="margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:24px;">
        <div style="background:#4f46e5;border-radius:8px;padding:6px 10px;color:#fff;font-weight:700;font-size:14px;">RankCommander</div>
      </div>
      <h1 style="margin:0 0 8px;color:#ffffff;font-size:24px;font-weight:700;">Monthly SEO Report</h1>
      <p style="margin:0;color:#737373;font-size:14px;">${domain} &middot; ${MONTHS[date.getMonth()]} ${date.getFullYear()}</p>
    </div>

    <!-- Score Card -->
    <div style="background:#171717;border:1px solid #262626;border-radius:16px;padding:24px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 8px;color:#737373;font-size:13px;text-transform:uppercase;letter-spacing:0.1em;">Overall SEO Score</p>
      <p style="margin:0;font-size:56px;font-weight:800;color:${scoreColor};">${score}</p>
    </div>

    <!-- Metrics Grid -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:24px;">
      <div style="background:#171717;border:1px solid #262626;border-radius:12px;padding:16px;">
        <p style="margin:0 0 4px;color:#737373;font-size:12px;">Organic Keywords</p>
        <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">${keywords}</p>
      </div>
      <div style="background:#171717;border:1px solid #262626;border-radius:12px;padding:16px;">
        <p style="margin:0 0 4px;color:#737373;font-size:12px;">Monthly Traffic</p>
        <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">${traffic}</p>
      </div>
      <div style="background:#171717;border:1px solid #262626;border-radius:12px;padding:16px;">
        <p style="margin:0 0 4px;color:#737373;font-size:12px;">Backlinks</p>
        <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">${backlinks}</p>
      </div>
    </div>

    <!-- Top Keywords -->
    ${topKeywords.length > 0 ? `
    <div style="background:#171717;border:1px solid #262626;border-radius:16px;overflow:hidden;margin-bottom:24px;">
      <div style="padding:16px 16px 12px;border-bottom:1px solid #262626;">
        <h3 style="margin:0;color:#ffffff;font-size:15px;font-weight:600;">Top Keywords</h3>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#111111;">
            <th style="padding:10px 16px;text-align:left;color:#737373;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Keyword</th>
            <th style="padding:10px 16px;text-align:right;color:#737373;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Volume</th>
          </tr>
        </thead>
        <tbody>${keywordRows}</tbody>
      </table>
    </div>` : ''}

    <!-- Next Steps -->
    ${nextSteps.length > 0 ? `
    <div style="background:#171717;border:1px solid #262626;border-radius:16px;padding:20px;margin-bottom:32px;">
      <h3 style="margin:0 0 16px;color:#ffffff;font-size:15px;font-weight:600;">Recommended Next Steps</h3>
      ${nextStepItems}
    </div>` : ''}

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:40px;">
      <a href="${process.env.NEXTAUTH_URL ?? 'https://rankcommander.com'}/dashboard" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;">
        View Full Dashboard →
      </a>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #262626;padding-top:24px;text-align:center;">
      <p style="margin:0;color:#525252;font-size:12px;">RankCommander &mdash; Autonomous SEO Intelligence</p>
      <p style="margin:8px 0 0;color:#525252;font-size:12px;">You're receiving this because you have an active domain tracked on RankCommander.</p>
    </div>

  </div>
</body>
</html>`;
}
