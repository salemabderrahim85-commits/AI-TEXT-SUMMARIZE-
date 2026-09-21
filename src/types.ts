export type SummaryFormat = 'paragraph' | 'bullets' | 'executive' | 'tldr';
export type SummaryLength = 'short' | 'medium' | 'detailed';
export type SummaryTone = 'neutral' | 'professional' | 'casual' | 'academic' | 'simple';
export type SummaryLanguage = 'auto' | 'fr' | 'en' | 'es' | 'de' | 'ar';

export interface SummarizeRequest {
  text: string;
  format?: SummaryFormat;
  length?: SummaryLength;
  tone?: SummaryTone;
  language?: SummaryLanguage;
}

export interface SummaryStats {
  originalWords: number;
  originalChars: number;
  summaryWords: number;
  summaryChars: number;
  reductionPercent: number;
  timeSavedSeconds: number;
}

export interface SummarizeResult {
  title: string;
  summary: string;
  keyTakeaways: string[];
  keywords: string[];
  stats: SummaryStats;
  format: SummaryFormat;
  length: SummaryLength;
  tone: SummaryTone;
  language: SummaryLanguage;
  timestamp: number;
}
