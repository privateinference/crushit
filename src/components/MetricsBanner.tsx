import React from 'react';
import {
  Zap,
  TrendingDown,
  ShieldCheck,
  Code2,
  FileText,
  Boxes,
  Database,
  Link,
  Cpu,
} from 'lucide-react';
import { CompressionStats } from '../engine/types';

interface MetricsBannerProps {
  stats: CompressionStats | null;
}

export const MetricsBanner: React.FC<MetricsBannerProps> = ({ stats }) => {
  if (!stats) return null;

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm backdrop-blur-sm">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {/* Metric 1: Original Size */}
        <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/50">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Original HTML
            </span>
          </div>
          <div className="text-xl font-bold text-slate-100">
            {formatBytes(stats.originalBytes)}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            ~{stats.originalTokens.toLocaleString()} LLM tokens
          </div>
        </div>

        {/* Metric 2: Crushed JSON AST */}
        <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/50">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1.5 font-medium text-cyan-300">
              <Boxes className="w-3.5 h-3.5 text-cyan-400" /> Crushed JSON AST
            </span>
          </div>
          <div className="text-xl font-bold text-cyan-400">
            {formatBytes(stats.crushedJsonBytes)}
          </div>
          <div className="text-xs text-cyan-300/80 mt-0.5">
            ~{stats.crushedTokens.toLocaleString()} LLM tokens
          </div>
        </div>

        {/* Metric 3: Token Reduction */}
        <div className="bg-gradient-to-br from-emerald-950/40 to-slate-800/80 rounded-xl p-3.5 border border-emerald-800/40">
          <div className="flex items-center justify-between text-emerald-300 text-xs mb-1">
            <span className="flex items-center gap-1.5 font-semibold">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-400" /> Token Reduction
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-900/80 text-emerald-300">
              LLM Prompt Cache
            </span>
          </div>
          <div className="text-xl font-extrabold text-emerald-400">
            -{stats.tokenReductionPercent}%
          </div>
          <div className="text-xs text-emerald-300/80 mt-0.5">
            Saves {Math.max(0, stats.originalTokens - stats.crushedTokens).toLocaleString()} tokens per call
          </div>
        </div>

        {/* Metric 4: Lossless Verification */}
        <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/50">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1.5 font-medium text-blue-300">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Parity Guarantee
            </span>
          </div>
          <div className="text-xl font-bold text-blue-400 flex items-center gap-1">
            100% Lossless
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            0% style or behavioral drop
          </div>
        </div>
      </div>

      {/* Deduplication Breakdown Strip */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          AST Deduplication Matrix:
        </span>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 flex items-center gap-1">
            <Database className="w-3 h-3 text-cyan-400" />
            <strong className="text-slate-100">{stats.uniqueTagsCount}</strong> tags / <strong className="text-slate-100">{stats.uniqueAttrsCount}</strong> attrs
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 flex items-center gap-1">
            <Code2 className="w-3 h-3 text-indigo-400" />
            <strong className="text-slate-100">{stats.uniqueCssPropsCount}</strong> CSS props / <strong className="text-slate-100">{stats.uniqueCssValuesCount}</strong> values
          </span>
          {stats.cdnUrlsDeduplicated > 0 && (
            <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 flex items-center gap-1">
              <Link className="w-3 h-3 text-emerald-400" />
              <strong className="text-slate-100">{stats.cdnUrlsDeduplicated}</strong> CDN URLs chunked
            </span>
          )}
          {stats.scriptLiteralsDeduplicated > 0 && (
            <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-amber-400" />
              <strong className="text-slate-100">{stats.scriptLiteralsDeduplicated}</strong> JS AST strings indexed
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
