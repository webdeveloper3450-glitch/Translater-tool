/**
 * Client-side helper to directly call custom OpenAI/vLLM endpoints from the browser
 * This enables connecting to locally hosted models (http://localhost:8000/) even when
 * running the web UI inside the preview container without server proxy limitations.
 */

import { CustomEndpointConfig } from '../types';

export function normalizeEndpointUrl(baseUrl: string): string {
  const cleanBase = baseUrl.trim().replace(/\/+$/, '');
  if (cleanBase.endsWith('/chat/completions')) {
    return cleanBase;
  }
  return cleanBase.endsWith('/v1')
    ? `${cleanBase}/chat/completions`
    : `${cleanBase}/v1/chat/completions`;
}

export async function testEndpointConnection(
  config: CustomEndpointConfig
): Promise<{ success: boolean; message: string }> {
  if (config.connectionMode === 'proxy') {
    const res = await fetch('/api/test-custom-endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        baseUrl: config.baseUrl,
        modelId: config.modelId,
        apiKey: config.apiKey,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Server proxy failed to reach endpoint.');
    }
    return { success: true, message: data.message || 'Connected successfully!' };
  } else {
    // Direct from browser
    const url = normalizeEndpointUrl(config.baseUrl);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (config.apiKey && config.apiKey.trim()) {
      headers['Authorization'] = `Bearer ${config.apiKey.trim()}`;
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: config.modelId,
          messages: [{ role: 'user', content: 'Say "Endpoint Connected" to confirm.' }],
          temperature: 0.1,
          max_tokens: 50,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content || 'Connected successfully!';
      return { success: true, message: content.trim() };
    } catch (err: any) {
      if (err.message && err.message.includes('Failed to fetch')) {
        throw new Error(
          `Browser cannot reach ${config.baseUrl}. Make sure vLLM is running and allows CORS (e.g. --allowed-origins "*"), or switch to "Via Server Proxy" when running this app locally.`
        );
      }
      throw err;
    }
  }
}

/**
 * Direct browser translation of segments
 */
export async function directBrowserTranslateSegments(
  segments: { id: string; text: string }[],
  targetLanguage: string,
  config: CustomEndpointConfig,
  sourceLanguage?: string,
  tone?: string,
  glossary?: string[]
): Promise<{ id: string; translatedText: string }[]> {
  const url = normalizeEndpointUrl(config.baseUrl);

  const glossaryInstruction = glossary && glossary.length > 0
    ? `Do not translate the following brand names or terms, keep them exact: ${glossary.join(', ')}.`
    : '';

  const toneInstruction = tone && tone !== 'standard'
    ? `Adopt a ${tone} tone in the translation.`
    : 'Use an accurate, fluent, and culturally appropriate tone.';

  const sourceInstruction = sourceLanguage && sourceLanguage !== 'auto'
    ? `Source language is ${sourceLanguage}.`
    : 'Auto-detect source language.';

  const systemInstruction = `You are a high-speed, professional web content translator.
Your task is to translate an input JSON object mapping string IDs to text values into ${targetLanguage}.
${sourceInstruction}
${toneInstruction}
${glossaryInstruction}

STRICT RULES:
1. Output MUST be a valid JSON object where every key from the input is mapped to its translated text in ${targetLanguage}.
2. Example input: {"txt_0": "Welcome", "txt_1": "Sign in"}
3. Example output: {"txt_0": "translated_text", "txt_1": "translated_text"}
4. If a string contains inline HTML tags (e.g. <ul>, <ol>, <li>, <strong>, <b>, <a>, <p>, <span>), translate ONLY the human text content inside, keeping all HTML tags and formatting intact.
5. If text contains placeholder tokens like __PHP_TOKEN_0__, leave them exactly untouched.
6. Preserve formatting codes, currency symbols, and numbers accurately.
7. Translate ONLY linguistic content to ${targetLanguage}. Never drop or skip any key.
8. Return only the JSON object, no explanation.`;

  // Process in batches of 50
  const BATCH_SIZE = 50;
  const results: { id: string; translatedText: string }[] = [];

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (config.apiKey && config.apiKey.trim()) {
    headers['Authorization'] = `Bearer ${config.apiKey.trim()}`;
  }

  for (let i = 0; i < segments.length; i += BATCH_SIZE) {
    const chunk = segments.slice(i, i + BATCH_SIZE);
    const inputMap: Record<string, string> = {};
    for (const item of chunk) {
      inputMap[item.id] = item.text;
    }

    const prompt = `Translate this JSON dictionary into ${targetLanguage}:\n${JSON.stringify(inputMap)}`;

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: config.modelId,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Custom model error: HTTP ${res.status} - ${errText}`);
    }

    const data = await res.json();
    const rawContent = data?.choices?.[0]?.message?.content || '{}';
    const cleaned = rawContent.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    try {
      const parsed = JSON.parse(cleaned);
      for (const item of chunk) {
        results.push({
          id: item.id,
          translatedText: typeof parsed[item.id] === 'string' ? parsed[item.id] : item.text,
        });
      }
    } catch {
      for (const item of chunk) {
        results.push({ id: item.id, translatedText: item.text });
      }
    }
  }

  return results;
}

/**
 * Direct browser translation of whole HTML document
 */
export async function directBrowserTranslateHtml(
  html: string,
  targetLanguage: string,
  config: CustomEndpointConfig,
  sourceLanguage?: string,
  tone?: string,
  glossary?: string[]
): Promise<string> {
  const url = normalizeEndpointUrl(config.baseUrl);

  const glossaryInstruction = glossary && glossary.length > 0
    ? `Do not translate these specific terms: ${glossary.join(', ')}.`
    : '';

  const systemInstruction = `You are an expert HTML localization engineer.
CRITICAL MANDATORY INSTRUCTIONS:
1. Translate all visible human text and content in the provided HTML into ${targetLanguage}.
2. NEVER modify, add, or delete any HTML tags, doctype, comments, or structure.
3. NEVER change, translate, or modify any class names, IDs, inline style attributes, src, href, action, method, data-* attributes, or JavaScript code.
4. Keep all class="..." and id="..." exactly 100% identical to the source HTML.
5. You may translate human-readable text inside attributes like alt="..." or placeholder="..." if appropriate.
6. Return ONLY the complete translated HTML string with no markdown code fences, no backticks, no explanations.
${glossaryInstruction}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (config.apiKey && config.apiKey.trim()) {
    headers['Authorization'] = `Bearer ${config.apiKey.trim()}`;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: config.modelId,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: html },
      ],
      temperature: 0.1,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Custom model error: HTTP ${res.status} - ${errText}`);
  }

  const data = await res.json();
  let rawContent = data?.choices?.[0]?.message?.content || '';
  if (rawContent.startsWith('```html')) {
    rawContent = rawContent.replace(/^```html\s*\n?/, '').replace(/\n?```\s*$/, '');
  } else if (rawContent.startsWith('```')) {
    rawContent = rawContent.replace(/^```\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  return rawContent;
}
