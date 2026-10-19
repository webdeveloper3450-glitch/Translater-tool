import { TranslationOptions } from '../types';
import { maskTemplateTags, unmaskTemplateTags, MaskedTemplateResult } from './templateMasker';

export interface SchemaHolder {
  obj: any;
  key: string | number;
  element: Element;
  rootSchema: any;
}

export interface ExtractedSegment {
  id: string;
  type: 'text' | 'attribute' | 'schema';
  text: string;
  leadingWs: string;
  trailingWs: string;
  node?: Node;
  element?: Element;
  attrName?: string;
  schemaHolder?: SchemaHolder;
}

export interface ExtractedDomData {
  isFullDocument: boolean;
  doctype: string;
  doc: Document;
  container?: HTMLElement;
  segments: ExtractedSegment[];
  schemaRoots: Map<Element, any>;
  maskResult: MaskedTemplateResult;
}

// Common Schema.org text fields that represent human readable content to translate
const TRANSLATABLE_SCHEMA_KEYS = new Set([
  'name',
  'description',
  'headline',
  'alternativeHeadline',
  'articleBody',
  'reviewBody',
  'text',
  'caption',
  'about',
  'abstract',
  'disambiguatingDescription',
  'keywords',
  'jobTitle',
  'award',
  'slogan',
  'serviceType',
  'category',
  'recipeYield',
  'recipeCategory',
  'recipeCuisine',
  'question',
  'answer',
]);

/**
 * Extracts translatable text from HTML/PHP templates including document title,
 * meta tags, attributes, and Schema.org JSON-LD structured data.
 */
