'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  LineChart,
  Search,
  ShieldAlert,
  FileText,
  ArrowUpRight,
  Settings,
  Plus,
  Loader2,
  TrendingUp,
  Link,
  Globe,
  Zap,
  Clock,
  CreditCard,
  ArrowUpCircle,
  Download,
  Mail,
  CheckCircle,
} from 'lucide-react';
import { KeywordsView } from './views/KeywordsView';
import { AuditsView }   from './views/AuditsView';
import { ContentView }  from './views/ContentView';

type View = 'overview' | 'keywords' | 'audits' | 'content';

interface SavedDomain {
  id: string;
  url: string;
  reports: {
    id: string;
    overallScore: number;
    month: number;
    year: number;
    createdAt: string;
  }[];
}

interface Usage {
  used: number;
  limit: number | null;
  subscription: string;
}

const NAV: { id: View; label: string; Icon: any }[] = [
  { id: 'overview', label: 'Overview',     Icon: LineChart   },
  { id: 'keywords', label: 'Keywords',     Icon: Search      },
  { id: 'audits',   label: 'Audits',       Icon: ShieldAlert },
  { id: 'content',  label: 'Content Plan', Icon: FileText    },
];

const VIEW_TITLES: Record<View, string> = {
  overview: 'Domain Analyzer',
  keywords: 'Keywords',
  audits:   'Technical Audits',
  content:  'Content Plan',
};

const VIEW_SUBTITLES: Record<View, string> = {
  overview: 'Enter any domain to get a full SEO & AI visibility report',
  keywords: 'Top keywords, gaps vs competitors, and live SERP rankings',
  audits:   'Technical health score and prioritised fix list',
  content:  'AI-generated content briefs targeting your best keyword opportunities',
};

