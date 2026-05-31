'use client';

import { useState } from 'react';
import { FileText, Tag, Copy, Check, Lightbulb } from 'lucide-react';

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center">
        <FileText size={28} className="text-purple-400" />
      </div>
      <h2 className="text-xl font-bold">No content plan yet</h2>
      <p className="text-neutral-400 text-sm max-w-sm">Run an analysis from the Overview tab to generate your AI content plan.</p>
    </div>
  );
}

function ContentCard({ brief, index }: { brief: any; index: number }) {
  const [copied, setCopied] = useState(false);

  const copyBrief = () => {
    const text = `Title: ${brief.title}\n\nDescription: ${brief.description}\n\nTarget Keywords: ${(brief.suggestedKeywords ?? []).join(', ')}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const keywords: string[] = brief.suggestedKeywords ?? [];

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-neutral-700 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
            {index + 1}
          </div>
          <h3 className="font-bold text-base leading-snug">{brief.title}</h3>
        </div>
        <button
          onClick={copyBrief}
          className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0"
        >
          {copied
            ? <><Check size={12} className="text-emerald-400" /> Copied</>
            : <><Copy size={12} /> Copy Brief</>
          }
        </button>
      </div>

      <p className="text-sm text-neutral-400 leading-relaxed mb-4">{brief.description}</p>

      {keywords.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Tag size={12} className="text-neutral-600 flex-shrink-0" />
          {keywords.map((kw: string, i: number) => (
            <span key={i} className="bg-neutral-800 text-neutral-300 text-[11px] font-medium px-2.5 py-1 rounded-full">
              {kw}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function ContentView({ report }: { report: any }) {
  if (!report) return <EmptyState />;

  const contentPlan: any[] = report.contentPlan ?? [];
  const nextSteps: string[] = report.nextSteps ?? [];

  if (contentPlan.length === 0) return <EmptyState />;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-neutral-400 text-sm">{contentPlan.length} content briefs generated from your top keyword opportunities</p>
        </div>
      </div>

      {/* Content briefs */}
      <div className="flex flex-col gap-4 mb-8">
        {contentPlan.map((brief, i) => (
          <ContentCard key={i} brief={brief} index={i} />
        ))}
      </div>

      {/* Next Steps */}
      {nextSteps.length > 0 && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={16} className="text-amber-400" />
            <h3 className="font-bold">Strategic Next Steps</h3>
          </div>
          <div className="flex flex-col gap-2">
            {nextSteps.map((step: string, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                <div className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-neutral-300 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
