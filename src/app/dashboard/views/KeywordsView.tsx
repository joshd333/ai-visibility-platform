'use client';

import { useState } from 'react';
import { Search, TrendingUp, TrendingDown, BarChart2, Globe } from 'lucide-react';

type Tab = 'top' | 'gaps' | 'rankings';

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
        <Search size={28} className="text-indigo-400" />
      </div>
      <h2 className="text-xl font-bold">No keyword data yet</h2>
      <p className="text-neutral-400 text-sm max-w-sm">Run an analysis from the Overview tab to populate keyword data.</p>
    </div>
  );
}

function DifficultyBadge({ value }: { value: number }) {
  const color =
    value >= 70 ? 'bg-rose-500/10 text-rose-400' :
    value >= 40 ? 'bg-amber-500/10 text-amber-400' :
    'bg-emerald-500/10 text-emerald-400';
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${color}`}>
      {value >= 70 ? 'Hard' : value >= 40 ? 'Medium' : 'Easy'}
    </span>
  );
}

function PositionBadge({ position }: { position: number | null }) {
  if (!position) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-500">Not ranked</span>;
  const color =
    position <= 3  ? 'bg-emerald-500/10 text-emerald-400' :
    position <= 10 ? 'bg-blue-500/10 text-blue-400' :
    'bg-amber-500/10 text-amber-400';
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${color}`}>#{position}</span>;
}

export function KeywordsView({ report }: { report: any }) {
  const [tab, setTab] = useState<Tab>('top');

  if (!report) return <EmptyState />;

  const topKeywords  = report.topKeywords  ?? [];
  const keywordGaps  = report.keywordGaps  ?? [];
  const liveRankings = report.liveRankings ?? [];

  const rankedCount  = liveRankings.filter((r: any) => r.position).length;
  const top10Count   = liveRankings.filter((r: any) => r.position && r.position <= 10).length;

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'top',      label: 'Top Keywords',  count: topKeywords.length  },
    { id: 'gaps',     label: 'Keyword Gaps',  count: keywordGaps.length  },
    { id: 'rankings', label: 'Live Rankings', count: liveRankings.length },
  ];

  return (
    <div>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
          <p className="text-neutral-400 text-sm mb-1">Total Keywords</p>
          <p className="text-2xl font-bold">{report.domainOverview?.organicKeywords?.toLocaleString() ?? topKeywords.length}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
          <p className="text-neutral-400 text-sm mb-1">Keyword Gaps</p>
          <p className="text-2xl font-bold text-emerald-400">{keywordGaps.length}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
          <p className="text-neutral-400 text-sm mb-1">Ranked Top 10</p>
          <p className="text-2xl font-bold text-blue-400">{top10Count} <span className="text-sm font-normal text-neutral-500">/ {rankedCount} tracked</span></p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-900 border border-neutral-800 rounded-xl p-1 mb-6 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              tab === t.id
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-300'
            }`}
          >
            {t.label}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-indigo-500/20 text-indigo-400' : 'bg-neutral-800 text-neutral-500'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">

        {/* Top Keywords */}
        {tab === 'top' && (
          <>
            <div className="grid grid-cols-[1fr_80px_80px_80px] gap-0 px-5 py-3 border-b border-neutral-800 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              <span>Keyword</span>
              <span className="text-right">Volume</span>
              <span className="text-right">Difficulty</span>
              <span className="text-right">Opportunity</span>
            </div>
            {topKeywords.length === 0
              ? <p className="p-6 text-sm text-neutral-500">No keyword data available</p>
              : topKeywords.map((kw: any, i: number) => (
                <div key={i} className="grid grid-cols-[1fr_80px_80px_80px] gap-0 px-5 py-3.5 border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors items-center">
                  <div className="flex items-center gap-3">
                    <BarChart2 size={14} className="text-neutral-600 flex-shrink-0" />
                    <span className="text-sm font-medium">{kw.keyword}</span>
                  </div>
                  <span className="text-sm text-neutral-400 text-right">{kw.volume?.toLocaleString() ?? '—'}</span>
                  <div className="flex justify-end">
                    <DifficultyBadge value={kw.difficulty ?? 0} />
                  </div>
                  <span className="text-sm font-bold text-indigo-400 text-right">{kw.opportunityScore ?? '—'}</span>
                </div>
              ))
            }
          </>
        )}

        {/* Keyword Gaps */}
        {tab === 'gaps' && (
          <>
            <div className="px-5 py-3 border-b border-neutral-800">
              <p className="text-xs text-neutral-500">Keywords your top competitor ranks for that you don't — prioritised by volume.</p>
            </div>
            <div className="grid grid-cols-[1fr_80px_80px] gap-0 px-5 py-3 border-b border-neutral-800 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              <span>Keyword</span>
              <span className="text-right">Volume</span>
              <span className="text-right">Difficulty</span>
            </div>
            {keywordGaps.length === 0
              ? <p className="p-6 text-sm text-neutral-500">No competitor gap data available</p>
              : keywordGaps.map((kw: any, i: number) => (
                <div key={i} className="grid grid-cols-[1fr_80px_80px] gap-0 px-5 py-3.5 border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors items-center">
                  <div className="flex items-center gap-3">
                    <TrendingUp size={14} className="text-emerald-500 flex-shrink-0" />
                    <span className="text-sm font-medium">{kw.keyword}</span>
                  </div>
                  <span className="text-sm text-neutral-400 text-right">{kw.volume?.toLocaleString() ?? '—'}</span>
                  <div className="flex justify-end">
                    <DifficultyBadge value={kw.difficulty ?? 0} />
                  </div>
                </div>
              ))
            }
          </>
        )}

        {/* Live Rankings */}
        {tab === 'rankings' && (
          <>
            <div className="grid grid-cols-[1fr_100px_1fr] gap-0 px-5 py-3 border-b border-neutral-800 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              <span>Keyword</span>
              <span className="text-center">Position</span>
              <span>Ranking URL</span>
            </div>
            {liveRankings.length === 0
              ? <p className="p-6 text-sm text-neutral-500">No ranking data available</p>
              : liveRankings.map((r: any, i: number) => (
                <div key={i} className="grid grid-cols-[1fr_100px_1fr] gap-0 px-5 py-3.5 border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors items-center">
                  <span className="text-sm font-medium">{r.keyword}</span>
                  <div className="flex justify-center">
                    <PositionBadge position={r.position} />
                  </div>
                  {r.url
                    ? <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 truncate flex items-center gap-1 transition-colors">
                        <Globe size={11} />
                        {r.url.replace(/^https?:\/\//, '')}
                      </a>
                    : <span className="text-xs text-neutral-600">—</span>
                  }
                </div>
              ))
            }
          </>
        )}
      </div>
    </div>
  );
}
