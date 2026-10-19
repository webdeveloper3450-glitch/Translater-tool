export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isRtl?: boolean;
}

export interface CustomEndpointConfig {
  baseUrl: string;
  modelId: string;
  apiKey?: string;
  connectionMode: 'proxy' | 'browser';
  name?: string;
}

export interface TranslationOptions {
  targetLanguage: string;
  targetLanguageCode: string;
  sourceLanguage: string;
  mode: 'dom-safe' | 'direct';
  translateAttributes: boolean;
  translateSchema: boolean;
  preserveCodeBlocks: boolean;
  autoRtl: boolean;
  tone: 'standard' | 'formal' | 'casual' | 'marketing' | 'technical';
  glossary: string[];
  provider: 'gemini' | 'custom';
  customEndpoint: CustomEndpointConfig;
}

export interface IntegrityReport {
  isIdenticalStructure: boolean;
  tagCountOriginal: number;
  tagCountTranslated: number;
  classesPreserved: boolean;
  idsPreserved: boolean;
  scriptsPreserved: boolean;
  matchedPercentage: number;
  warnings: string[];
}

export interface TranslationResult {
  translatedHtml: string;
  targetLanguage: string;
  targetLanguageCode: string;
  durationMs: number;
  segmentsCount: number;
  integrityReport: IntegrityReport;
  timestamp: number;
}
