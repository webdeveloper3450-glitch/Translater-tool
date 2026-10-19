import React, { useState } from 'react';
import { TranslationOptions } from '../types';
import { 
  Settings, 
  ShieldCheck, 
  Cpu, 
  X, 
  Plus, 
  Trash2, 
  Server, 
  Radio, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Code, 
  SlidersHorizontal,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { testEndpointConnection } from '../utils/customEndpointClient';

interface TranslationOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: TranslationOptions;
  onChange: (options: TranslationOptions) => void;
}

export const TranslationOptionsModal: React.FC<TranslationOptionsModalProps> = ({
  isOpen,
  onClose,
  options,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState<'model' | 'rules'>('model');
  const [newGlossaryTerm, setNewGlossaryTerm] = useState('');
  const [showJsonImporter, setShowJsonImporter] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Endpoint testing state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleAddGlossary = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGlossaryTerm.trim() && !options.glossary.includes(newGlossaryTerm.trim())) {
      onChange({
        ...options,
        glossary: [...options.glossary, newGlossaryTerm.trim()],
      });
      setNewGlossaryTerm('');
    }
  };

  const handleRemoveGlossary = (term: string) => {
    onChange({
      ...options,
      glossary: options.glossary.filter((t) => t !== term),
    });
  };

  const handleApplyVsCodeJson = () => {
    setJsonError(null);
    try {
      const parsed = JSON.parse(jsonInput.trim());
      let foundUrl = '';
      let foundModelId = '';
      let foundName = parsed.name || '';

      if (parsed.models && Array.isArray(parsed.models) && parsed.models.length > 0) {
        const firstModel = parsed.models[0];
        foundModelId = firstModel.id || firstModel.name || '';
        foundUrl = firstModel.url || '';
      } else if (parsed.url || parsed.baseUrl) {
        foundUrl = parsed.url || parsed.baseUrl;
        foundModelId = parsed.model || parsed.modelId || '';
      }

      if (!foundUrl) {
        throw new Error('Could not find a valid "url" in the JSON config.');
      }

      onChange({
        ...options,
        provider: 'custom',
        customEndpoint: {
          ...options.customEndpoint,
          baseUrl: foundUrl,
          modelId: foundModelId || 'Qwen3.8-27B-NVFP4',
          name: foundName || 'Custom Local vLLM',
        },
      });

      setShowJsonImporter(false);
      setJsonInput('');
      setTestResult({
        success: true,
        message: `Imported successfully: ${foundModelId || 'Model'} at ${foundUrl}`,
      });
    } catch (err: any) {
      setJsonError(err.message || 'Invalid JSON format. Please paste a valid VS Code endpoint config.');
    }
  };

  const handleQuickLoadPreset = () => {
    onChange({
      ...options,
      provider: 'custom',
      customEndpoint: {
        baseUrl: 'http://localhost:8000/',
        modelId: 'Qwen3.8-27B-NVFP4',
        apiKey: '',
        connectionMode: 'browser',
        name: 'VLLM1 (Qwen3.8-27B)',
      },
    });
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await testEndpointConnection(options.customEndpoint);
      setTestResult(result);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Failed to connect to endpoint.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Settings & Model Configuration
                {options.provider === 'custom' ? (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    Local vLLM / Custom
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    Gemini Cloud
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">Configure AI provider, local vLLM/Qwen endpoint, and HTML safety rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-800 bg-slate-950/30 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('model')}
            className={`py-3 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'model'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            AI Provider & Local Endpoint
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`py-3 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'rules'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Translation Rules & Safety
          </button>
        </div>

        {/* Tab 1: AI Provider & Custom Endpoint */}
        {activeTab === 'model' && (
          <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-200">
            {/* Provider Selector Cards */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Choose AI Backend
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Custom / Local vLLM Card */}
                <div
                  onClick={() => onChange({ ...options, provider: 'custom' })}
                  className={`p-4 rounded-xl border cursor-pointer transition relative ${
                    options.provider === 'custom'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-100 ring-1 ring-emerald-500/30'
                      : 'border-slate-800 bg-slate-850 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 font-semibold text-xs text-slate-100">
                      <Laptop className="w-4 h-4 text-emerald-400" />
                      <span>Custom / Local Endpoint (vLLM)</span>
                    </div>
                    {options.provider === 'custom' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400"></span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Use your local Qwen3.8-27B, vLLM, Ollama, or any OpenAI-compatible server. 100% Free & private.
                  </p>
                </div>

                {/* Gemini Cloud Card */}
                <div
                  onClick={() => onChange({ ...options, provider: 'gemini' })}
                  className={`p-4 rounded-xl border cursor-pointer transition relative ${
                    options.provider === 'gemini'
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-100 ring-1 ring-indigo-500/30'
                      : 'border-slate-800 bg-slate-850 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 font-semibold text-xs text-slate-100">
                      <Cpu className="w-4 h-4 text-indigo-400" />
                      <span>Google Gemini API (Cloud)</span>
                    </div>
                    {options.provider === 'gemini' && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400"></span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Powered by high-speed Gemini 2.5/3.8 Flash. Built-in cloud fallback.
                  </p>
                </div>
              </div>
            </div>

            {/* Custom Endpoint Configuration Panel */}
            {options.provider === 'custom' && (
              <div className="p-4 rounded-xl border border-slate-700 bg-slate-950/70 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-slate-200">Custom OpenAI / vLLM Endpoint Setup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleQuickLoadPreset}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-[11px] font-medium text-emerald-300 transition"
                      title="Load http://localhost:8000 and Qwen3.8-27B-NVFP4"
                    >
                      Load Qwen (localhost:8000)
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowJsonImporter(!showJsonImporter)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-[11px] font-medium text-indigo-300 flex items-center gap-1 transition"
                    >
                      <Code className="w-3 h-3" />
                      Paste VS Code JSON
                    </button>
                  </div>
                </div>

                {/* VS Code JSON Importer Modal / Box */}
                {showJsonImporter && (
                  <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                      <span>Paste your VS Code Endpoint JSON:</span>
                      <button
                        onClick={() => setShowJsonImporter(false)}
                        className="text-slate-400 hover:text-slate-200 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                    <textarea
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      placeholder={`{\n  "name": "Custom Endpoint 3",\n  "vendor": "customendpoint",\n  "apiType": "chat-completions",\n  "models": [\n    {\n      "id": "Qwen3.8-27B-NVFP4",\n      "url": "http://localhost:8000/"\n    }\n  ]\n}`}
                      rows={5}
                      className="w-full px-3 py-2 bg-slate-950 font-mono text-xs text-emerald-300 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                    {jsonError && (
                      <p className="text-xs text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {jsonError}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={handleApplyVsCodeJson}
                      disabled={!jsonInput.trim()}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition"
                    >
                      Parse & Apply Config
                    </button>
                  </div>
                )}

                {/* Form Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Endpoint Base URL:
                    </label>
                    <input
                      type="text"
                      value={options.customEndpoint.baseUrl}
                      onChange={(e) =>
                        onChange({
                          ...options,
                          customEndpoint: { ...options.customEndpoint, baseUrl: e.target.value },
                        })
                      }
                      placeholder="http://localhost:8000/ or http://localhost:8000/v1"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Works with `/v1/chat/completions` or `/chat/completions`
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Model ID / Name:
                    </label>
                    <input
                      type="text"
                      value={options.customEndpoint.modelId}
                      onChange={(e) =>
                        onChange({
                          ...options,
                          customEndpoint: { ...options.customEndpoint, modelId: e.target.value },
                        })
                      }
                      placeholder="e.g. Qwen3.8-27B-NVFP4 or llama3"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Exact model ID served by your vLLM or Ollama instance
                    </span>
                  </div>
                </div>

                {/* Optional API Key */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    API Key (Optional / if required by your endpoint):
                  </label>
                  <input
                    type="password"
                    value={options.customEndpoint.apiKey || ''}
                    onChange={(e) =>
                      onChange({
                        ...options,
                        customEndpoint: { ...options.customEndpoint, apiKey: e.target.value },
                      })
                    }
                    placeholder="Leave blank for local vLLM / Ollama"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Connection Mode Selection */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <label className="text-[11px] font-semibold text-slate-300 block">
                    Connection Mode:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <label
                      onClick={() =>
                        onChange({
                          ...options,
                          customEndpoint: { ...options.customEndpoint, connectionMode: 'browser' },
                        })
                      }
                      className={`p-2.5 rounded-lg border cursor-pointer transition ${
                        options.customEndpoint.connectionMode === 'browser'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200'
                          : 'border-slate-800 bg-slate-900 hover:border-slate-700 text-slate-400'
                      }`}
                    >
                      <div className="font-semibold text-slate-200 mb-0.5">Direct from Browser</div>
                      <div className="text-[10px] text-slate-400">
                        Browser calls <code className="text-emerald-400">localhost:8000</code> directly. Perfect when using this Web Preview with your local PC.
                      </div>
                    </label>

                    <label
                      onClick={() =>
                        onChange({
                          ...options,
                          customEndpoint: { ...options.customEndpoint, connectionMode: 'proxy' },
                        })
                      }
                      className={`p-2.5 rounded-lg border cursor-pointer transition ${
                        options.customEndpoint.connectionMode === 'proxy'
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-200'
                          : 'border-slate-800 bg-slate-900 hover:border-slate-700 text-slate-400'
                      }`}
                    >
                      <div className="font-semibold text-slate-200 mb-0.5">Via Server Proxy</div>
                      <div className="text-[10px] text-slate-400">
                        Node server proxies requests (ideal when running app locally via <code className="text-indigo-300">npm run dev</code> or via LAN IP).
                      </div>
                    </label>
                  </div>
                </div>

                {/* Test Connection Button & Result */}
                <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting || !options.customEndpoint.baseUrl}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Testing Connection...</span>
                      </>
                    ) : (
                      <>
                        <Radio className="w-3.5 h-3.5" />
                        <span>Test Connection</span>
                      </>
                    )}
                  </button>

                  {testResult && (
                    <div
                      className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 max-w-full ${
                        testResult.success
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      }`}
                    >
                      {testResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span className="truncate">{testResult.message}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Translation Rules & Safety */}
        {activeTab === 'rules' && (
          <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-200">
            {/* Engine Selection */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Translation Mode & Guarantee
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div
                  onClick={() => onChange({ ...options, mode: 'dom-safe' })}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    options.mode === 'dom-safe'
                      ? 'border-emerald-500/80 bg-emerald-500/10 text-emerald-200'
                      : 'border-slate-800 bg-slate-800/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-xs text-slate-100">DOM-Safe Extraction (Recommended)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Extracts only human text nodes, leaving 100% of HTML tags, classes, and IDs completely untouched.
                  </p>
                </div>

                <div
                  onClick={() => onChange({ ...options, mode: 'direct' })}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    options.mode === 'direct'
                      ? 'border-indigo-500/80 bg-indigo-500/10 text-indigo-200'
                      : 'border-slate-800 bg-slate-800/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Cpu className="w-4 h-4 text-indigo-400" />
                    <span className="font-semibold text-xs text-slate-100">Direct Document Translation</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Feeds whole HTML to the model with strict tag-retention directives.
                  </p>
                </div>
              </div>
            </div>

            {/* Tone */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Translation Tone & Voice
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { id: 'standard', label: 'Standard' },
                  { id: 'formal', label: 'Formal' },
                  { id: 'casual', label: 'Casual' },
                  { id: 'marketing', label: 'Marketing' },
                  { id: 'technical', label: 'Technical' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onChange({ ...options, tone: t.id as any })}
                    className={`py-2 px-2.5 rounded-lg text-xs font-medium border text-center transition ${
                      options.tone === t.id
                        ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300 font-semibold'
                        : 'border-slate-800 bg-slate-850 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Content Extraction Rules
              </label>

              <label className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.translateAttributes}
                  onChange={(e) => onChange({ ...options, translateAttributes: e.target.checked })}
                  className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="text-xs font-medium text-slate-200">
                    Translate Human-Readable Attributes & Meta Tags
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Translates <code className="text-indigo-300 font-mono">placeholder</code>, <code className="text-indigo-300 font-mono">alt</code>, <code className="text-indigo-300 font-mono">title</code>, <code className="text-indigo-300 font-mono">&lt;title&gt;</code>, and OpenGraph/Twitter meta tags.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.translateSchema}
                  onChange={(e) => onChange({ ...options, translateSchema: e.target.checked })}
                  className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="text-xs font-medium text-slate-200">
                    Translate Schema.org Structured Data (JSON-LD)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Translates human text fields in <code className="text-indigo-300 font-mono">&lt;script type=&quot;application/ld+json&quot;&gt;</code> while preserving types and URLs.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.autoRtl}
                  onChange={(e) => onChange({ ...options, autoRtl: e.target.checked })}
                  className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="text-xs font-medium text-slate-200">
                    Automatic RTL Layout for Arabic & Hebrew
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Adds <code className="text-indigo-300 font-mono">dir="rtl"</code> to <code className="text-indigo-300 font-mono">&lt;html&gt;</code> tag when translating to Arabic, Hebrew, Persian, or Urdu.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.preserveCodeBlocks}
                  onChange={(e) => onChange({ ...options, preserveCodeBlocks: e.target.checked })}
                  className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="text-xs font-medium text-slate-200">
                    Preserve Code Blocks
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Ignores text inside <code className="text-indigo-300 font-mono">&lt;code&gt;</code>, <code className="text-indigo-300 font-mono">&lt;pre&gt;</code>, and <code className="text-indigo-300 font-mono">&lt;kbd&gt;</code> tags.
                  </div>
                </div>
              </label>
            </div>

            {/* Custom Glossary / Do Not Translate */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Glossary & Brand Preservation (Do Not Translate)
                </label>
              </div>
              <p className="text-[11px] text-slate-400">
                Terms entered here will remain strictly untouched in the output (e.g. brand names, trademarks, product names).
              </p>

              <form onSubmit={handleAddGlossary} className="flex gap-2">
                <input
                  type="text"
                  value={newGlossaryTerm}
                  onChange={(e) => setNewGlossaryTerm(e.target.value)}
                  placeholder="e.g. CloudFlow, AcmeCorp, TurboCharge"
                  className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Term
                </button>
              </form>

              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {options.glossary.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">No glossary terms added yet.</span>
                ) : (
                  options.glossary.map((term) => (
                    <span
                      key={term}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-md text-xs text-slate-300"
                    >
                      <span>{term}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveGlossary(term)}
                        className="text-slate-400 hover:text-rose-400 ml-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            {options.provider === 'custom' ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Using: {options.customEndpoint.modelId || 'Custom Model'} ({options.customEndpoint.connectionMode})
              </span>
            ) : (
              <span className="text-indigo-400 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" />
                Using: Google Gemini Flash (Cloud)
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
