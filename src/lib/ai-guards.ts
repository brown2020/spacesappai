/**
 * Pure AI request checks. This module has no path-alias imports so the
 * Node test runner can load it directly.
 */

export const AI_MODEL_NAMES = [
  "gpt-4o",
  "gemini-1.5-pro",
  "mistral-large",
  "claude-3-5-sonnet",
  "llama-v3p1-405b",
] as const;

export const AI_LANGUAGE_NAMES = [
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

export const AI_INPUT_LIMITS = {
  MAX_DOCUMENT_INPUT_LENGTH: 1_000_000,
  MAX_QUESTION_LENGTH: 2_000,
  RATE_LIMIT_WINDOW_MS: 60 * 60 * 1000,
  RATE_LIMIT_MAX_REQUESTS: 20,
} as const;

export type GuardedAiModel = (typeof AI_MODEL_NAMES)[number];
export type GuardedLanguage = (typeof AI_LANGUAGE_NAMES)[number];

const AI_MODEL_SET: ReadonlySet<string> = new Set(AI_MODEL_NAMES);
const AI_LANGUAGE_SET: ReadonlySet<string> = new Set(AI_LANGUAGE_NAMES);

export function isSupportedAiModel(value: unknown): value is GuardedAiModel {
  return typeof value === "string" && AI_MODEL_SET.has(value);
}

export function isSupportedLanguage(value: unknown): value is GuardedLanguage {
  return typeof value === "string" && AI_LANGUAGE_SET.has(value);
}

export function normalizeAiQuestion(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > AI_INPUT_LIMITS.MAX_QUESTION_LENGTH) return null;
  return trimmed;
}

export function isDocumentWithinInputLimit(document: unknown): document is string {
  return (
    typeof document === "string" &&
    document.length > 0 &&
    document.length <= AI_INPUT_LIMITS.MAX_DOCUMENT_INPUT_LENGTH
  );
}

export interface AiWindowState {
  windowStartMs: number;
  count: number;
}

/**
 * Fixed window. A missing or expired window starts a new one at 1.
 * Callers persist `next` only when `allowed` is true.
 */
export function evaluateAiQuota(
  state: AiWindowState | null,
  nowMs: number,
  windowMs: number = AI_INPUT_LIMITS.RATE_LIMIT_WINDOW_MS,
  maxRequests: number = AI_INPUT_LIMITS.RATE_LIMIT_MAX_REQUESTS
): { allowed: boolean; next: AiWindowState } {
  if (
    !state ||
    !Number.isFinite(state.windowStartMs) ||
    !Number.isFinite(state.count) ||
    nowMs - state.windowStartMs >= windowMs
  ) {
    return { allowed: true, next: { windowStartMs: nowMs, count: 1 } };
  }

  if (state.count >= maxRequests) {
    return { allowed: false, next: state };
  }

  return {
    allowed: true,
    next: { windowStartMs: state.windowStartMs, count: state.count + 1 },
  };
}