export function extractTranslatableSegments(
  rawHtml: string,
  options: TranslationOptions
): ExtractedDomData {
  // Step 1: Mask server-side PHP tags and separate preamble/postamble
  const maskResult = maskTemplateTags(rawHtml);
  const htmlToParse = maskResult.maskedHtml;

  const isFullDoc = /<!doctype/i.test(htmlToParse) || /<html[\s>]/i.test(htmlToParse);
  let doctype = '';

  const doctypeMatch = htmlToParse.match(/<!DOCTYPE[^>]*>/i);
  if (doctypeMatch) {
    doctype = doctypeMatch[0] + '\n';
  }

  const parser = new DOMParser();
  let doc: Document;
  let container: HTMLElement | undefined;

  if (isFullDoc) {
    doc = parser.parseFromString(htmlToParse, 'text/html');
  } else {
    doc = parser.parseFromString(
      `<!DOCTYPE html><html><body><div id="__translator_root__">${htmlToParse}</div></body></html>`,
      'text/html'
    );
    container = doc.getElementById('__translator_root__') || undefined;
  }

  const segments: ExtractedSegment[] = [];
  const schemaRoots = new Map<Element, any>();
  let segmentCounter = 0;

  const rootNode: Node = container || doc.documentElement;

  function shouldSkipElement(el: Element): boolean {
    const tagName = el.tagName.toUpperCase();
    if (['STYLE', 'NOSCRIPT', 'SVG', 'CANVAS', 'OBJECT'].includes(tagName)) {
      return true;
    }
    // Allow <script type="application/ld+json"> for Schema.org, skip standard scripts
    if (tagName === 'SCRIPT') {
      const type = el.getAttribute('type')?.toLowerCase();
      if (type !== 'application/ld+json') {
        return true;
      }
    }
    if (options.preserveCodeBlocks && ['CODE', 'PRE', 'KBD', 'SAMP'].includes(tagName)) {
      return true;
    }
    return false;
  }

  function extractSchemaRecursive(obj: any, element: Element, rootSchema: any) {
    if (!obj || typeof obj !== 'object') return;

    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        if (typeof item === 'string') {
          if (item.trim().length > 0 && !item.startsWith('__PHP_TOKEN_')) {
            segments.push({
              id: `schema_${segmentCounter++}`,
              type: 'schema',
              text: item.trim(),
              leadingWs: '',
              trailingWs: '',
              element,
              schemaHolder: { obj, key: index, element, rootSchema },
            });
          }
        } else if (typeof item === 'object') {
          extractSchemaRecursive(item, element, rootSchema);
        }
      });
      return;
    }

    for (const key of Object.keys(obj)) {
      const val = obj[key];

      // Update inLanguage field directly to target code
      if (key === 'inLanguage' && typeof val === 'string') {
        obj[key] = options.targetLanguageCode;
        continue;
      }

      // Skip technical schema keys like @context, @type, @id, url, image, etc.
      if (
        key.startsWith('@') ||
        key === 'url' ||
        key === 'image' ||
        key === 'sku' ||
        key === 'price' ||
        key === 'priceCurrency' ||
        key === 'position' ||
        key === 'item' ||
        key === 'datePublished' ||
        key === 'dateModified'
      ) {
        continue;
      }

      if (typeof val === 'string' && val.trim().length > 0) {
        // Only extract if it's not a pure PHP token
        if (!val.startsWith('__PHP_TOKEN_') && (TRANSLATABLE_SCHEMA_KEYS.has(key) || key === 'question' || key === 'answer')) {
          segments.push({
            id: `schema_${segmentCounter++}`,
            type: 'schema',
            text: val.trim(),
            leadingWs: '',
            trailingWs: '',
            element,
            schemaHolder: { obj, key, element, rootSchema },
          });
        }
      } else if (typeof val === 'object' && val !== null) {
        extractSchemaRecursive(val, element, rootSchema);
      }
    }
  }

  function walk(node: Node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const tagName = el.tagName.toUpperCase();

      if (shouldSkipElement(el)) {
        return;
      }

      // 1. Schema.org JSON-LD Structured Data
      if (tagName === 'SCRIPT' && options.translateSchema) {
        const type = el.getAttribute('type')?.toLowerCase();
        if (type === 'application/ld+json') {
          try {
            const rawJson = el.textContent || '';
            if (rawJson.trim().length > 0) {
              const parsed = JSON.parse(rawJson);
              schemaRoots.set(el, parsed);
              extractSchemaRecursive(parsed, el, parsed);
            }
          } catch (e) {
            console.warn('Could not parse Schema.org JSON-LD:', e);
          }
          return; // Do not parse script body as DOM nodes
        }
      }

      // 2. Meta tags (Description, OpenGraph, Twitter, Keywords, etc.)
      if (tagName === 'META' && options.translateAttributes) {
        const name = el.getAttribute('name')?.toLowerCase();
        const property = el.getAttribute('property')?.toLowerCase();
        const itemprop = el.getAttribute('itemprop')?.toLowerCase();

        const translatableMetaNames = [
          'description',
          'keywords',
          'abstract',
          'summary',
          'og:title',
          'og:description',
          'og:site_name',
          'og:image:alt',
          'twitter:title',
          'twitter:description',
          'twitter:image:alt',
        ];

        const matchesMeta =
          (name && translatableMetaNames.includes(name)) ||
          (property && translatableMetaNames.includes(property)) ||
          (itemprop && ['name', 'description'].includes(itemprop));

        if (matchesMeta) {
          const content = el.getAttribute('content');
          if (content && content.trim().length > 0 && !content.startsWith('__PHP_TOKEN_')) {
            segments.push({
              id: `meta_${segmentCounter++}`,
              type: 'attribute',
              text: content.trim(),
              leadingWs: '',
              trailingWs: '',
              element: el,
              attrName: 'content',
            });
          }
        }
      }

      // 3. Form Input Buttons & Submit Values
      if (tagName === 'INPUT' && options.translateAttributes) {
        const type = el.getAttribute('type')?.toLowerCase();
        if (type === 'submit' || type === 'button' || type === 'reset') {
          const val = el.getAttribute('value');
          if (val && val.trim().length > 0 && !val.startsWith('__PHP_TOKEN_')) {
            segments.push({
              id: `attr_${segmentCounter++}`,
              type: 'attribute',
              text: val.trim(),
              leadingWs: '',
              trailingWs: '',
              element: el,
              attrName: 'value',
            });
          }
        }
      }

      // 4. Human-readable attributes (placeholder, alt, title, aria-label, etc.)
      if (options.translateAttributes) {
        const translatableAttrs = [
          'placeholder',
          'alt',
          'title',
          'aria-label',
          'aria-description',
          'aria-placeholder',
        ];
        for (const attr of translatableAttrs) {
          const val = el.getAttribute(attr);
          if (val && val.trim().length > 0 && !val.startsWith('__PHP_TOKEN_')) {
            const trimmed = val.trim();
            segments.push({
              id: `attr_${segmentCounter++}`,
              type: 'attribute',
              text: trimmed,
              leadingWs: '',
              trailingWs: '',
              element: el,
              attrName: attr,
            });
          }
        }
      }
    }

    // 5. Text Nodes (including <title>, <h1>, <p>, <span>, <a>, <li>, buttons, labels)
    if (node.nodeType === Node.TEXT_NODE) {
      const parent = node.parentElement;
      if (!parent || !shouldSkipElement(parent)) {
        const text = node.textContent || '';
        // Skip text node if it is purely a PHP token or whitespace
        if (text.trim().length > 0 && !text.trim().match(/^__PHP_TOKEN_\d+__$/)) {
          const leadingMatch = text.match(/^(\s*)/);
          const trailingMatch = text.match(/(\s*)$/);
          const leadingWs = leadingMatch ? leadingMatch[1] : '';
          const trailingWs = trailingMatch ? trailingMatch[1] : '';
          const trimmed = text.trim();

          segments.push({
            id: `text_${segmentCounter++}`,
            type: 'text',
            text: trimmed,
            leadingWs,
            trailingWs,
            node,
          });
        }
      }
    }

    // Traverse children
    let child = node.firstChild;
    while (child) {
      walk(child);
      child = child.nextSibling;
    }
  }

  walk(rootNode);

  return {
    isFullDocument: isFullDoc,
    doctype,
    doc,
    container,
    segments,
    schemaRoots,
    maskResult,
  };
}

