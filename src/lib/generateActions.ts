"use server";

import { createStreamableValue } from "@ai-sdk/rsc";
import { streamText, type ModelMessage } from "ai";
import { createOpenAI, openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { mistral } from "@ai-sdk/mistral";
import { anthropic } from "@ai-sdk/anthropic";
import { AI_PROMPTS, AI_LIMITS } from "@/constants";
import { consumeAiQuota } from "@/lib/ai-quota";
import {
  isSupportedAiModel,
  isSupportedLanguage,
  normalizeAiQuestion,
} from "@/lib/ai-guards";
import { errorResponse } from "@/lib/action-utils";
import { isUnauthorizedError, requireAuthenticatedUser } from "@/lib/firebase-session";
import { getUserRoomRef } from "@/lib/firestore-helpers";
import type { AIModelName, ActionResponse } from "@/types";

// ============================================================================
// DOCUMENT PROCESSING HELPERS
// ============================================================================

/**
 * Truncate a document intelligently, keeping the beginning and end
 * with a clear message about what was truncated
 */
function truncateDocument(document: string, maxLength: number): string {
  if (document.length <= maxLength) {
    return document;
  }

  // Reserve space for the truncation message
  const availableForContent = Math.max(0, maxLength - AI_LIMITS.TRUNCATION_MESSAGE_RESERVE);

  // Calculate how much to keep from head and tail
  const headLength = Math.floor(availableForContent * AI_LIMITS.TRUNCATION_HEAD_RATIO);
  const tailLength = Math.floor(availableForContent * AI_LIMITS.TRUNCATION_TAIL_RATIO);

  // Guard: if head + tail would exceed document length, just slice from start
  if (headLength + tailLength >= document.length) {
    return document.slice(0, maxLength);
  }

  const head = document.slice(0, headLength);
  const tail = document.slice(-tailLength);

  const truncatedChars = document.length - headLength - tailLength;
  const truncationMessage = `\n\n[... ${truncatedChars.toLocaleString()} characters truncated for AI processing ...]\n\n`;

  return head + truncationMessage + tail;
}

/**
 * Validate and prepare document for AI processing
 * Returns the processed document or an error response
 */
function prepareDocument(document: string): { document: string } | ActionResponse {
  if (typeof document !== "string" || document.length === 0) {
    return errorResponse("VALIDATION_ERROR", "Document content is required");
  }
  if (document.length > AI_LIMITS.MAX_DOCUMENT_INPUT_LENGTH) {
    return errorResponse("VALIDATION_ERROR", "Document is too large to send to AI.");
  }

  const processedDocument = truncateDocument(document, AI_LIMITS.MAX_DOCUMENT_LENGTH);

  return { document: processedDocument };
}

function isValidRoomId(roomId: string): boolean {
  return typeof roomId === "string" && roomId.length > 0 && roomId.length <= 128 && !roomId.includes("/");
}

/**
 * AI calls require an editor or owner on the room, a known model, and quota.
 */
async function authorizeAiRequest(
  roomId: string,
  modelName: unknown
): Promise<{ model: AIModelName; uid: string } | ActionResponse> {
  const user = await requireAuthenticatedUser();

  if (!isValidRoomId(roomId)) {
    return errorResponse("VALIDATION_ERROR", "A document id is required.");
  }

  if (!isSupportedAiModel(modelName)) {
    return errorResponse("VALIDATION_ERROR", "Unsupported model.");
  }

  const roomSnap = await getUserRoomRef(user.uid, roomId).get();
  const role = roomSnap.data()?.role;
  if (!roomSnap.exists || (role !== "owner" && role !== "editor")) {
    return errorResponse("FORBIDDEN", "You don't have permission to use AI on this document.");
  }

  return { model: modelName, uid: user.uid };
}

async function consumeAuthorizedQuota(uid: string): Promise<ActionResponse | null> {
  const allowed = await consumeAiQuota(uid);
  if (allowed) return null;
  return errorResponse(
    "RATE_LIMITED",
    "Too many AI requests. Try again in a little while."
  );
}

// ============================================================================
// AI PROVIDER CONFIGURATION
// ============================================================================

/**
 * Fireworks AI provider for open-source models
 */
function getFireworks() {
  const apiKey = process.env.FIREWORKS_API_KEY;
  if (!apiKey) {
    throw new Error("FIREWORKS_API_KEY is not configured");
  }
  return createOpenAI({
    apiKey,
    baseURL: "https://api.fireworks.ai/inference/v1",
  });
}

// ============================================================================
// MODEL RESOLUTION
// ============================================================================

/**
 * Model mapping for each provider
 */
const MODEL_MAP = {
  "gpt-4o": () => openai("gpt-4o"),
  "gemini-1.5-pro": () => google("gemini-1.5-pro-latest"),
  "mistral-large": () => mistral("mistral-large-latest"),
  "claude-3-5-sonnet": () => anthropic("claude-3-5-sonnet-latest"),
  "llama-v3p1-405b": () =>
    getFireworks()("accounts/fireworks/models/llama-v3p1-405b-instruct"),
} as const;

/**
 * Get the AI model instance for a given model name
 */
function getModel(modelName: AIModelName) {
  if (!Object.prototype.hasOwnProperty.call(MODEL_MAP, modelName)) {
    throw new Error(`Unsupported model: ${modelName}`);
  }
  return MODEL_MAP[modelName]();
}

// ============================================================================
// STREAMING RESPONSE HELPER
// ============================================================================

/**
 * Generate a streaming AI response
 * Note: Auth is verified by the caller before invoking this function
 * Note: AbortSignal cannot be passed from client to server actions as it's not serializable.
 * Cancellation is handled client-side by ignoring the stream response.
 */
async function generateStreamingResponse(
  systemPrompt: string,
  userPrompt: string,
  modelName: AIModelName
) {
  const model = getModel(modelName);

  const messages: ModelMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const result = streamText({
    model,
    messages,
  });

  const stream = createStreamableValue(result.textStream);
  return stream.value;
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Generate a translated summary of a document
 *
 * @param document - The document content to summarize
 * @param language - The target language for the summary
 * @param modelName - The AI model to use
 * @returns Streamable value with the summary text, or ActionResponse with error
 */
export async function generateSummary(
  roomId: string,
  document: string,
  language: string,
  modelName: AIModelName
): Promise<ReturnType<typeof createStreamableValue>["value"] | ActionResponse> {
  try {
    const authorized = await authorizeAiRequest(roomId, modelName);
    if ("success" in authorized) return authorized;

    const prepared = prepareDocument(document);
    if ("success" in prepared) {
      return prepared;
    }

    if (!isSupportedLanguage(language)) {
      return errorResponse("VALIDATION_ERROR", "Unsupported language.");
    }

    const quota = await consumeAuthorizedQuota(authorized.uid);
    if (quota) return quota;

    const userPrompt = `Provided document:\n${prepared.document}\n\nProvided language:\n${language}`;

    return generateStreamingResponse(AI_PROMPTS.TRANSLATION, userPrompt, authorized.model);
  } catch (error) {
    console.error("[generateSummary] Error:", error);
    if (isUnauthorizedError(error)) {
      return errorResponse("UNAUTHORIZED", "Please sign in to use AI features.");
    }
    return errorResponse(
      "INTERNAL_ERROR",
      "Failed to generate summary. Please try again."
    );
  }
}

/**
 * Generate an answer to a question about a document
 *
 * @param document - The document content to reference
 * @param question - The question to answer
 * @param modelName - The AI model to use
 * @returns Streamable value with the answer text, or ActionResponse with error
 */
export async function generateAnswer(
  roomId: string,
  document: string,
  question: string,
  modelName: AIModelName
): Promise<ReturnType<typeof createStreamableValue>["value"] | ActionResponse> {
  try {
    const authorized = await authorizeAiRequest(roomId, modelName);
    if ("success" in authorized) return authorized;

    const prepared = prepareDocument(document);
    if ("success" in prepared) {
      return prepared;
    }

    const normalizedQuestion = normalizeAiQuestion(question);
    if (!normalizedQuestion) {
      return errorResponse(
        "VALIDATION_ERROR",
        `Question must be 1-${AI_LIMITS.MAX_QUESTION_LENGTH} characters.`
      );
    }

    const quota = await consumeAuthorizedQuota(authorized.uid);
    if (quota) return quota;

    const userPrompt = `Provided document:\n${prepared.document}\n\nProvided question:\n${normalizedQuestion}`;

    return generateStreamingResponse(
      AI_PROMPTS.QUESTION_ANSWER,
      userPrompt,
      authorized.model
    );
  } catch (error) {
    console.error("[generateAnswer] Error:", error);
    if (isUnauthorizedError(error)) {
      return errorResponse("UNAUTHORIZED", "Please sign in to use AI features.");
    }
    return errorResponse(
      "INTERNAL_ERROR",
      "Failed to generate answer. Please try again."
    );
  }
}
