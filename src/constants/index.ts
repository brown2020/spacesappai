import type { AIModelOption, SupportedLanguage } from "@/types";

// ============================================================================
// AI MODELS
// ============================================================================

/**
 * Available AI models for document operations
 */
export const AI_MODELS: readonly AIModelOption[] = [
  { label: "GPT-4 Omni", value: "gpt-4o" },
  { label: "Gemini 1.5 Pro", value: "gemini-1.5-pro" },
  { label: "Mistral Large", value: "mistral-large" },
  { label: "Claude 3.5 Sonnet", value: "claude-3-5-sonnet" },
  { label: "LLaMA 3.1 405B", value: "llama-v3p1-405b" },
] as const;

/**
 * Default AI model
 */
export const DEFAULT_AI_MODEL = "gpt-4o" as const;

// ============================================================================
// LANGUAGES
// ============================================================================

/**
 * Supported languages for translation
 */
export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = [
  "english",
  "french",
  "spanish",
  "german",
  "italian",
  "portuguese",
  "chinese",
  "russian",
  "hindi",
  "japanese",
] as const;

/**
 * Language display names
 */
export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  english: "English",
  french: "French",
  spanish: "Spanish",
  german: "German",
  italian: "Italian",
  portuguese: "Portuguese",
  chinese: "Chinese",
  russian: "Russian",
  hindi: "Hindi",
  japanese: "Japanese",
} as const;

// ============================================================================
// AI PROMPTS
// ============================================================================

export const AI_PROMPTS = {
  TRANSLATION: `You are a helpful translation assistant. Your job is to generate a summary of the provided document in the provided language. Without any introduction, provide an answer that is concise, informative, and 100 words or less.`,

  QUESTION_ANSWER: `You are a helpful question and answer assistant. Your job is to generate an answer to the provided question based on the provided document. Without any introduction, provide an answer that is concise, informative, and 100 words or less.`,
} as const;

/**
 * AI processing configuration
 */
export const AI_LIMITS = {
  /** Maximum document length in characters for AI processing */
  MAX_DOCUMENT_LENGTH: 400_000,
  /** Ratio of document to keep from the beginning when truncating */
  TRUNCATION_HEAD_RATIO: 0.7,
  /** Ratio of document to keep from the end when truncating */
  TRUNCATION_TAIL_RATIO: 0.25,
  /** Characters reserved for truncation message */
  TRUNCATION_MESSAGE_RESERVE: 100,
} as const;

// ============================================================================
// FIRESTORE CONSTANTS
// ============================================================================

export const FIRESTORE = {
  /** Maximum documents to process in a single batch operation */
  BATCH_SIZE: 500,
  /** Maximum retry attempts for external API calls */
  MAX_RETRIES: 3,
  /** Base delay in ms for exponential backoff (doubles each retry) */
  RETRY_BASE_DELAY_MS: 100,
} as const;

// ============================================================================
// UI CONSTANTS
// ============================================================================

export const UI = {
  /**
   * Maximum summary response length in words
   */
  MAX_SUMMARY_WORDS: 100,

  /**
   * Liveblocks throttle in ms
   */
  LIVEBLOCKS_THROTTLE: 16,

  /**
   * Toast duration in ms
   */
  TOAST_DURATION: 3000,
} as const;

