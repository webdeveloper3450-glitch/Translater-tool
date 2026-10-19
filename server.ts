import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Google GenAI client with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Candidate models in priority order for ultra-fast response and high-availability fallback
const FAST_MODELS = [
  'gemini-flash-latest',
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
];

/**
 * Call custom OpenAI-compatible endpoint (vLLM, Ollama, LM Studio, etc.)
 */
async function callCustomEndpoint(
  baseUrl: string,
  modelId: string,
  apiKey: string | undefined,
  messages: { role: string; content: string }[],
  isJson: boolean = true
): Promise<string> {
  const cleanBase = baseUrl.trim().replace(/\/+$/, '');
  let endpoint = cleanBase;
  if (!cleanBase.endsWith('/chat/completions')) {
    endpoint = cleanBase.endsWith('/v1')
      ? `${cleanBase}/chat/completions`
      : `${cleanBase}/v1/chat/completions`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey && apiKey.trim()) {
    headers['Authorization'] = `Bearer ${apiKey.trim()}`;
  }

  const makePayload = (withJson: boolean) => {
    const payload: any = {
      model: modelId,
      messages,
      temperature: 0.1,
    };
    if (withJson) {
      payload['response_format'] = { type: 'json_object' };
    }
    return payload;
  };

  const executeRequest = async (targetUrl: string, withJson: boolean) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout for local LLMs
    try {
      return await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(makePayload(withJson)),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  };

  let res: globalThis.Response;
  try {
    res = await executeRequest(endpoint, isJson);
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error(`Custom endpoint request timed out after 90s (${modelId} at ${endpoint}).`);
    }
    const isConnRefused = err?.message?.includes('fetch failed') || err?.code === 'ECONNREFUSED' || err?.message?.includes('ECONNREFUSED');
    if (isConnRefused) {
      throw new Error(
        `Unable to reach ${endpoint}. If your vLLM server is running on your local computer (localhost:8000) and you are using this cloud preview, the cloud server cannot reach your personal localhost. Please switch Connection Mode to "Direct Browser" in settings or run this app locally via 'npm run dev'.`
      );
    }
    throw err;
  }

  // Fallback to /chat/completions if /v1/chat/completions returned 404
  if (res.status === 404 && endpoint.includes('/v1/chat/completions')) {
    const fallbackEndpoint = cleanBase.replace(/\/v1$/, '') + '/chat/completions';
    try {
      res = await executeRequest(fallbackEndpoint, isJson);
    } catch (e) {
      // keep original res
    }
  }

  // If status 400 and we sent json_object response_format, retry without response_format
  if (res.status === 400 && isJson) {
    const errorBody = await res.clone().text().catch(() => '');
    if (errorBody.includes('response_format') || errorBody.includes('json_object') || errorBody.includes('guided')) {
      res = await executeRequest(endpoint, false);
    }
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Custom endpoint error (${modelId}): HTTP ${res.status} ${res.statusText} - ${errorText}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || '';
  return content;
}

/**
 * Resilient generation with automatic retry and model fallback for Gemini.
 */
async function generateWithResilience(
  contents: string,
  systemInstruction: string,
  responseMimeType: string = 'application/json'
): Promise<string> {
  let lastError: any = null;

  for (const model of FAST_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            responseMimeType,
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
            temperature: 0.1,
          },
        });

        if (response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || '';
        const isHighDemand =
          err?.status === 503 ||
          err?.code === 503 ||
          errMsg.includes('503') ||
          errMsg.includes('high demand') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('RESOURCE_EXHAUSTED');

        if (isHighDemand && attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 200));
          continue;
        }
        break;
      }
    }
  }

  const rawMsg = lastError?.message || 'Translation service temporarily unavailable.';
  try {
    const parsed = JSON.parse(rawMsg);
    if (parsed.error && parsed.error.message) {
      throw new Error(parsed.error.message);
    }
  } catch (e) {
    // not json
  }
  throw new Error(rawMsg);
}

// Test Custom OpenAI-compatible Endpoint
app.post('/api/test-custom-endpoint', async (req: Request, res: Response) => {
  try {
    const { baseUrl, modelId, apiKey } = req.body;
    if (!baseUrl || !modelId) {
      return res.status(400).json({ error: 'Base URL and Model ID are required.' });
    }

    const response = await callCustomEndpoint(
      baseUrl,
      modelId,
      apiKey,
      [{ role: 'user', content: 'Say "Endpoint Connected" to confirm.' }],
      false
    );

    return res.json({
      success: true,
      message: response.trim(),
      modelId,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message || 'Failed to connect to custom endpoint. Ensure the server is reachable.',
    });
  }
});

