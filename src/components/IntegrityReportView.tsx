import React from 'react';
import { IntegrityReport } from '../types';
import { ShieldCheck, AlertTriangle, CheckCircle, Tag, Hash, FileCode, Cpu } from 'lucide-react';

interface IntegrityReportViewProps {
  report: IntegrityReport;
  engineMode: 'dom-safe' | 'direct';
}

export const IntegrityReportView: React.FC<IntegrityReportViewProps> = ({ report, engineMode }) => {
  return (
    <div className="flex flex-col h-full bg-slate-900 p-6 overflow-y-auto space-y-6">
      {/* Big Status Badge */}
      <div
        className={`p-5 rounded-2xl border flex items-start gap-4 ${
          report.isIdenticalStructure
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
            : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
        }`}
      >
        <div className={`p-3 rounded-xl ${report.isIdenticalStructure ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
          {report.isIdenticalStructure ? <ShieldCheck className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-100">
              {report.isIdenticalStructure
                ? '100% Structural Integrity Verified'
                : 'Structural Discrepancy Detected'}
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
              {report.matchedPercentage}% Match Score
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {report.isIdenticalStructure
              ? 'Every single HTML tag, nested hierarchy, CSS class name, ID selector, attribute, and script block was verified and confirmed 100% untouched.'
              : 'Some tags or attributes exhibited differences. Review the breakdown details below.'}
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="text-slate-400">Current Engine:</span>
            <span className="font-semibold text-indigo-400 bg-slate-950/60 px-2.5 py-0.5 rounded border border-slate-800">
              {engineMode === 'dom-safe' ? 'DOM-Safe Text Extraction Pipeline' : 'Direct AI HTML Translation'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of checks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tags check */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs">
              <Tag className="w-4 h-4 text-indigo-400" />
              <span>HTML Tags</span>
            </div>
            {report.tagCountOriginal === report.tagCountTranslated ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <div className="text-xl font-bold font-mono text-slate-100">
            {report.tagCountTranslated} / {report.tagCountOriginal}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {report.tagCountOriginal === report.tagCountTranslated
              ? 'Exact tag counts matched'
              : 'Tag count variance'}
          </div>
        </div>

        {/* Classes check */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs">
              <Hash className="w-4 h-4 text-indigo-400" />
              <span>CSS Classes</span>
            </div>
            {report.classesPreserved ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {report.classesPreserved ? '100% Intact' : 'Modified'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            All class attributes preserved
          </div>
        </div>

        {/* IDs check */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs">
              <FileCode className="w-4 h-4 text-indigo-400" />
              <span>Element IDs</span>
            </div>
            {report.idsPreserved ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {report.idsPreserved ? '100% Intact' : 'Modified'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            No IDs altered or stripped
          </div>
        </div>

        {/* Scripts check */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Scripts & Styles</span>
            </div>
            {report.scriptsPreserved ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {report.scriptsPreserved ? 'Untouched' : 'Warning'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            JS logic & styles preserved
          </div>
        </div>
      </div>

      {/* Warnings & Notes */}
      {report.warnings.length > 0 ? (
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200">
          <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            Audit Notices
          </h4>
          <ul className="list-disc list-inside space-y-1 text-xs">
            {report.warnings.map((warn, i) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-slate-400 text-xs">
          <p className="flex items-center gap-2 text-emerald-300 font-medium mb-1">
            <CheckCircle className="w-4 h-4" />
            No Structural Anomalies Detected
          </p>
          <p>
            Your translated HTML is ready for production. All original selectors, stylesheet classes, analytics snippets, and frameworks (Tailwind, Bootstrap, etc.) will continue to function exactly as originally built.
          </p>
        </div>
      )}
    </div>
  );
};
