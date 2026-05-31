'use client';

import { ShieldAlert, ShieldCheck, AlertTriangle, Info, Loader2, RefreshCw } from 'lucide-react';

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
        <ShieldAlert size={28} className="text-amber-400" />
      </div>
      <h2 className="text-xl font-bold">No audit data yet</h2>
      <p className="text-neutral-400 text-sm max-w-sm">Run an analysis from the Overview tab to kick off a technical audit.</p>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#f43f5e';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#262626" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-extrabold" style={{ color }}>{score}</span>
        <span className="text-xs text-neutral-500 mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

type Issue = { severity: 'high' | 'medium' | 'low'; category: string; message: string };

const SEVERITY_CONFIG = {
  high:   { dot: 'bg-rose-400',   badge: 'bg-rose-500/10 text-rose-400',   icon: AlertTriangle, label: 'High'   },
  medium: { dot: 'bg-amber-400',  badge: 'bg-amber-500/10 text-amber-400', icon: AlertTriangle, label: 'Medium' },
  low:    { dot: 'bg-blue-400',   badge: 'bg-blue-500/10 text-blue-400',   icon: Info,          label: 'Low'    },
};

export function AuditsView({
  audit,
  auditLoading,
  domain,
  onRerunAudit,
}: {
  audit: { score: number; issues: Issue[] } | null;
  auditLoading: boolean;
  domain: string;
  onRerunAudit: () => void;
}) {
  if (!audit && !auditLoading) return <EmptyState />;

  if (auditLoading && !audit) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 size={40} className="animate-spin text-indigo-400" />
        <p className="text-neutral-400 text-sm">Crawling site — results appear in ~30 seconds...</p>
      </div>
    );
  }

  if (!audit) return <EmptyState />;

  const issues = audit.issues ?? [];
  const highIssues   = issues.filter((i) => i.severity === 'high');
  const mediumIssues = issues.filter((i) => i.severity === 'medium');
  const lowIssues    = issues.filter((i) => i.severity === 'low');

  const grouped: { severity: 'high' | 'medium' | 'low'; items: Issue[] }[] = [
    { severity: 'high',   items: highIssues   },
    { severity: 'medium', items: mediumIssues },
    { severity: 'low',    items: lowIssues    },
  ].filter((g) => g.items.length > 0);

  return (
    <div>
      {/* Score + summary */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8">
        <ScoreRing score={audit.score} />

        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-1">Technical Health Score</h2>
          <p className="text-neutral-400 text-sm mb-5">
            {audit.score >= 80
              ? 'Excellent — your site is technically healthy.'
              : audit.score >= 60
              ? 'Good, but a few issues need attention.'
              : 'Multiple issues found that may hurt rankings.'}
          </p>

          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 flex-shrink-0" />
              <span className="text-sm"><span className="font-bold text-white">{highIssues.length}</span> <span className="text-neutral-400">High</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0" />
              <span className="text-sm"><span className="font-bold text-white">{mediumIssues.length}</span> <span className="text-neutral-400">Medium</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 flex-shrink-0" />
              <span className="text-sm"><span className="font-bold text-white">{lowIssues.length}</span> <span className="text-neutral-400">Low</span></span>
            </div>
          </div>
        </div>

        <button
          onClick={onRerunAudit}
          disabled={auditLoading}
          className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 self-start md:self-auto"
        >
          <RefreshCw size={14} className={auditLoading ? 'animate-spin' : ''} />
          Re-run Audit
        </button>
      </div>

      {/* Issues list */}
      {issues.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 flex items-center gap-4">
          <ShieldCheck size={32} className="text-emerald-400 flex-shrink-0" />
          <div>
            <p className="font-bold text-emerald-400">No issues found</p>
            <p className="text-sm text-neutral-400 mt-0.5">Your site passed all technical checks.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {grouped.map(({ severity, items }) => {
            const cfg = SEVERITY_CONFIG[severity];
            return (
              <div key={severity} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                  <span className="text-xs text-neutral-500 ml-1">{items.length} issue{items.length !== 1 ? 's' : ''}</span>
                </div>
                {items.map((issue, i) => (
                  <div key={i} className="px-5 py-4 border-b border-neutral-800/50 flex items-start gap-3 hover:bg-neutral-800/30 transition-colors">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                    <p className="text-sm text-neutral-300 leading-relaxed">{issue.message}</p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
