import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  Box,
  Code2,
  Copy,
  Check,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { CrushedScript } from '../engine/types';

interface JsAstHarnessLabProps {
  scripts: CrushedScript[];
  useHarness: boolean;
  onToggleHarness: (enabled: boolean) => void;
}

export const JsAstHarnessLab: React.FC<JsAstHarnessLabProps> = ({
  scripts,
  useHarness,
  onToggleHarness,
}) => {
  const [selectedScriptIndex, setSelectedScriptIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  if (scripts.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
        No inline or external JavaScript scripts detected in this document.
      </div>
    );
  }

  const script = scripts[selectedScriptIndex] || scripts[0];
  const summary = script.astSummary;

  const handleCopyHarness = () => {
    if (script.harnessWrapper) {
      navigator.clipboard.writeText(script.harnessWrapper);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Harness Control Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-slate-100 text-sm">
              JavaScript AST & Singleton Runtime Harness Lab
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            AST parsing via Acorn • Repetitive literal deduplication • Extensible Class-based Singletons, Proxies & Monkeypatching
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
            <input
              type="checkbox"
              checked={useHarness}
              onChange={(e) => onToggleHarness(e.target.checked)}
              className="accent-indigo-500 w-4 h-4 rounded cursor-pointer"
            />
            <span className="text-xs font-medium text-slate-200">
              Wrap Scripts in Runtime Harness on Rehydrate
            </span>
          </label>
        </div>
      </div>

      {/* Script Selector Tabs if multiple */}
      {scripts.length > 1 && (
        <div className="flex items-center gap-2">
          {scripts.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setSelectedScriptIndex(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedScriptIndex === idx
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {s.id} ({s.type})
            </button>
          ))}
        </div>
      )}

      {/* Grid: AST Analysis Card + Generated Harness */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: AST Summary & Discovered Singletons */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5 text-indigo-400" /> Acorn AST Metrics
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Total AST Nodes</span>
                <strong className="text-slate-100 text-base">{summary?.nodeCount || 0}</strong>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Functions</span>
                <strong className="text-slate-100 text-base">{summary?.functions.length || 0}</strong>
              </div>
            </div>

            {/* Injected Singleton Classes */}
            <div className="space-y-2 mb-4">
              <span className="text-[11px] font-semibold text-slate-400 block">
                Singletons & Proxies Built for this Scope:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {summary?.singletonHelpers.map((helper) => (
                  <span
                    key={helper}
                    className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-800/60"
                  >
                    class {helper}
                  </span>
                ))}
              </div>
            </div>

            {/* Deduplicated String Literals */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                Deduplicated String Literals in Registry (_STR):
              </span>
              {summary?.stringLiterals && summary.stringLiterals.length > 0 ? (
                <div className="max-h-40 overflow-auto bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 font-mono text-[11px] text-cyan-300 space-y-1">
                  {summary.stringLiterals.map((lit, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-slate-500">[{idx}]</span>
                      <span className="truncate">&quot;{lit}&quot;</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 italic">No repetitive string constants in script.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Full Harness Code */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[520px]">
            <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                Constructed Singleton Harness & Proxy Code
              </span>
              <button
                onClick={handleCopyHarness}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy Harness'}
              </button>
            </div>
            <pre className="flex-1 p-4 overflow-auto font-mono text-xs text-indigo-200/90 bg-slate-950/90 whitespace-pre-wrap select-all">
              {script.harnessWrapper || '// No script body available'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
