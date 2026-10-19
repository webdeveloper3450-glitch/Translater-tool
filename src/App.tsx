/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { CodeEditor } from './components/CodeEditor';
import { OutputViewer } from './components/OutputViewer';
import { TranslationOptionsModal } from './components/TranslationOptionsModal';
import { LANGUAGES } from './data/languages';
import { SAMPLE_TEMPLATES } from './data/sampleTemplates';
import { Language, TranslationOptions, TranslationResult } from './types';
import { extractTranslatableSegments, reconstructHtml } from './utils/domTranslator';
import { runIntegrityAudit } from './utils/integrityAudit';
import { directBrowserTranslateSegments, directBrowserTranslateHtml } from './utils/customEndpointClient';
import { AlertCircle, X, ShieldCheck, Check, Sparkles, RotateCw, GripVertical } from 'lucide-react';

export default function App() {
  const [inputHtml, setInputHtml] = useState<string>(SAMPLE_TEMPLATES[0].html);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(LANGUAGES[0]); // Russian
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [detectedLang, setDetectedLang] = useState<string>('Arabic');

  // Slidable Splitter State
  const [splitPercent, setSplitPercent] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Monitor window resize for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Draggable Splitter Event Listeners
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const offset = clientX - rect.left;
      const pct = (offset / rect.width) * 100;
      // Clamp between 20% and 80% for optimal usability
      if (pct >= 20 && pct <= 80) {
        setSplitPercent(pct);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX);
      }
    };

    const onPointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onPointerUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onPointerUp);
    };
  }, [isDragging]);

  // Translation options with persistence
  const [options, setOptions] = useState<TranslationOptions>(() => {
    const saved = localStorage.getItem('html_translator_options');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          customEndpoint: {
            baseUrl: parsed.customEndpoint?.baseUrl || 'http://localhost:8000/',
            modelId: parsed.customEndpoint?.modelId || 'Qwen3.8-27B-NVFP4',
            apiKey: parsed.customEndpoint?.apiKey || '',
            connectionMode: parsed.customEndpoint?.connectionMode || 'browser',
            name: parsed.customEndpoint?.name || 'VLLM1 (Qwen3.8-27B)',
          },
        };
      } catch (e) {}
    }
    return {
      targetLanguage: LANGUAGES[0].name,
      targetLanguageCode: LANGUAGES[0].code,
      sourceLanguage: 'auto',
      mode: 'dom-safe',
      translateAttributes: true,
      translateSchema: true,
      preserveCodeBlocks: true,
      autoRtl: true,
      tone: 'standard',
      glossary: [],
      provider: 'custom',
      customEndpoint: {
        baseUrl: 'http://localhost:8000/',
        modelId: 'Qwen3.8-27B-NVFP4',
        apiKey: '',
        connectionMode: 'browser',
        name: 'VLLM1 (Qwen3.8-27B)',
      },
    };
  });

  // Save options to localStorage
  const handleUpdateOptions = (newOptions: TranslationOptions) => {
    setOptions(newOptions);
    try {
      localStorage.setItem('html_translator_options', JSON.stringify(newOptions));
    } catch (e) {}
  };

  // Results cache per language code to allow seamless instant switching
  const [resultsCache, setResultsCache] = useState<Record<string, TranslationResult>>({});

  // Sync selectedLanguage changes with options
  const handleSelectLanguage = (lang: Language) => {
    setSelectedLanguage(lang);
    setOptions((prev) => {
      const updated = {
        ...prev,
        targetLanguage: lang.name,
        targetLanguageCode: lang.code,
      };
      try {
        localStorage.setItem('html_translator_options', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleTranslate = async () => {
    if (!inputHtml.trim()) return;

    setIsTranslating(true);
    setErrorMessage(null);
    const startTime = performance.now();

    try {
      const currentTarget = selectedLanguage.name;
      const currentCode = selectedLanguage.code;

      if (options.mode === 'dom-safe') {
        // Step 1: Client DOM Extraction (with PHP masking and schema extraction)
        const domData = extractTranslatableSegments(inputHtml, options);

        if (domData.segments.length === 0) {
          const durationMs = Math.round(performance.now() - startTime);
          const audit = runIntegrityAudit(inputHtml, inputHtml);
          const result: TranslationResult = {
            translatedHtml: inputHtml,
            targetLanguage: currentTarget,
            targetLanguageCode: currentCode,
            durationMs,
            segmentsCount: 0,
            integrityReport: audit,
            timestamp: Date.now(),
          };
          setResultsCache((prev) => ({ ...prev, [currentCode]: result }));
          setIsTranslating(false);
          return;
        }

        // Format segments for translation
        const payloadSegments = domData.segments.map((seg) => ({
          id: seg.id,
          text: seg.text,
        }));

        let translatedSegments: { id: string; translatedText: string }[] = [];

        // Step 2: Route either direct from browser or via server proxy
        if (options.provider === 'custom' && options.customEndpoint.connectionMode === 'browser') {
          // Direct browser request to local vLLM / endpoint
          translatedSegments = await directBrowserTranslateSegments(
            payloadSegments,
            currentTarget,
            options.customEndpoint,
            options.sourceLanguage,
            options.tone,
            options.glossary
          );
        } else {
          // Send to Express server route (handles Gemini or Server Proxy for custom endpoint)
          const response = await fetch('/api/translate-segments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              segments: payloadSegments,
              targetLanguage: currentTarget,
              sourceLanguage: options.sourceLanguage,
              tone: options.tone,
              glossary: options.glossary,
              provider: options.provider,
              customEndpoint: options.customEndpoint,
            }),
          });

          const data = await response.json();
          if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to translate content segments');
          }
          translatedSegments = data.translations;
        }

        // Step 3: Reconstruct HTML with translated text nodes & unmask PHP
        const finalHtml = reconstructHtml(domData, translatedSegments, options);

        // Step 4: Run integrity audit
        const audit = runIntegrityAudit(inputHtml, finalHtml);
        const durationMs = Math.round(performance.now() - startTime);

        const result: TranslationResult = {
          translatedHtml: finalHtml,
          targetLanguage: currentTarget,
          targetLanguageCode: currentCode,
          durationMs,
          segmentsCount: domData.segments.length,
          integrityReport: audit,
          timestamp: Date.now(),
        };

        setResultsCache((prev) => ({ ...prev, [currentCode]: result }));
      } else {
        // Direct AI translation mode
        let finalHtml = '';

        if (options.provider === 'custom' && options.customEndpoint.connectionMode === 'browser') {
          finalHtml = await directBrowserTranslateHtml(
            inputHtml,
            currentTarget,
            options.customEndpoint,
            options.sourceLanguage,
            options.tone,
            options.glossary
          );
        } else {
          const response = await fetch('/api/translate-direct-html', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              html: inputHtml,
              targetLanguage: currentTarget,
              sourceLanguage: options.sourceLanguage,
              tone: options.tone,
              glossary: options.glossary,
              provider: options.provider,
              customEndpoint: options.customEndpoint,
            }),
          });

          const data = await response.json();
          if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to translate HTML');
          }
          finalHtml = data.translatedHtml;
        }

        const audit = runIntegrityAudit(inputHtml, finalHtml);
        const durationMs = Math.round(performance.now() - startTime);

        const result: TranslationResult = {
          translatedHtml: finalHtml,
          targetLanguage: currentTarget,
          targetLanguageCode: currentCode,
          durationMs,
          segmentsCount: 0,
          integrityReport: audit,
          timestamp: Date.now(),
        };

        setResultsCache((prev) => ({ ...prev, [currentCode]: result }));
      }
    } catch (err: any) {
      console.error('Translation failed:', err);
      let cleanMsg = err.message || 'Translation failed. Please try again.';
      try {
        const parsed = JSON.parse(cleanMsg);
        if (parsed?.error?.message) {
          cleanMsg = parsed.error.message;
        }
      } catch (e) {}

      if (cleanMsg.includes('503') || cleanMsg.includes('high demand') || cleanMsg.includes('UNAVAILABLE')) {
        cleanMsg = 'The AI model is experiencing a temporary demand spike. Click Retry to continue.';
      }
      setErrorMessage(cleanMsg);
    } finally {
      setIsTranslating(false);
    }
  };

  // Get current active result for selected language
  const currentResult = resultsCache[selectedLanguage.code] || null;

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Streamlined Top Header */}
      <Header
        selectedLanguage={selectedLanguage}
        onSelectLanguage={handleSelectLanguage}
        onTranslate={handleTranslate}
        isTranslating={isTranslating}
        canTranslate={Boolean(inputHtml.trim())}
        onOpenSettings={() => setIsSettingsOpen(true)}
        options={options}
      />

      {/* Error notification banner if any */}
      {errorMessage && (
        <div className="bg-rose-950/70 border-b border-rose-500/40 px-6 py-2.5 flex items-center justify-between text-rose-200 text-xs animate-in fade-in shrink-0">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTranslate}
              disabled={isTranslating}
              className="px-3 py-1 bg-rose-800 hover:bg-rose-700 text-white rounded-lg font-semibold flex items-center gap-1.5 transition text-xs shadow-sm"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isTranslating ? 'animate-spin' : ''}`} />
              <span>Retry Now</span>
            </button>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace: Resizable Slidable Split Panels */}
      <main className="flex-1 min-h-0 p-2 sm:p-3 overflow-hidden flex flex-col">
        <div
          ref={containerRef}
          className="flex-1 min-h-0 relative flex flex-col lg:flex-row h-full w-full overflow-hidden"
        >
          {/* Left Panel: Input Original HTML */}
          <div
            className="h-full min-h-0 shrink-0 w-full lg:w-auto flex flex-col"
            style={{
              width: isDesktop ? `calc(${splitPercent}% - 6px)` : '100%',
            }}
          >
            <CodeEditor
              value={inputHtml}
              onChange={(val) => {
                setInputHtml(val);
                if (resultsCache[selectedLanguage.code]) {
                  setResultsCache((prev) => {
                    const updated = { ...prev };
                    delete updated[selectedLanguage.code];
                    return updated;
                  });
                }
              }}
              detectedLang={detectedLang}
            />
          </div>

          {/* Slidable Divider with Handle */}
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onTouchStart={() => setIsDragging(true)}
            onDoubleClick={() => setSplitPercent(50)}
            title="Drag to resize panels (Double-click to reset 50/50)"
            className={`hidden lg:flex items-center justify-center w-3 -mx-0.5 cursor-col-resize group relative z-30 transition-colors ${
              isDragging ? 'bg-indigo-600/30' : 'hover:bg-indigo-500/20'
            }`}
          >
            <div
              className={`w-1 rounded-full flex items-center justify-center transition-all ${
                isDragging
                  ? 'bg-indigo-500 w-1.5 h-16 shadow-lg shadow-indigo-500/50'
                  : 'bg-slate-800 h-10 group-hover:bg-indigo-400 group-hover:h-14'
              }`}
            >
              <GripVertical className="w-3 h-3 text-slate-300 opacity-60" />
            </div>
          </div>

          {/* Right Panel: Output Translated HTML */}
          <div
            className="h-full min-h-0 shrink-0 w-full lg:w-auto mt-2 lg:mt-0 flex flex-col"
            style={{
              width: isDesktop ? `calc(${100 - splitPercent}% - 6px)` : '100%',
            }}
          >
            <OutputViewer
              originalHtml={inputHtml}
              result={currentResult}
              isLoading={isTranslating}
              options={options}
              targetLangName={selectedLanguage.name}
            />
          </div>

          {/* Fullscreen drag overlay to prevent iframes capturing pointer events */}
          {isDragging && (
            <div className="fixed inset-0 z-50 cursor-col-resize select-none pointer-events-auto bg-transparent" />
          )}
        </div>
      </main>

      {/* Settings Modal */}
      <TranslationOptionsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        options={options}
        onChange={handleUpdateOptions}
      />
    </div>
  );
}