/**
 * Re-injects translated strings back into text nodes, attributes, and Schema.org JSON-LD,
 * then unmasks all PHP and server-side templating tags.
 */
export function reconstructHtml(
  domData: ExtractedDomData,
  translations: { id: string; translatedText: string }[],
  options: TranslationOptions
): string {
  const translationMap = new Map<string, string>();
  for (const item of translations) {
    translationMap.set(item.id, item.translatedText);
  }

  // Inject translations back
  for (const seg of domData.segments) {
    const translated = translationMap.get(seg.id);
    if (translated === undefined) continue;

    if (seg.type === 'text' && seg.node) {
      seg.node.textContent = `${seg.leadingWs}${translated}${seg.trailingWs}`;
    } else if (seg.type === 'attribute' && seg.element && seg.attrName) {
      seg.element.setAttribute(seg.attrName, translated);
    } else if (seg.type === 'schema' && seg.schemaHolder) {
      const { obj, key } = seg.schemaHolder;
      obj[key] = translated;
    }
  }

  // Serialize updated Schema.org JSON-LD scripts
  for (const [element, rootSchema] of domData.schemaRoots.entries()) {
    element.textContent = '\n' + JSON.stringify(rootSchema, null, 4) + '\n    ';
  }

  // Handle RTL and lang attribute
  const isRtl =
    options.targetLanguageCode === 'ar' ||
    options.targetLanguageCode === 'he' ||
    options.targetLanguageCode === 'fa' ||
    options.targetLanguageCode === 'ur';

  let serializedHtml = '';

  if (domData.isFullDocument) {
    const htmlEl = domData.doc.documentElement;

    if (options.autoRtl) {
      if (isRtl) {
        htmlEl.setAttribute('dir', 'rtl');
      } else {
        htmlEl.removeAttribute('dir');
      }
    }

    if (options.targetLanguageCode) {
      htmlEl.setAttribute('lang', options.targetLanguageCode);
    }

    serializedHtml = `${domData.doctype}${htmlEl.outerHTML}`;
  } else if (domData.container) {
    if (options.autoRtl) {
      const firstEl = domData.container.firstElementChild;
      if (firstEl) {
        if (isRtl) {
          firstEl.setAttribute('dir', 'rtl');
        } else {
          firstEl.removeAttribute('dir');
        }
      }
    }
    serializedHtml = domData.container.innerHTML;
  } else {
    serializedHtml = domData.doc.body.innerHTML;
  }

  // Step 4: Unmask PHP tokens and re-attach preamble and postamble
  const finalOutput = unmaskTemplateTags(
    serializedHtml,
    domData.maskResult.phpTokens,
    domData.maskResult.preamble,
    domData.maskResult.postamble,
    options.targetLanguageCode
  );

  return finalOutput;
}
