import React, { useRef } from 'react';
import {
  FileCode2,
  Sparkles,
  Download,
  Upload,
  RefreshCw,
  Layers,
  FileArchive,
  Check,
  Dna,
  Pill,
  Globe,
} from 'lucide-react';
import { SAMPLE_TEMPLATES } from '../engine/samples';

interface HeaderProps {
  activeSampleId: string;
  onSelectSample: (sampleId: string) => void;
  onUploadHtml: (content: string, filename: string) => void;
  onDownloadJson: () => void;
  onDownloadHtml: () => void;
  onDownloadZip: () => void;
  isProcessing: boolean;
  tokenSavingsPercent: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeSampleId,
  onSelectSample,
  onUploadHtml,
  onDownloadJson,
  onDownloadHtml,
  onDownloadZip,
  isProcessing,
  tokenSavingsPercent,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          onUploadHtml(content, file.name);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-100 tracking-tight">
                  OmniCrush<span className="text-cyan-400">AST</span>
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                  Lossless JSON Crusher
                </span>
                {tokenSavingsPercent > 0 && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                    <Check className="w-3 h-3" /> -{tokenSavingsPercent}% LLM Tokens
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-normal">
                Lossless HTML/CSS/JS AST Crusher • CDN Deduplicator • Parametric Templating & AI Designer
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Upload HTML */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".html,.htm"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Upload your own HTML file"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              Upload HTML
            </button>

            {/* Export JSON */}
            <button
              onClick={onDownloadJson}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-50"
              title="Download Crushed JSON AST object"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              Crushed JSON
            </button>

            {/* Export Rehydrated HTML */}
            <button
              onClick={onDownloadHtml}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-50"
              title="Download Rehydrated 0-Loss HTML file"
            >
              <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />
              Rehydrated HTML
            </button>

            {/* Export ZIP Bundle */}
            <button
              onClick={onDownloadZip}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-blue-900/30 transition disabled:opacity-50"
              title="Export complete bundle with JSON AST, HTML, and Runtime Harness"
            >
              <FileArchive className="w-3.5 h-3.5" />
              Export ZIP Bundle
            </button>
          </div>
        </div>

        {/* Quick-try preset pill bar */}
        <div className="flex items-center gap-2 py-2 border-t border-slate-800/80 overflow-x-auto text-xs">
          <span className="text-slate-400 flex items-center gap-1 whitespace-nowrap font-medium pr-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Quick Presets:
          </span>
          {SAMPLE_TEMPLATES.map((sample) => {
            const isActive = activeSampleId === sample.id;
            return (
              <button
                key={sample.id}
                onClick={() => onSelectSample(sample.id)}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap flex items-center gap-1.5 transition text-xs font-medium ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                }`}
              >
                {sample.category === 'science' && <Dna className="w-3 h-3 text-cyan-300" />}
                {sample.category === 'chemistry' && <Pill className="w-3 h-3 text-amber-300" />}
                {sample.category === 'modern-web' && <Globe className="w-3 h-3 text-emerald-300" />}
                <span>{sample.title.split('(')[0].trim()}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
