import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone, Split, RotateCw, ExternalLink } from 'lucide-react';

interface LivePreviewProps {
  originalHtml: string;
  translatedHtml: string;
  targetLangName: string;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  originalHtml,
  translatedHtml,
  targetLangName,
}) => {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isSplitCompare, setIsSplitCompare] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile':
        return 'max-w-[375px]';
      case 'tablet':
        return 'max-w-[768px]';
      default:
        return 'w-full';
    }
  };

  const preparePreviewHtml = (html: string) => {
    if (!html) return '';
    const script = `<script>
(function() {
  try {
    var _f = window.fetch;
    Object.defineProperty(window, 'fetch', {
      get: function() { return _f; },
      set: function(v) { _f = v; },
      configurable: true,
      enumerable: true
    });
    if (typeof Window !== 'undefined' && Window.prototype) {
      try {
        Object.defineProperty(Window.prototype, 'fetch', {
          get: function() { return _f; },
          set: function(v) { _f = v; },
          configurable: true,
          enumerable: true
        });
      } catch (e) {}
    }
  } catch (e) {}
})();
<\/script>`;
    if (html.includes('<head>')) {
      return html.replace('<head>', `<head>${script}`);
    } else if (html.includes('<html')) {
      return html.replace(/<html[^>]*>/, `$&<head>${script}</head>`);
    }
    return `${script}${html}`;
  };

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setViewport('desktop')}
            className={`p-1.5 rounded-lg text-xs transition ${
              viewport === 'desktop' ? 'bg-indigo-600 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Desktop View"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewport('tablet')}
            className={`p-1.5 rounded-lg text-xs transition ${
              viewport === 'tablet' ? 'bg-indigo-600 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Tablet View (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewport('mobile')}
            className={`p-1.5 rounded-lg text-xs transition ${
              viewport === 'mobile' ? 'bg-indigo-600 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Mobile View (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Side-by-side compare button */}
          <button
            type="button"
            onClick={() => setIsSplitCompare(!isSplitCompare)}
            className={`px-2.5 py-1 text-xs rounded-lg border flex items-center gap-1.5 transition ${
              isSplitCompare
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 font-medium'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>{isSplitCompare ? 'Single View' : 'Side-by-Side Compare'}</span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            title="Reload Preview"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Render Area */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-900/40">
        {isSplitCompare ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full h-full">
            {/* Original Render */}
            <div className="flex flex-col h-full bg-white rounded-xl shadow-lg overflow-hidden border border-slate-700">
              <div className="bg-slate-800 text-slate-200 text-xs px-3 py-1.5 font-semibold flex items-center justify-between">
                <span>Original English HTML</span>
                <span className="text-[10px] text-slate-400">Sandbox</span>
              </div>
              <iframe
                key={`orig-${iframeKey}`}
                srcDoc={preparePreviewHtml(originalHtml)}
                title="Original HTML Preview"
                sandbox="allow-scripts allow-same-origin"
                className="w-full flex-1 border-0 bg-white"
              />
            </div>

            {/* Translated Render */}
            <div className="flex flex-col h-full bg-white rounded-xl shadow-lg overflow-hidden border border-slate-700">
              <div className="bg-indigo-950 text-indigo-200 text-xs px-3 py-1.5 font-semibold flex items-center justify-between border-b border-indigo-800">
                <span>Translated ({targetLangName})</span>
                <span className="text-[10px] text-indigo-300">Live Render</span>
              </div>
              <iframe
                key={`trans-${iframeKey}`}
                srcDoc={preparePreviewHtml(translatedHtml)}
                title="Translated HTML Preview"
                sandbox="allow-scripts allow-same-origin"
                className="w-full flex-1 border-0 bg-white"
              />
            </div>
          </div>
        ) : (
          <div className={`${getViewportWidth()} h-full transition-all duration-300 bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-700 flex flex-col`}>
            <iframe
              key={`single-${iframeKey}`}
              srcDoc={preparePreviewHtml(translatedHtml)}
              title="Translated HTML Preview"
              sandbox="allow-scripts allow-same-origin"
              className="w-full flex-1 border-0 bg-white"
            />
          </div>
        )}
      </div>
    </div>
  );
};
