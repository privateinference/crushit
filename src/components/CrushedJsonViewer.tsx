import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  Database,
  Code2,
  Link,
  Cpu,
  FileJson,
  Layers,
} from 'lucide-react';
import { OmniCrushedDocument } from '../engine/types';

interface CrushedJsonViewerProps {
  crushedDoc: OmniCrushedDocument | null;
  onCopyJson: () => void;
  onDownloadJson: () => void;
}

export const CrushedJsonViewer: React.FC<CrushedJsonViewerProps> = ({
  crushedDoc,
  onCopyJson,
  onDownloadJson,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'full' | 'dictionaries' | 'css' | 'importmaps' | 'scripts'>('full');
  const [copied, setCopied] = useState(false);

  if (!crushedDoc) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
        No crushed document loaded. Please click &quot;Crush Document&quot; in the editor.
      </div>
    );
  }

  const handleCopy = () => {
    onCopyJson();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSubContent = () => {
    switch (activeSubTab) {
      case 'dictionaries':
        return JSON.stringify(crushedDoc.dictionaries, null, 2);
      case 'css':
        return JSON.stringify(crushedDoc.css, null, 2);
      case 'importmaps':
        return JSON.stringify(crushedDoc.importMaps, null, 2);
      case 'scripts':
        return JSON.stringify(crushedDoc.scripts, null, 2);
      case 'full':
      default:
        return JSON.stringify(crushedDoc, null, 2);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md flex flex-col h-full">
      {/* Sub-header navigation */}
      <div className="bg-slate-950/70 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveSubTab('full')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition ${
              activeSubTab === 'full'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" /> Full Crushed JSON
          </button>
          <button
            onClick={() => setActiveSubTab('dictionaries')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition ${
              activeSubTab === 'dictionaries'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" /> Dictionaries ({crushedDoc.dictionaries.tags.length + crushedDoc.dictionaries.attrNames.length + crushedDoc.dictionaries.attrValues.length})
          </button>
          <button
            onClick={() => setActiveSubTab('css')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition ${
              activeSubTab === 'css'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" /> CSS Declarations ({crushedDoc.css.rules.length} rules)
          </button>
          <button
            onClick={() => setActiveSubTab('importmaps')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition ${
              activeSubTab === 'importmaps'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Link className="w-3.5 h-3.5" /> CDN Import Maps ({crushedDoc.importMaps.length})
          </button>
          <button
            onClick={() => setActiveSubTab('scripts')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition ${
              activeSubTab === 'scripts'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" /> Script AST ({crushedDoc.scripts.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={onDownloadJson}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            Download
          </button>
        </div>
      </div>

      {/* JSON Viewer Area */}
      <div className="flex-1 p-4 overflow-auto bg-slate-950 font-mono text-xs leading-relaxed text-slate-300 select-all">
        <pre className="whitespace-pre-wrap">{getSubContent()}</pre>
      </div>

      {/* Quick Dictionary Summary Footer */}
      {activeSubTab === 'dictionaries' && (
        <div className="bg-slate-900 border-t border-slate-800 p-3 text-xs grid grid-cols-2 md:grid-cols-4 gap-2 text-slate-400">
          <div>Tags indexed: <strong className="text-cyan-400">{crushedDoc.dictionaries.tags.length}</strong></div>
          <div>Attr names: <strong className="text-cyan-400">{crushedDoc.dictionaries.attrNames.length}</strong></div>
          <div>Attr values: <strong className="text-cyan-400">{crushedDoc.dictionaries.attrValues.length}</strong></div>
          <div>Class tokens: <strong className="text-cyan-400">{crushedDoc.dictionaries.classTokens.length}</strong></div>
        </div>
      )}
    </div>
  );
};
