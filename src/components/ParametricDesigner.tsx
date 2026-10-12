import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  Palette,
  Type,
  Maximize2,
  RefreshCw,
  Send,
  Cpu,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { ParametricVariable } from '../engine/types';

interface ParametricDesignerProps {
  parameters: ParametricVariable[];
  onParameterChange: (id: string, value: any) => void;
  onResetParameters: () => void;
  onApplyAiReskin: (themePrompt: string, model: string) => Promise<void>;
  onRunAiAudit: (model: string) => Promise<string>;
  isAiLoading: boolean;
}

export const ParametricDesigner: React.FC<ParametricDesignerProps> = ({
  parameters,
  onParameterChange,
  onResetParameters,
  onApplyAiReskin,
  onRunAiAudit,
  isAiLoading,
}) => {
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');
  const [promptInput, setPromptInput] = useState<string>('');
  const [auditResult, setAuditResult] = useState<string | null>(null);

  const PRESET_IDEAS = [
    'Dark Biotech Publication (Deep Slate & Cyan)',
    'Minimalist Lab Report (Clean Cobalt & Crisp Grey)',
    'Emerald Genomic Flora (Forest & Emerald)',
    'High-Contrast Clinical Diagnostics (Crimson & Pure White)',
    'Cyberpunk Bioinformatics (Onyx & Electric Amber)',
  ];

  const handlePresetClick = (preset: string) => {
    setPromptInput(preset);
  };

  const handleTriggerReskin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptInput.trim()) return;
    await onApplyAiReskin(promptInput.trim(), selectedModel);
  };

  const handleAuditClick = async () => {
    setAuditResult(null);
    const result = await onRunAiAudit(selectedModel);
    setAuditResult(result);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Gemini AI Designer */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 text-sm">Gemini AI Designer</h3>
                <p className="text-[11px] text-slate-400">Intelligent re-skinning & AST optimization</p>
              </div>
            </div>

            {/* Model Selector */}
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
            >
              <option value="gemini-3.8-flash">gemini-3.8-flash (Default)</option>
              <option value="gemini-3.5-flash">gemini-3.5-flash (Balanced)</option>
              <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast)</option>
            </select>
          </div>

          {/* AI Re-skin Form */}
          <form onSubmit={handleTriggerReskin} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                AI Re-skin / Re-theme Prompt:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="e.g. Modern Swiss typography with dark navy and electric teal..."
                  disabled={isAiLoading}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 pr-10"
                />
                <button
                  type="submit"
                  disabled={isAiLoading || !promptInput.trim()}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center justify-center transition disabled:opacity-40"
                >
                  {isAiLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Quick Prompt Ideas */}
            <div>
              <span className="text-[11px] font-medium text-slate-400 block mb-1.5">
                Preset Palette Ideas:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_IDEAS.map((idea) => (
                  <button
                    key={idea}
                    type="button"
                    onClick={() => handlePresetClick(idea)}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition text-left"
                  >
                    {idea.split('(')[0].trim()}
                  </button>
                ))}
              </div>
            </div>
          </form>

          {/* AI Token Crusher Advisor */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Token Crusher Audit
              </div>
              <div className="text-[11px] text-slate-400">
                Ask Gemini to audit AST deduplication efficiency
              </div>
            </div>
            <button
              onClick={handleAuditClick}
              disabled={isAiLoading}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-50"
            >
              Run Audit
            </button>
          </div>

          {/* Audit Results Modal / Box */}
          {auditResult && (
            <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-56 overflow-auto">
              {auditResult}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Live Parametric Controls */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="font-semibold text-slate-100 text-sm">
                Interactive Parametric Variables ({parameters.length})
              </h3>
            </div>
            <button
              onClick={onResetParameters}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3 h-3" /> Reset Defaults
            </button>
          </div>

          {parameters.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No parametric variables detected for this document.
            </div>
          ) : (
            <div className="space-y-4">
              {parameters.map((param) => (
                <div
                  key={param.id}
                  className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200">
                        {param.label}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {param.category}
                      </span>
                    </div>
                    {param.description && (
                      <p className="text-[11px] text-slate-400">{param.description}</p>
                    )}
                  </div>

                  {/* Input controls based on type */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {param.type === 'color' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={String(param.currentValue || '#ffffff')}
                          onChange={(e) => onParameterChange(param.id, e.target.value)}
                          className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={String(param.currentValue || '')}
                          onChange={(e) => onParameterChange(param.id, e.target.value)}
                          className="w-24 bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 rounded px-2 py-1 focus:outline-none"
                        />
                      </div>
                    )}

                    {param.type === 'number' && (
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={param.min ?? 0}
                          max={param.max ?? 50}
                          step={param.step ?? 1}
                          value={Number(param.currentValue || 0)}
                          onChange={(e) => onParameterChange(param.id, Number(e.target.value))}
                          className="w-28 accent-cyan-500 cursor-pointer"
                        />
                        <span className="font-mono text-xs text-slate-300 w-12 text-right">
                          {String(param.currentValue)}{param.unit || ''}
                        </span>
                      </div>
                    )}

                    {param.type === 'text' && (
                      <input
                        type="text"
                        value={String(param.currentValue || '')}
                        onChange={(e) => onParameterChange(param.id, e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 w-48 sm:w-60 focus:outline-none focus:border-cyan-500"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
