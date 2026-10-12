import React, { useState } from 'react';
import {
  Code2,
  Zap,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Maximize2,
  FileCode,
} from 'lucide-react';

interface EditorWorkspaceProps {
  rawHtml: string;
  onChangeHtml: (html: string) => void;
  onCrush: () => void;
  onReset: () => void;
  isProcessing: boolean;
}

export const EditorWorkspace: React.FC<EditorWorkspaceProps> = ({
  rawHtml,
  onChangeHtml,
  onCrush,
  onReset,
  isProcessing,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md flex flex-col h-[700px]">
      {/* Editor Top Bar */}
      <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-xs text-slate-200">
            Source HTML Document ({rawHtml.length.toLocaleString()} characters)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Reset to sample default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            onClick={onCrush}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-blue-900/40 transition disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5 text-white" />
            {isProcessing ? 'Crushing...' : 'Crush & Deduplicate'}
          </button>
        </div>
      </div>

      {/* Textarea Area */}
      <div className="flex-1 relative bg-slate-950">
        <textarea
          value={rawHtml}
          onChange={(e) => onChangeHtml(e.target.value)}
          placeholder="Paste or write your HTML document here with inline <style>, <script>, <script type='importmap'>..."
          spellCheck={false}
          className="w-full h-full p-4 font-mono text-xs leading-relaxed text-slate-300 bg-transparent border-0 resize-none focus:outline-none focus:ring-0 selection:bg-blue-600/40"
        />
      </div>

      {/* Editor Status Footer */}
      <div className="bg-slate-950 border-t border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-500">
        <span>Ready for AST crushing, CSS declaration extraction, and CDN chunking.</span>
        <span>UTF-8 Document</span>
      </div>
    </div>
  );
};
