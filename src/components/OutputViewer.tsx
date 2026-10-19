import React, { useState, useRef } from 'react';
import { TranslationResult, TranslationOptions } from '../types';
import { DiffViewer } from './DiffViewer';
import { LivePreview } from './LivePreview';
import { 
  Copy, 
  Check, 
  Download, 
  Code2, 
  Eye, 
  GitCompare, 
  ShieldCheck, 
  Clock, 
  Maximize2, 
  Minimize2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface OutputViewerProps {
  originalHtml: string;
  result: TranslationResult | null;
  isLoading: boolean;
  options: TranslationOptions;
  targetLangName: string;
}

export const OutputViewer: React.FC<OutputViewerProps> = ({
  originalHtml,
  result,
  isLoading,
  options,
  targetLangName,
}) => {
  const [activeTab, setActiveTab] = useState<'code' | 'preview' | 'diff'>('code');
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const translatedHtml = result?.translatedHtml || '';
  const lines = translatedHtml ? translatedHtml.split('\n') : [''];
  const charCount = translatedHtml.length;
  const wordCount = translatedHtml.trim() ? translatedHtml.trim().split(/\s+/).length : 0;

  const handleCopy = () => {
    if (!translatedHtml) return;
    navigator.clipboard.writeText(translatedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!translatedHtml) return;
    const blob = new Blob([translatedHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translated_${result?.targetLanguageCode || 'code'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div
      className={`flex flex-col h-full min-h-0 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-200 ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl ring-1 ring-slate-700' : ''
      }`}
    >
      {/* Clean Top Bar */}
      <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-2 select-none shrink-0">
        {/* Simple Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'code'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            disabled={!translatedHtml}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              !translatedHtml
                ? 'opacity-40 cursor-not-allowed text-slate-500'
                : activeTab === 'preview'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('diff')}
            disabled={!translatedHtml}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              !translatedHtml
                ? 'opacity-40 cursor-not-allowed text-slate-500'
                : activeTab === 'diff'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Diff</span>
          </button>
        </div>

        {/* Clear Primary Copy Action & Download */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!translatedHtml || isLoading}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition ${
              !translatedHtml
                ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                : copied
                ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-500/50'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>

          {translatedHtml && (
            <button
              type="button"
              onClick={handleDownload}
              title="Download as .html"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Body Area */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-xs z-30 p-6 text-center">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mb-3 animate-spin">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-100 mb-1">Translating to {targetLangName}...</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              All HTML tags, CSS classes, IDs, and PHP code are preserved.
            </p>
          </div>
        ) : null}

        {/* Tab 1: Code View */}
        {activeTab === 'code' && (
          <div className="relative flex-1 min-h-0 flex h-full font-mono text-xs overflow-hidden">
            {translatedHtml ? (
              <>
                {/* Line Numbers Gutter */}
                <div
                  ref={lineNumbersRef}
                  className="select-none w-12 py-3 px-2 bg-slate-950/40 text-slate-600 text-right font-mono overflow-hidden border-r border-slate-800/80 leading-relaxed pointer-events-none shrink-0"
                >
                  {lines.map((_, i) => (
                    <div key={i} className="h-5">
                      {i + 1}
                    </div>
                  ))}
                </div>

                {/* Read-only output textarea with select-all ability */}
                <div className="relative flex-1 h-full min-h-0 overflow-hidden">
                  <textarea
                    ref={textareaRef}
                    value={translatedHtml}
                    readOnly
                    onScroll={handleScroll}
                    spellCheck={false}
                    className="absolute inset-0 w-full h-full py-3 px-4 bg-transparent text-emerald-200 placeholder-slate-600 resize-none focus:outline-none font-mono leading-relaxed overflow-auto selection:bg-indigo-600/40"
                  />
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-500">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-3">
                  <Code2 className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-sm font-semibold text-slate-200 mb-1">
                  Ready to Translate into {targetLangName}
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mb-4">
                  1. Paste your HTML or PHP on the left<br />
                  2. Choose your language above<br />
                  3. Click <strong className="text-indigo-400">Translate</strong> to get copyable code
                </p>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tags, classes, and IDs are 100% untouched.</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Live Render Preview */}
        {activeTab === 'preview' && translatedHtml && (
          <LivePreview
            originalHtml={originalHtml}
            translatedHtml={translatedHtml}
            targetLangName={targetLangName}
          />
        )}

        {/* Tab 3: Diff View */}
        {activeTab === 'diff' && translatedHtml && (
          <DiffViewer original={originalHtml} translated={translatedHtml} />
        )}
      </div>

      {/* Clean Footer bar with minimal stats */}
      <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono shrink-0">
        <div>
          <span>{charCount} chars</span>
          <span className="mx-2">•</span>
          <span>{lines.length} lines</span>
          {result && (
            <>
              <span className="mx-2">•</span>
              <span className="text-indigo-300">{(result.durationMs / 1000).toFixed(1)}s</span>
            </>
          )}
        </div>
        <div>
          {result?.integrityReport && (
            <span className="text-emerald-400 flex items-center gap-1 font-sans font-medium text-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Tags Preserved
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
