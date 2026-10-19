import React from 'react';
import { Language, TranslationOptions } from '../types';
import { LanguageSelector } from './LanguageSelector';
import { 
  Languages, 
  Settings2, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Loader2 
} from 'lucide-react';

interface HeaderProps {
  selectedLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  onTranslate: () => void;
  isTranslating: boolean;
  canTranslate: boolean;
  onOpenSettings: () => void;
  options: TranslationOptions;
}

export const Header: React.FC<HeaderProps> = ({
  selectedLanguage,
  onSelectLanguage,
  onTranslate,
  isTranslating,
  canTranslate,
  onOpenSettings,
  options,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-40 px-4 py-2.5 shadow-sm">
      <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-400 p-0.5 shadow-md shadow-indigo-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-indigo-400">
              <Languages className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-100 tracking-tight">HTML Translator</h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hidden sm:inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Preserves Tags & Classes
              </span>
            </div>
          </div>
        </div>

        {/* Center: Language Selection */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium hidden md:inline">Translate to:</span>
          <LanguageSelector
            selectedCode={selectedLanguage.code}
            onSelect={onSelectLanguage}
          />

          {/* Active Model & Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            title="Configure AI Model & Translation Settings"
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition ${
              options.provider === 'custom'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                : 'border-slate-800 bg-slate-900 hover:border-slate-700 text-slate-300 hover:text-slate-100'
            }`}
          >
            {options.provider === 'custom' ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="truncate max-w-[120px] text-[11px] font-semibold hidden sm:inline">
                  {options.customEndpoint.modelId || 'Local vLLM'}
                </span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                <span className="text-[11px] font-medium hidden sm:inline">Gemini Cloud</span>
              </>
            )}
            <Settings2 className="w-3.5 h-3.5 ml-0.5 opacity-80" />
            {options.glossary.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            )}
          </button>
        </div>

        {/* Translate Action CTA */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={onTranslate}
            disabled={!canTranslate || isTranslating}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all ${
              !canTranslate
                ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                : isTranslating
                ? 'bg-indigo-700 text-white cursor-wait'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            {isTranslating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Translating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Translate to {selectedLanguage.name}</span>
                <ArrowRight className="w-3 h-3 hidden sm:inline opacity-80" />
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
