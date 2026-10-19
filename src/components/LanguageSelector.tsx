import React, { useState, useRef, useEffect } from 'react';
import { LANGUAGES, POPULAR_LANGUAGES } from '../data/languages';
import { Language } from '../types';
import { Search, ChevronDown, Check, Globe } from 'lucide-react';

interface LanguageSelectorProps {
  selectedCode: string;
  onSelect: (lang: Language) => void;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedCode,
  onSelect,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLang = LANGUAGES.find((l) => l.code === selectedCode) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLanguages = LANGUAGES.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.nativeName.toLowerCase().includes(search.toLowerCase()) ||
    l.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3.5 py-2 bg-slate-900 border border-slate-700/80 hover:border-indigo-500 rounded-xl text-sm font-medium text-slate-100 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
      >
        <span className="text-base">{selectedLang.flag}</span>
        <span className="font-semibold text-slate-200">{selectedLang.name}</span>
        <span className="text-xs text-slate-400 font-normal">({selectedLang.nativeName})</span>
        {selectedLang.isRtl && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            RTL
          </span>
        )}
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-96 animate-in fade-in zoom-in-95 duration-150">
          <div className="p-2.5 border-b border-slate-800 bg-slate-950/60 sticky top-0">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search language or code..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-850 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                autoFocus
              />
            </div>
            
            {/* Quick chips for prompt's primary languages */}
            <div className="flex flex-wrap gap-1 mt-2">
              {POPULAR_LANGUAGES.map((code) => {
                const lang = LANGUAGES.find((l) => l.code === code);
                if (!lang) return null;
                const isSelected = selectedCode === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      onSelect(lang);
                      setIsOpen(false);
                    }}
                    className={`text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1 transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="overflow-y-auto p-1 divide-y divide-slate-800/40">
            {filteredLanguages.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No matching languages found
              </div>
            ) : (
              filteredLanguages.map((lang) => {
                const isSelected = lang.code === selectedCode;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      onSelect(lang);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs transition ${
                      isSelected
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-medium'
                        : 'text-slate-200 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{lang.flag}</span>
                      <div>
                        <div className="font-medium">{lang.name}</div>
                        <div className="text-[11px] text-slate-400">{lang.nativeName}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {lang.isRtl && (
                        <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300">RTL</span>
                      )}
                      <span className="text-[10px] uppercase font-mono text-slate-400">{lang.code}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
