import React, { useRef, useState, useEffect } from 'react';
import { SAMPLE_TEMPLATES, SampleTemplate } from '../data/sampleTemplates';
import { 
  FileCode, 
  Upload, 
  Trash2, 
  Sparkles, 
  FileText, 
  Copy, 
  Check, 
  ChevronDown,
  Layers
} from 'lucide-react';

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  detectedLang?: string;
  onDetectLanguage?: () => void;
  isDetecting?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  detectedLang,
  onDetectLanguage,
  isDetecting,
}) => {
  const [copied, setCopied] = useState(false);
  const [showSamples, setShowSamples] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const samplesDropdownRef = useRef<HTMLDivElement>(null);

  // Sync line numbers scroll with textarea scroll
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Close samples dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (samplesDropdownRef.current && !samplesDropdownRef.current.contains(e.target as Node)) {
        setShowSamples(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const lines = value ? value.split('\n') : [''];
  const charCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const tagCount = (value.match(/<[a-z0-9]+/gi) || []).length;

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        onChange(text || '');
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        onChange(text || '');
      };
      reader.readAsText(file);
    }
  };

  return (
    <div
      className={`flex flex-col h-full min-h-0 bg-slate-900 border rounded-2xl overflow-hidden transition-all duration-200 ${
        isDragging ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-800'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header bar */}
      <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between gap-2 select-none shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-800 rounded-lg text-indigo-400">
            <FileCode className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Source HTML</span>
            <span className="ml-2 text-[11px] text-slate-400 font-mono">
              ({lines.length} lines • {tagCount} tags)
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Detected Language pill */}
          {detectedLang && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Lang: <strong className="text-indigo-300">{detectedLang}</strong>
            </span>
          )}

          {/* Load Sample dropdown */}
          <div className="relative" ref={samplesDropdownRef}>
            <button
              type="button"
              onClick={() => setShowSamples(!showSamples)}
              className="px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-800 hover:text-white border border-slate-700/80 rounded-lg flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Load Sample</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showSamples && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-40 p-1.5 text-xs">
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Preset Templates
                </div>
                {SAMPLE_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => {
                      onChange(tmpl.html);
                      setShowSamples(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-slate-200 transition"
                  >
                    <div className="font-semibold text-indigo-300">{tmpl.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{tmpl.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Upload file */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".html,.htm,.txt"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Upload .html file"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>

          {/* Copy original */}
          {value && (
            <button
              type="button"
              onClick={handleCopy}
              title="Copy original code"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Clear */}
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              title="Clear code"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Editor Main with Line Numbers */}
      <div className="relative flex-1 min-h-0 flex overflow-hidden font-mono text-xs">
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

        {/* Textarea filling 100% full height */}
        <div className="relative flex-1 h-full min-h-0 overflow-hidden">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            placeholder={`<!-- Paste your complete HTML code here -->\n<!DOCTYPE html>\n<html>\n  <head>\n    <title>Hello World</title>\n  </head>\n  <body class="bg-blue-50">\n    <h1 id="header">Welcome to our website</h1>\n    <p class="lead">All tags, classes and IDs will remain 100% untouched.</p>\n  </body>\n</html>`}
            spellCheck={false}
            className="absolute inset-0 w-full h-full py-3 px-4 bg-transparent text-slate-100 placeholder-slate-600 resize-none focus:outline-none font-mono leading-relaxed overflow-auto selection:bg-indigo-600/40"
          />

          {/* Empty state drag & drop banner */}
          {!value && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center text-slate-500">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-3">
                <FileCode className="w-6 h-6 text-indigo-400" />
              </div>
              <p className="text-sm font-medium text-slate-300 mb-1">
                Paste your HTML code here or drag & drop a file
              </p>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                Supports full HTML documents or components. All tags, classes, and IDs are preserved intact.
              </p>
              <div className="pointer-events-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onChange(SAMPLE_TEMPLATES[0].html)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium hover:bg-indigo-600/30 transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Try SaaS Landing Page
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer statistics */}
      <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono shrink-0">
        <div>
          <span>{charCount} characters</span>
          <span className="mx-2">•</span>
          <span>{wordCount} words</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <span>UTF-8 HTML</span>
        </div>
      </div>
    </div>
  );
};
