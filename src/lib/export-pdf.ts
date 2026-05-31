import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export function exportReportPDF(domain: string, report: any) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const now = new Date();
  const pageW = doc.internal.pageSize.getWidth();

  // ── Header ────────────────────────────────────────────────────────────
  doc.setFillColor(15, 15, 15);
  doc.rect(0, 0, pageW, 40, 'F');

  doc.setFontSize(10);
  doc.setTextColor(165, 180, 252); // indigo-300
  doc.setFont('helvetica', 'bold');
  doc.text('RankCommander', 14, 14);

  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(`SEO Report: ${domain}`, 14, 24);

  doc.setFontSize(10);
  doc.setTextColor(115, 115, 115);
  doc.setFont('helvetica', 'normal');
  doc.text(`${MONTHS[now.getMonth()]} ${now.getFullYear()}`, 14, 32);

  // ── Score ─────────────────────────────────────────────────────────────
  const score = report.overallScore ?? 0;
  const scoreColor: [number, number, number] =
    score >= 70 ? [16, 185, 129] : score >= 40 ? [245, 158, 11] : [244, 63, 94];

  doc.setFontSize(42);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...scoreColor);
  doc.text(String(score), pageW - 14, 30, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(115, 115, 115);
  doc.text('Overall Score', pageW - 14, 36, { align: 'right' });

  let y = 50;

  // ── Overview Metrics ─────────────────────────────────────────────────
  const metrics = [
    ['Organic Keywords', report.domainOverview?.organicKeywords?.toLocaleString() ?? '—'],
    ['Monthly Traffic',  report.domainOverview?.organicTraffic?.toLocaleString()  ?? '—'],
    ['Traffic Value',    `$${report.domainOverview?.trafficValue?.toLocaleString() ?? '—'}`],
    ['Backlinks',        report.backlinks?.totalBacklinks?.toLocaleString()        ?? '—'],
    ['Referring Domains',report.backlinks?.referringDomains?.toLocaleString()      ?? '—'],
    ['Domain Rank',      String(report.backlinks?.domainRank                       ?? '—')],
  ];

  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Value']],
    body: metrics,
    theme: 'grid',
    headStyles: { fillColor: [30, 30, 30], textColor: [165, 180, 252], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fillColor: [20, 20, 20], textColor: [229, 229, 229], fontSize: 10 },
    alternateRowStyles: { fillColor: [25, 25, 25] },
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Top Keywords ─────────────────────────────────────────────────────
  const keywords = (report.topKeywords ?? []).slice(0, 8);
  if (keywords.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Top Keywords', 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [['Keyword', 'Volume', 'Difficulty', 'Opportunity']],
      body: keywords.map((k: any) => [
        k.keyword,
        k.volume?.toLocaleString() ?? '—',
        k.difficulty ?? '—',
        k.opportunityScore ?? '—',
      ]),
      theme: 'grid',
      headStyles: { fillColor: [30, 30, 30], textColor: [165, 180, 252], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fillColor: [20, 20, 20], textColor: [229, 229, 229], fontSize: 9 },
      alternateRowStyles: { fillColor: [25, 25, 25] },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ── Competitors ───────────────────────────────────────────────────────
  const competitors = report.competitors ?? [];
  if (competitors.length > 0) {
    if (y > 230) { doc.addPage(); y = 20; }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Top Competitors', 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [['Domain']],
      body: competitors.slice(0, 5).map((c: string) => [c]),
      theme: 'grid',
      headStyles: { fillColor: [30, 30, 30], textColor: [165, 180, 252], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fillColor: [20, 20, 20], textColor: [229, 229, 229], fontSize: 9 },
      alternateRowStyles: { fillColor: [25, 25, 25] },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ── Keyword Gaps ──────────────────────────────────────────────────────
  const gaps = (report.keywordGaps ?? []).slice(0, 6);
  if (gaps.length > 0) {
    if (y > 230) { doc.addPage(); y = 20; }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Keyword Gaps', 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [['Keyword', 'Volume', 'Difficulty']],
      body: gaps.map((k: any) => [
        k.keyword,
        k.volume?.toLocaleString() ?? '—',
        k.difficulty ?? '—',
      ]),
      theme: 'grid',
      headStyles: { fillColor: [30, 30, 30], textColor: [16, 185, 129], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fillColor: [20, 20, 20], textColor: [229, 229, 229], fontSize: 9 },
      alternateRowStyles: { fillColor: [25, 25, 25] },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ── Next Steps ────────────────────────────────────────────────────────
  const nextSteps = (report.nextSteps ?? []).slice(0, 3);
  if (nextSteps.length > 0) {
    if (y > 230) { doc.addPage(); y = 20; }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Recommended Next Steps', 14, y);
    y += 6;

    nextSteps.forEach((step: string, i: number) => {
      doc.setFillColor(49, 46, 129);
      doc.circle(18, y - 1, 3, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(165, 180, 252);
      doc.text(String(i + 1), 18, y + 0.5, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(212, 212, 212);
      const lines = doc.splitTextToSize(step, pageW - 42) as string[];
      doc.text(lines, 26, y);
      y += lines.length * 5 + 4;
    });
  }

  // ── Footer ────────────────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(`RankCommander — ${domain}`, 14, 290);
    doc.text(`Page ${i} of ${pageCount}`, pageW - 14, 290, { align: 'right' });
  }

  doc.save(`seo-report-${domain}-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}.pdf`);
}