export default function Dashboard() {
  const [view, setView]               = useState<View>('overview');
  const [domain, setDomain]           = useState('');
  const [loading, setLoading]         = useState(false);
  const [report, setReportData]       = useState<any>(null);
  const [error, setError]             = useState<string | null>(null);
  const [audit, setAudit]             = useState<{ score: number; issues: any[] } | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [savedDomains, setSavedDomains] = useState<SavedDomain[]>([]);
  const [usage, setUsage]             = useState<Usage | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [emailLoading, setEmailLoading]   = useState(false);
  const [emailSent, setEmailSent]         = useState(false);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchSavedDomains();
    return () => { if (pollTimer.current) clearInterval(pollTimer.current); };
  }, []);

  const fetchSavedDomains = async () => {
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const data = await res.json();
        setSavedDomains(data.domains || []);
        setUsage(data.usage ?? null);
      }
    } catch {}
  };

  const startAuditPolling = async (cleanDomain: string) => {
    setAuditLoading(true);
    setAudit(null);
    if (pollTimer.current) clearInterval(pollTimer.current);

    let taskId: string | null = null;
    try {
      const res = await fetch('/api/audit/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: cleanDomain }),
      });
      const data = await res.json();
      taskId = data.taskId;
    } catch {
      setAuditLoading(false);
      return;
    }

    if (!taskId) { setAuditLoading(false); return; }

    pollTimer.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/audit/status?taskId=${taskId}`);
        const data = await res.json();
        if (data.status === 'finished') {
          clearInterval(pollTimer.current!);
          pollTimer.current = null;
          setAudit({ score: data.score, issues: data.issues });
          setAuditLoading(false);
        }
      } catch {
        clearInterval(pollTimer.current!);
        pollTimer.current = null;
        setAuditLoading(false);
      }
    }, 5000);
  };

  const analyze = async (overrideDomain?: string) => {
    const target = overrideDomain || domain;
    if (!target) return;
    setLoading(true);
    setError(null);
    setReportData(null);
    setAudit(null);
    setAuditLoading(false);
    setEmailSent(false);
    setView('overview');
    if (pollTimer.current) { clearInterval(pollTimer.current); pollTimer.current = null; }

    const cleanDomain = target
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .trim();

    if (!overrideDomain) setDomain(cleanDomain);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: cleanDomain }),
      });
      const data = await res.json();
      if (res.status === 403 && data.limitReached) {
        setUsage((prev) => prev ? { ...prev, used: prev.limit ?? prev.used } : null);
        setError(data.error);
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setReportData(data.report);
      fetchSavedDomains();
      startAuditPolling(cleanDomain);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async () => {
    if (!report || !domain) return;
    const { exportReportPDF } = await import('@/lib/export-pdf');
    exportReportPDF(domain, report);
  };

  const emailReport = async () => {
    if (!report || !domain) return;
    setEmailLoading(true);
    setEmailSent(false);
    try {
      await fetch('/api/reports/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, report }),
      });
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 4000);
    } finally {
      setEmailLoading(false);
    }
  };

  const openBillingPortal = async () => {
    setBillingLoading(true);
    const res = await fetch('/api/stripe/portal', { method: 'POST' });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setBillingLoading(false);
  };

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const atLimit = usage !== null && usage.limit !== null && usage.used >= usage.limit;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">

      {/* ── Sidebar ── */}
      <aside className="w-64 border-r border-neutral-800 p-6 flex flex-col gap-8 flex-shrink-0">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
          <div className="bg-indigo-600 p-1 rounded-md text-white">
            <LineChart size={20} />
          </div>
          <span>AutoSEO.ai</span>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`w-full text-left p-3 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors ${
                view === id
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-300'
              }`}
            >
              <Icon size={18} className={view === id ? 'text-indigo-400' : ''} />
              {label}
            </button>
          ))}
        </nav>

        {/* Saved Domains */}
        {savedDomains.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-1">My Domains</p>
            <div className="flex flex-col gap-1">
              {savedDomains.map((d) => {
                const latest = d.reports[0];
                return (
                  <button
                    key={d.id}
                    onClick={() => analyze(d.url)}
                    className="text-left p-3 rounded-lg hover:bg-neutral-900 transition-colors group"
                  >
                    <p className="text-sm font-mono text-neutral-300 group-hover:text-white truncate">{d.url}</p>
                    {latest && (
                      <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
                        <Clock size={10} />
                        Score {latest.overallScore} · {months[latest.month - 1]} {latest.year}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom */}
        <div className="mt-auto pt-6 border-t border-neutral-800 flex flex-col gap-3">
          {usage && usage.limit !== null && (
            <div className="px-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-neutral-500">Analyses this month</span>
                <span className={`text-xs font-bold ${atLimit ? 'text-rose-400' : 'text-neutral-400'}`}>
                  {usage.used} / {usage.limit}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${atLimit ? 'bg-rose-500' : 'bg-indigo-500'}`}
                  style={{ width: `${Math.min((usage.used / usage.limit) * 100, 100)}%` }}
                />
              </div>
              {atLimit && (
                <button
                  onClick={() => window.location.href = '/#pricing'}
                  className="mt-2 w-full text-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Upgrade for unlimited →
                </button>
              )}
            </div>
          )}

          <button
            onClick={openBillingPortal}
            disabled={billingLoading}
            className="text-neutral-400 p-3 rounded-lg flex items-center gap-3 text-sm font-medium hover:bg-neutral-900 transition-colors disabled:opacity-50"
          >
            <CreditCard size={18} />
            {billingLoading ? 'Loading...' : 'Manage Billing'}
          </button>
          <div className="text-neutral-400 p-3 rounded-lg flex items-center gap-3 text-sm font-medium hover:bg-neutral-900 transition-colors cursor-pointer">
            <Settings size={18} />
            Settings
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 p-10 overflow-y-auto">

        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">{VIEW_TITLES[view]}</h1>
            <p className="text-neutral-400 text-sm">{VIEW_SUBTITLES[view]}</p>
          </div>
          {report && (
            <div className="flex gap-2">
              <button
                onClick={emailReport}
                disabled={emailLoading || emailSent}
                className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-60"
              >
                {emailSent
                  ? <><CheckCircle size={15} className="text-emerald-400" /> Sent!</>
                  : emailLoading
                  ? <><Loader2 size={15} className="animate-spin" /> Sending...</>
                  : <><Mail size={15} /> Email Report</>
                }
              </button>
              <button
                onClick={exportPDF}
                className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
              >
                <Download size={15} />
                Export PDF
              </button>
            </div>
          )}
        </header>

        {/* Upgrade banner */}
        {atLimit && (
          <div className="flex items-center justify-between gap-4 bg-indigo-600/10 border border-indigo-500/30 rounded-2xl px-6 py-4 mb-8">
            <div className="flex items-center gap-3">
              <ArrowUpCircle size={20} className="text-indigo-400 flex-shrink-0" />
              <p className="text-sm text-neutral-300">
                You've used your <span className="font-semibold text-white">1 free analysis</span> for this month. Upgrade to Pro for unlimited.
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/#pricing'}
              className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
            >
              Upgrade to Pro
            </button>
          </div>
        )}

        {/* ── Overview view ── */}
        {view === 'overview' && (
          <>
            {/* Domain input */}
            <div className="flex gap-3 mb-8">
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && analyze()}
                placeholder="e.g. eofire.com"
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-4 text-sm outline-none focus:border-indigo-500 transition-colors font-mono"
              />
              <button
                onClick={() => analyze()}
                disabled={loading || !domain || atLimit}
                className="bg-indigo-600 px-8 py-4 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
                  : <><Zap size={16} /> Analyze</>
                }
              </button>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-5 py-4 rounded-xl mb-8 text-sm">
                {error}
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 size={40} className="animate-spin text-indigo-400" />
                <p className="text-neutral-400 text-sm">Running full analysis — this takes about 30 seconds...</p>
              </div>
            )}

            {report && !loading && (
              <>
                {/* Stats row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-neutral-950 rounded-lg"><LineChart size={18} className="text-indigo-400" /></div>
                      <span className="text-xs font-bold text-emerald-400">Overall</span>
                    </div>
                    <p className="text-neutral-400 text-sm mb-1">SEO Score</p>
                    <h3 className="text-2xl font-bold">{report.overallScore}</h3>
                  </div>
                  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                    <div className="p-2 bg-neutral-950 rounded-lg w-fit mb-4"><Search size={18} className="text-emerald-400" /></div>
                    <p className="text-neutral-400 text-sm mb-1">Organic Keywords</p>
                    <h3 className="text-2xl font-bold">{report.domainOverview?.organicKeywords?.toLocaleString() || '—'}</h3>
                  </div>
                  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                    <div className="p-2 bg-neutral-950 rounded-lg w-fit mb-4"><ArrowUpRight size={18} className="text-blue-400" /></div>
                    <p className="text-neutral-400 text-sm mb-1">Monthly Traffic</p>
                    <h3 className="text-2xl font-bold">{report.domainOverview?.organicTraffic?.toLocaleString() || '—'}</h3>
                  </div>
                  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                    <div className="p-2 bg-neutral-950 rounded-lg w-fit mb-4"><Link size={18} className="text-amber-400" /></div>
                    <p className="text-neutral-400 text-sm mb-1">Backlinks</p>
                    <h3 className="text-2xl font-bold">{report.backlinks?.totalBacklinks?.toLocaleString() || '—'}</h3>
                  </div>
                </div>

                {/* Stats row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                    <p className="text-neutral-400 text-sm mb-1">Domain Rank</p>
                    <h3 className="text-2xl font-bold">{report.backlinks?.domainRank || '—'}</h3>
                  </div>
                  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                    <p className="text-neutral-400 text-sm mb-1">Referring Domains</p>
                    <h3 className="text-2xl font-bold">{report.backlinks?.referringDomains?.toLocaleString() || '—'}</h3>
                  </div>
                  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                    <p className="text-neutral-400 text-sm mb-1">Traffic Value</p>
                    <h3 className="text-2xl font-bold">${report.domainOverview?.trafficValue?.toLocaleString() || '—'}</h3>
                  </div>
                  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                    <p className="text-neutral-400 text-sm mb-1">Spam Score</p>
                    <h3 className="text-2xl font-bold">{report.backlinks?.spamScore ?? '—'}</h3>
                  </div>
                </div>

                {/* Three columns */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {/* Top Keywords */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                    <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
                      <h3 className="font-bold text-sm">Top Keywords</h3>
                      <button onClick={() => setView('keywords')} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">See all →</button>
                    </div>
                    {report.topKeywords?.slice(0, 5).map((kw: any, i: number) => (
                      <div key={i} className="p-3.5 border-b border-neutral-800/50 flex items-center justify-between hover:bg-neutral-800/30 transition-colors">
                        <div>
                          <p className="font-medium text-sm">{kw.keyword}</p>
                          <p className="text-xs text-neutral-500">Vol: {kw.volume?.toLocaleString()}</p>
                        </div>
                        <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full">{kw.opportunityScore}</span>
                      </div>
                    ))}
                  </div>

                  {/* Competitors */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                    <div className="p-5 border-b border-neutral-800">
                      <h3 className="font-bold text-sm">Top Competitors</h3>
                    </div>
                    {report.competitors?.map((c: string, i: number) => (
                      <div key={i} className="p-3.5 border-b border-neutral-800/50 flex items-center gap-3 hover:bg-neutral-800/30 transition-colors">
                        <Globe size={13} className="text-neutral-500" />
                        <p className="text-sm font-mono">{c}</p>
                      </div>
                    ))}
                  </div>

                  {/* Keyword Gaps */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                    <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
                      <h3 className="font-bold text-sm">Keyword Gaps</h3>
                      <button onClick={() => setView('keywords')} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">See all →</button>
                    </div>
                    {report.keywordGaps?.slice(0, 5).map((kw: any, i: number) => (
                      <div key={i} className="p-3.5 border-b border-neutral-800/50 flex items-center justify-between hover:bg-neutral-800/30 transition-colors">
                        <div>
                          <p className="font-medium text-sm">{kw.keyword}</p>
                          <p className="text-xs text-neutral-500">Vol: {kw.volume?.toLocaleString()}</p>
                        </div>
                        <TrendingUp size={13} className="text-emerald-400" />
                      </div>
                    ))}
                    {(!report.keywordGaps || report.keywordGaps.length === 0) && (
                      <p className="p-5 text-sm text-neutral-500">No competitor data available</p>
                    )}
                  </div>
                </div>

                {/* Audit preview + Next Steps */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                    <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
                      <h3 className="font-bold text-sm">Technical Audit</h3>
                      <div className="flex items-center gap-2">
                        {auditLoading && !audit
                          ? <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-400 flex items-center gap-1.5"><Loader2 size={11} className="animate-spin" />Scanning...</span>
                          : audit
                          ? <>
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${audit.score >= 80 ? 'bg-emerald-500/10 text-emerald-400' : audit.score >= 60 ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'}`}>Score: {audit.score}</span>
                              <button onClick={() => setView('audits')} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">See all →</button>
                            </>
                          : null
                        }
                      </div>
                    </div>
                    {auditLoading && !audit && <p className="p-5 text-sm text-neutral-500">Crawling site...</p>}
                    {audit?.issues?.slice(0, 4).map((issue: any, i: number) => (
                      <div key={i} className="p-3.5 border-b border-neutral-800/50 flex items-start gap-3">
                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${issue.severity === 'high' ? 'bg-rose-400' : issue.severity === 'medium' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                        <p className="text-sm text-neutral-300">{issue.message}</p>
                      </div>
                    ))}
                    {audit && audit.issues?.length === 0 && <p className="p-5 text-sm text-emerald-400">No issues found</p>}
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-sm">Next Steps</h3>
                      <button onClick={() => setView('content')} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Content plan →</button>
                    </div>
                    <div className="flex flex-col gap-2">
                      {report.nextSteps?.map((step: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                          <div className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                          <p className="text-sm">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {!report && !loading && !error && (
              <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                  <Globe size={32} className="text-indigo-400" />
                </div>
                <h2 className="text-xl font-bold">Enter a domain to get started</h2>
                <p className="text-neutral-400 text-sm max-w-md">
                  Get a full picture of any domain's SEO health, backlinks, keyword rankings, competitor gaps, and technical issues.
                </p>
              </div>
            )}
          </>
        )}

        {/* ── Keywords view ── */}
        {view === 'keywords' && <KeywordsView report={report} />}

        {/* ── Audits view ── */}
        {view === 'audits' && (
          <AuditsView
            audit={audit}
            auditLoading={auditLoading}
            domain={domain}
            onRerunAudit={() => domain && startAuditPolling(domain)}
          />
        )}

        {/* ── Content Plan view ── */}
        {view === 'content' && <ContentView report={report} />}

      </main>
    </div>
  );
}
