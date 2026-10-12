/**
 * OmniCrush AST - Main Application
 * Lossless HTML/CSS/JS AST Crusher, Import Map Deduplicator,
 * Parametric Templating Engine and AI Designer.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import JSZip from 'jszip';
import {
  Layers,
  FileCode2,
  FileJson,
  Sliders,
  Eye,
  Dna,
  Cpu,
  Sparkles,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
} from 'lucide-react';
import { Header } from './components/Header';
import { MetricsBanner } from './components/MetricsBanner';
import { EditorWorkspace } from './components/EditorWorkspace';
import { CrushedJsonViewer } from './components/CrushedJsonViewer';
import { ParametricDesigner } from './components/ParametricDesigner';
import { LivePreviewIframe } from './components/LivePreviewIframe';
import { JsAstHarnessLab } from './components/JsAstHarnessLab';
import { ScienceWorkbench } from './components/ScienceWorkbench';
import { OmniCrushPipeline } from './engine/OmniCrushPipeline';
import { OmniCrushRehydrator } from './engine/OmniCrushRehydrator';
import { ParametricEngine } from './engine/ParametricEngine';
import { SAMPLE_TEMPLATES } from './engine/samples';
import { OmniCrushedDocument, ParametricVariable } from './engine/types';

export default function App() {
  const [activeSampleId, setActiveSampleId] = useState<string>('biotech-molecular');
  const [rawHtml, setRawHtml] = useState<string>(SAMPLE_TEMPLATES[0].html);
  const [crushedDoc, setCrushedDoc] = useState<OmniCrushedDocument | null>(null);
  const [activeParameters, setActiveParameters] = useState<ParametricVariable[]>([]);
  const [useHarness, setUseHarness] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'crush' | 'json' | 'parametric' | 'preview' | 'harness' | 'science'>('crush');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const pipeline = useMemo(() => OmniCrushPipeline.getInstance(), []);
  const rehydrator = useMemo(() => OmniCrushRehydrator.getInstance(), []);
  const parametricEngine = useMemo(() => ParametricEngine.getInstance(), []);

  // Crush current rawHtml
  const handleCrush = useCallback((htmlToCrush: string) => {
    setIsProcessing(true);
    try {
      const doc = pipeline.process(htmlToCrush);
      setCrushedDoc(doc);
      setActiveParameters(doc.parametrics);
    } catch (err) {
      console.error('Crush error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [pipeline]);

  // Initial mount crush
  useEffect(() => {
    handleCrush(rawHtml);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Select a preset template
  const handleSelectSample = (sampleId: string) => {
    const found = SAMPLE_TEMPLATES.find((s) => s.id === sampleId);
    if (found) {
      setActiveSampleId(sampleId);
      setRawHtml(found.html);
      handleCrush(found.html);
    }
  };

  // Upload custom HTML
  const handleUploadHtml = (content: string, filename: string) => {
    setActiveSampleId('');
    setRawHtml(content);
    handleCrush(content);
  };

  // Parametric variable mutation
  const handleParameterChange = (id: string, value: any) => {
    setActiveParameters((prev) =>
      prev.map((p) => (p.id === id ? { ...p, currentValue: value } : p))
    );
  };

  // Reset parameters to original defaults
  const handleResetParameters = () => {
    if (crushedDoc) {
      setActiveParameters(
        crushedDoc.parametrics.map((p) => ({ ...p, currentValue: p.defaultValue }))
      );
    }
  };

  // Compute rehydrated HTML dynamically from crushed doc + current parameters
  const rehydratedHtml = useMemo(() => {
    if (!crushedDoc) return rawHtml;
    // Apply parameters
    const customizedDoc = parametricEngine.applyParameters(crushedDoc, activeParameters);
    return rehydrator.rehydrate(customizedDoc, { minified: false, useHarness });
  }, [crushedDoc, activeParameters, useHarness, parametricEngine, rehydrator, rawHtml]);

  // Downloads & Exports
  const handleDownloadJson = () => {
    if (!crushedDoc) return;
    const jsonStr = JSON.stringify(crushedDoc, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnicrush-ast-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([rehydratedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rehydrated-document-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    if (!crushedDoc) return;
    const zip = new JSZip();

    // 1. Crushed JSON AST
    zip.file('omnicrush-ast.json', JSON.stringify(crushedDoc, null, 2));

    // 2. Rehydrated HTML
    zip.file('rehydrated-document.html', rehydratedHtml);

    // 3. Harness script if present
    if (crushedDoc.scripts.length > 0 && crushedDoc.scripts[0].harnessWrapper) {
      zip.file('runtime-harness.js', crushedDoc.scripts[0].harnessWrapper);
    }

    // 4. README documentation
    const readme = `# OmniCrush AST Bundle
Generated: ${new Date().toISOString()}

## Compression & Token Statistics:
- Original Bytes: ${crushedDoc.stats.originalBytes}
- Crushed JSON Bytes: ${crushedDoc.stats.crushedJsonBytes}
- LLM Token Reduction: -${crushedDoc.stats.tokenReductionPercent}%
- Parity Guarantee: 100% Zero-Loss Parity

## Contents:
1. \`omnicrush-ast.json\`: Compact AST object with tokenized tag/attribute dictionaries, CSS declaration table, and chunked CDN import maps.
2. \`rehydrated-document.html\`: Reconstructed standalone single-file HTML document.
3. \`runtime-harness.js\`: Class-based singletons, DOM proxies, and event broker runtime harness.
`;
    zip.file('README.md', readme);

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnicrush-bundle-${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // AI Re-skin action
  const handleApplyAiReskin = async (themePrompt: string, model: string) => {
    if (!crushedDoc) return;
    setIsAiLoading(true);
    try {
      const response = await fetch('/api/gemini/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'reskin',
          model,
          prompt: themePrompt,
          contextData: {
            parametrics: activeParameters,
            cssValues: crushedDoc.css.values.slice(0, 30),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('AI service error');
      }

      const resJson = await response.json();
      if (resJson.data?.updatedParameters) {
        setActiveParameters((prev) =>
          prev.map((param) => {
            const match = resJson.data.updatedParameters.find((p: any) => p.id === param.id);
            return match ? { ...param, currentValue: match.currentValue } : param;
          })
        );
      }
    } catch (err) {
      console.error('AI Re-skin error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // AI Audit action
  const handleRunAiAudit = async (model: string): Promise<string> => {
    if (!crushedDoc) return 'No document loaded';
    setIsAiLoading(true);
    try {
      const response = await fetch('/api/gemini/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'optimize-advice',
          model,
          contextData: {
            stats: crushedDoc.stats,
            dictionariesSummary: {
              tagsCount: crushedDoc.dictionaries.tags.length,
              attrsCount: crushedDoc.dictionaries.attrNames.length,
              cssRulesCount: crushedDoc.css.rules.length,
              cdnPrefixes: crushedDoc.importMaps.flatMap((im) => im.cdnPrefixes),
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to run AI audit');
      }

      const resJson = await response.json();
      return resJson.result || 'No advice generated';
    } catch (err: any) {
      return `Audit error: ${err.message}`;
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-100">
      {/* Top Header */}
      <Header
        activeSampleId={activeSampleId}
        onSelectSample={handleSelectSample}
        onUploadHtml={handleUploadHtml}
        onDownloadJson={handleDownloadJson}
        onDownloadHtml={handleDownloadHtml}
        onDownloadZip={handleDownloadZip}
        isProcessing={isProcessing}
        tokenSavingsPercent={crushedDoc?.stats.tokenReductionPercent || 0}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Live Compression Statistics Banner */}
        <MetricsBanner stats={crushedDoc?.stats || null} />

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto text-xs sm:text-sm font-medium">
            <button
              onClick={() => setActiveTab('crush')}
              className={`px-3 sm:px-4 py-2 rounded-xl flex items-center gap-2 transition ${
                activeTab === 'crush'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileCode2 className="w-4 h-4" />
              Source HTML Editor
            </button>

            <button
              onClick={() => setActiveTab('json')}
              className={`px-3 sm:px-4 py-2 rounded-xl flex items-center gap-2 transition ${
                activeTab === 'json'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileJson className="w-4 h-4 text-cyan-400" />
              Crushed JSON AST
            </button>

            <button
              onClick={() => setActiveTab('parametric')}
              className={`px-3 sm:px-4 py-2 rounded-xl flex items-center gap-2 transition ${
                activeTab === 'parametric'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              Parametric AI Designer
            </button>

            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 sm:px-4 py-2 rounded-xl flex items-center gap-2 transition ${
                activeTab === 'preview'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              Live Preview
            </button>

            <button
              onClick={() => setActiveTab('harness')}
              className={`px-3 sm:px-4 py-2 rounded-xl flex items-center gap-2 transition ${
                activeTab === 'harness'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Cpu className="w-4 h-4 text-indigo-400" />
              JS AST Harness
            </button>

            <button
              onClick={() => setActiveTab('science')}
              className={`px-3 sm:px-4 py-2 rounded-xl flex items-center gap-2 transition ${
                activeTab === 'science'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Dna className="w-4 h-4 text-cyan-300" />
              Science Workbench
            </button>
          </div>
        </div>

        {/* Tab View Content */}
        <div>
          {activeTab === 'crush' && (
            <EditorWorkspace
              rawHtml={rawHtml}
              onChangeHtml={(html) => setRawHtml(html)}
              onCrush={() => handleCrush(rawHtml)}
              onReset={() => {
                const s = SAMPLE_TEMPLATES.find((x) => x.id === activeSampleId) || SAMPLE_TEMPLATES[0];
                setRawHtml(s.html);
                handleCrush(s.html);
              }}
              isProcessing={isProcessing}
            />
          )}

          {activeTab === 'json' && (
            <div className="h-[750px]">
              <CrushedJsonViewer
                crushedDoc={crushedDoc}
                onCopyJson={() => {
                  if (crushedDoc) {
                    navigator.clipboard.writeText(JSON.stringify(crushedDoc, null, 2));
                  }
                }}
                onDownloadJson={handleDownloadJson}
              />
            </div>
          )}

          {activeTab === 'parametric' && (
            <ParametricDesigner
              parameters={activeParameters}
              onParameterChange={handleParameterChange}
              onResetParameters={handleResetParameters}
              onApplyAiReskin={handleApplyAiReskin}
              onRunAiAudit={handleRunAiAudit}
              isAiLoading={isAiLoading}
            />
          )}

          {activeTab === 'preview' && (
            <LivePreviewIframe htmlContent={rehydratedHtml} />
          )}

          {activeTab === 'harness' && (
            <JsAstHarnessLab
              scripts={crushedDoc?.scripts || []}
              useHarness={useHarness}
              onToggleHarness={(enabled) => setUseHarness(enabled)}
            />
          )}

          {activeTab === 'science' && (
            <ScienceWorkbench
              onLoadScientificTemplate={(html) => {
                setRawHtml(html);
                handleCrush(html);
                setActiveTab('preview');
              }}
              isProcessing={isProcessing}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            OmniCrush AST • Domain-Driven HTML/CSS/JS Compression &amp; Parametric Engine
          </div>
          <div className="flex items-center gap-4">
            <span>Powered by Gemini &amp; Acorn AST Engine</span>
            <span>DeepMind Science Workbench Enabled</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
