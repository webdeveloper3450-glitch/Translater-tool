import { IntegrityReport } from '../types';

export function runIntegrityAudit(originalHtml: string, translatedHtml: string): IntegrityReport {
  const warnings: string[] = [];

  // Strip PHP tags first for accurate HTML structure comparison
  const cleanOrig = originalHtml.replace(/<\?(?:php|=)?[\s\S]*?\?>/gi, '');
  const cleanTrans = translatedHtml.replace(/<\?(?:php|=)?[\s\S]*?\?>/gi, '');

  // 1. Tag count and names audit
  const tagRegex = /<\/?([a-zA-Z0-9\-]+)[^>]*>/g;

  function countTags(html: string): Record<string, number> {
    const counts: Record<string, number> = {};
    let match;
    const regex = new RegExp(tagRegex);
    while ((match = regex.exec(html)) !== null) {
      const tag = match[1].toLowerCase();
      // Skip doctype and comments
      if (tag === '!doctype' || tag.startsWith('!--') || tag === 'xml') continue;
      counts[tag] = (counts[tag] || 0) + 1;
    }
    return counts;
  }

  const origTags = countTags(cleanOrig);
  const transTags = countTags(cleanTrans);

  let totalOrigTags = 0;
  for (const count of Object.values(origTags)) totalOrigTags += count;

  let totalTransTags = 0;
  for (const count of Object.values(transTags)) totalTransTags += count;

  // Compare tag differences
  const allTagKeys = new Set([...Object.keys(origTags), ...Object.keys(transTags)]);
  let matchedTagsCount = 0;

  for (const tag of allTagKeys) {
    const origCount = origTags[tag] || 0;
    const transCount = transTags[tag] || 0;
    matchedTagsCount += Math.min(origCount, transCount);

    if (origCount !== transCount) {
      warnings.push(`Tag <${tag}> count difference: Original had ${origCount}, Translated has ${transCount}.`);
    }
  }

  // 2. Class names audit
  function extractClasses(html: string): Set<string> {
    const classSet = new Set<string>();
    const classRegex = /\bclass=(?:["']([^"']*)["']|([^\s>]+))/gi;
    let match;
    while ((match = classRegex.exec(html)) !== null) {
      const classStr = match[1] || match[2] || '';
      for (const cls of classStr.trim().split(/\s+/)) {
        if (cls) classSet.add(cls);
      }
    }
    return classSet;
  }

  const origClasses = extractClasses(cleanOrig);
  const transClasses = extractClasses(cleanTrans);

  let missingClasses = 0;
  for (const cls of origClasses) {
    if (!transClasses.has(cls)) {
      missingClasses++;
    }
  }
  const classesPreserved = missingClasses === 0;
  if (!classesPreserved) {
    warnings.push(`${missingClasses} class names from original HTML were modified or missing.`);
  }

  // 3. IDs audit
  function extractIds(html: string): Set<string> {
    const idSet = new Set<string>();
    const idRegex = /\bid=(?:["']([^"']*)["']|([^\s>]+))/gi;
    let match;
    while ((match = idRegex.exec(html)) !== null) {
      const idVal = match[1] || match[2];
      if (idVal) idSet.add(idVal);
    }
    return idSet;
  }

  const origIds = extractIds(cleanOrig);
  const transIds = extractIds(cleanTrans);

  let missingIds = 0;
  for (const id of origIds) {
    if (!transIds.has(id)) {
      missingIds++;
    }
  }
  const idsPreserved = missingIds === 0;
  if (!idsPreserved) {
    warnings.push(`${missingIds} ID attributes from original HTML were modified or missing.`);
  }

  // 4. Scripts audit
  function countScripts(html: string): number {
    const scriptRegex = /<script\b[^>]*>[\s\S]*?<\/script>/gi;
    return (html.match(scriptRegex) || []).length;
  }

  const origScriptCount = countScripts(cleanOrig);
  const transScriptCount = countScripts(cleanTrans);
  const scriptsPreserved = origScriptCount === transScriptCount;
  if (!scriptsPreserved) {
    warnings.push(`Script tag count variance: Original had ${origScriptCount}, Translated has ${transScriptCount}.`);
  }

  const matchedPercentage = totalOrigTags > 0 
    ? Math.min(100, Math.round((matchedTagsCount / Math.max(totalOrigTags, totalTransTags)) * 100))
    : 100;

  const isIdenticalStructure = warnings.length === 0 && classesPreserved && idsPreserved && scriptsPreserved;

  return {
    isIdenticalStructure,
    tagCountOriginal: totalOrigTags,
    tagCountTranslated: totalTransTags,
    classesPreserved,
    idsPreserved,
    scriptsPreserved,
    matchedPercentage,
    warnings,
  };
}
