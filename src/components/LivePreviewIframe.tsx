import React, { useState, useEffect, useRef } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  RefreshCw,
  Code2,
  Eye,
  Copy,
  Check,
} from 'lucide-react';

interface LivePreviewIframeProps {
  htmlContent: string;
}

export const LivePreviewIframe: React.FC<LivePreviewIframeProps> = ({ htmlContent }) => {
  const [viewport, setViewport] = useState<'responsive' | 'desktop' | 'tablet' | 'mobile'>('responsive');
  const [showSource, setShowSource] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Update iframe document safely via srcdoc or blob
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = htmlContent;
    }
  }, [htmlContent]);

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = htmlContent;
    }
  };

  const handleOpenExternal = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleCopySource = () => {
    navigator.clipboard.writeText(htmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getViewportWidth = () => {
    switch (viewport) {
      case 'desktop':
        return 'max-w-[1024px]';
      case 'tablet':
        return 'max-w-[768px]';
      case 'mobile':
        return 'max-w-[375px]';
      case 'responsive':
      default:
        return 'w-full';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md flex flex-col h-[750px]">
      {/* Top Viewport & Action Bar */}
      <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Viewport toggles */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewport('responsive')}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition ${
              viewport === 'responsive'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Responsive
          </button>
          <button
            onClick={() => setViewport('desktop')}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition ${
              viewport === 'desktop'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" /> Desktop (1024px)
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition ${
              viewport === 'tablet'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" /> Tablet (768px)
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition ${
              viewport === 'mobile'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" /> Mobile (375px)
          </button>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setShowSource(!showSource)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
              showSource
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {showSource ? <Eye className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
            {showSource ? 'Live Preview' : 'View Rehydrated HTML'}
          </button>

          <button
            onClick={handleReload}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Reload sandbox"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleOpenExternal}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Open in new window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Preview or Source Body */}
      <div className="flex-1 bg-slate-950/70 p-4 flex items-center justify-center overflow-auto">
        {showSource ? (
          <div className="w-full h-full relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Rehydrated 0-Loss HTML Source ({htmlContent.length.toLocaleString()} characters)</span>
              <button
                onClick={handleCopySource}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy HTML'}
              </button>
            </div>
            <pre className="flex-1 p-4 overflow-auto font-mono text-xs text-slate-300 whitespace-pre-wrap select-all">
              {htmlContent}
            </pre>
          </div>
        ) : (
          <div className={`h-full transition-all duration-300 ease-in-out shadow-2xl rounded-xl overflow-hidden border border-slate-800 bg-white ${getViewportWidth()}`}>
            <iframe
              ref={iframeRef}
              title="OmniCrush Live Preview Sandbox"
              sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
              className="w-full h-full border-0 bg-white"
            />
          </div>
        )}
      </div>
    </div>
  );
};
