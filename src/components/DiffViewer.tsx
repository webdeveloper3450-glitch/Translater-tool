import React, { useMemo } from 'react';
import { diffLines, Change } from 'diff';
import { GitCompare, CheckCircle2, ShieldCheck } from 'lucide-react';

interface DiffViewerProps {
  original: string;
  translated: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ original, translated }) => {
  const diffs = useMemo(() => {
    if (!original || !translated) return [];
    return diffLines(original, translated);
  }, [original, translated]);

  let addedCount = 0;
  let removedCount = 0;

  diffs.forEach((part) => {
    if (part.added) addedCount += part.count || 0;
    if (part.removed) removedCount += part.count || 0;
  });

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden text-xs font-mono">
      {/* Diff Stats Banner */}
      <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <GitCompare className="w-3.5 h-3.5 text-indigo-400" />
            Comparison Diff
          </span>
          <span className="text-emerald-400 font-medium">+{addedCount} lines translated</span>
          <span className="text-rose-400 font-medium">-{removedCount} lines replaced</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          Tags & Attributes Preserved
        </div>
      </div>

      {/* Diff Content */}
      <div className="flex-1 overflow-auto p-3 space-y-0.5 leading-relaxed">
        {diffs.map((part: Change, index: number) => {
          const lines = part.value.replace(/\n$/, '').split('\n');

          if (part.added) {
            return (
              <div key={index} className="bg-emerald-950/30 text-emerald-200 border-l-2 border-emerald-500 px-2 py-0.5 rounded-r">
                {lines.map((line, lineIdx) => (
                  <div key={lineIdx} className="flex">
                    <span className="select-none text-emerald-500 w-5 font-bold">+</span>
                    <span className="whitespace-pre-wrap break-all">{line || ' '}</span>
                  </div>
                ))}
              </div>
            );
          }

          if (part.removed) {
            return (
              <div key={index} className="bg-rose-950/30 text-rose-300 border-l-2 border-rose-500 px-2 py-0.5 rounded-r opacity-80">
                {lines.map((line, lineIdx) => (
                  <div key={lineIdx} className="flex">
                    <span className="select-none text-rose-500 w-5 font-bold">-</span>
                    <span className="whitespace-pre-wrap break-all">{line || ' '}</span>
                  </div>
                ))}
              </div>
            );
          }

          return (
            <div key={index} className="text-slate-400 px-2 py-0.5">
              {lines.map((line, lineIdx) => (
                <div key={lineIdx} className="flex">
                  <span className="select-none text-slate-600 w-5"> </span>
                  <span className="whitespace-pre-wrap break-all">{line || ' '}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