// Translation API endpoint: Batch Segments
app.post('/api/translate-segments', async (req: Request, res: Response) => {
  try {
    const { segments, targetLanguage, sourceLanguage, tone, glossary, provider, customEndpoint } = req.body;

    if (!segments || !Array.isArray(segments) || segments.length === 0) {
      return res.status(400).json({ error: 'No segments provided for translation.' });
    }

    if (!targetLanguage) {
      return res.status(400).json({ error: 'Target language is required.' });
    }

    if (provider !== 'custom' && !process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check the Secrets panel.',
      });
    }

    // Process segments in chunks of up to 60 items
    const CHUNK_SIZE = 60;
    const chunkPromises = [];

    for (let i = 0; i < segments.length; i += CHUNK_SIZE) {
      const chunk = segments.slice(i, i + CHUNK_SIZE);
      chunkPromises.push(
        translateSegmentChunk(chunk, targetLanguage, sourceLanguage, tone, glossary, provider, customEndpoint)
      );
    }

    const chunkResults = await Promise.all(chunkPromises);
    const combinedTranslations = chunkResults.flat();

    return res.json({
      success: true,
      translations: combinedTranslations,
      targetLanguage,
      totalSegments: segments.length,
    });
  } catch (error: any) {
    console.error('Translation error:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred during translation.',
    });
  }
});

async function translateSegmentChunk(
  chunk: { id: string; text: string }[],
  targetLanguage: string,
  sourceLanguage?: string,
  tone?: string,
  glossary?: string[],
  provider?: string,
  customEndpoint?: { baseUrl: string; modelId: string; apiKey?: string }
): Promise<{ id: string; translatedText: string }[]> {
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

  // Build compact key-value map
  const inputMap: Record<string, string> = {};
  for (const item of chunk) {
    inputMap[item.id] = item.text;
  }

  const prompt = `Translate this JSON dictionary into ${targetLanguage}:\n${JSON.stringify(inputMap)}`;

  let rawJson = '';

  if (provider === 'custom' && customEndpoint?.baseUrl && customEndpoint?.modelId) {
    // Custom OpenAI / vLLM Endpoint
    rawJson = await callCustomEndpoint(
      customEndpoint.baseUrl,
      customEndpoint.modelId,
      customEndpoint.apiKey,
      [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt },
      ],
      true
    );
  } else {
    // Default Gemini Cloud API
    rawJson = await generateWithResilience(prompt, systemInstruction, 'application/json');
  }

  try {
    const cleaned = rawJson.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    return chunk.map((item) => ({
      id: item.id,
      translatedText: typeof parsed[item.id] === 'string' ? parsed[item.id] : item.text,
    }));
  } catch (err) {
    console.warn('Failed to parse translated dictionary JSON, raw text was:', rawJson);
    return chunk.map((item) => ({ id: item.id, translatedText: item.text }));
  }
}

// Direct HTML translation endpoint
app.post('/api/translate-direct-html', async (req: Request, res: Response) => {
  try {
    const { html, targetLanguage, sourceLanguage, tone, glossary, provider, customEndpoint } = req.body;

    if (!html || typeof html !== 'string') {
      return res.status(400).json({ error: 'HTML code is required.' });
    }

    if (!targetLanguage) {
      return res.status(400).json({ error: 'Target language is required.' });
    }

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
6. For Arabic or Hebrew (RTL), you can set dir="rtl" on <html> or <body dir="rtl"> if not already present.
7. Return ONLY the complete translated HTML string with no markdown code fences, no backticks, no explanations.
${glossaryInstruction}`;

    let rawOutput = '';

    if (provider === 'custom' && customEndpoint?.baseUrl && customEndpoint?.modelId) {
      rawOutput = await callCustomEndpoint(
        customEndpoint.baseUrl,
        customEndpoint.modelId,
        customEndpoint.apiKey,
        [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: html },
        ],
        false
      );
    } else {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY is not configured on the server. Please check the Secrets panel.',
        });
      }
      rawOutput = await generateWithResilience(html, systemInstruction, 'text/plain');
    }

    let translatedHtml = rawOutput || '';
    if (translatedHtml.startsWith('```html')) {
      translatedHtml = translatedHtml.replace(/^```html\s*\n?/, '').replace(/\n?```\s*$/, '');
    } else if (translatedHtml.startsWith('```')) {
      translatedHtml = translatedHtml.replace(/^```\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    return res.json({
      success: true,
      translatedHtml,
      targetLanguage,
    });
  } catch (error: any) {
    console.error('Direct translation error:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred during HTML translation.',
    });
  }
});

// Detect language endpoint
app.post('/api/detect-language', async (req: Request, res: Response) => {
  try {
    const { sampleText } = req.body;
    if (!sampleText) {
      return res.status(400).json({ error: 'Text sample required' });
    }

    const systemInstruction = 'Identify the dominant human language. Return JSON with language name (e.g., "English") and ISO code (e.g., "en").';
    const rawJson = await generateWithResilience(
      `Detect language: "${sampleText.slice(0, 400)}"`,
      systemInstruction,
      'application/json'
    );

    const parsed = JSON.parse(rawJson);
    return res.json(parsed);
  } catch (error: any) {
    return res.json({ language: 'Arabic', code: 'ar' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
