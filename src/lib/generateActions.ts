"use server";

import { createStreamableValue } from "@ai-sdk/rsc";
import { streamText, type ModelMessage } from "ai";
import { createOpenAI, openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { mistral } from "@ai-sdk/mistral";
import { anthropic } from "@ai-sdk/anthropic";
import { AI_PROMPTS } from "@/constants";
import { errorResponse } from "@/lib/action-utils";
import { isUnauthorizedError, requireAuthenticatedUser } from "@/lib/firebase-session";
import type { AIModelName, ActionResponse } from "@/types";

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Maximum document length in characters for AI processing
 * Modern models support large contexts:
 * - GPT-4o: 128K tokens (~512K chars)
 * - Claude 3.5 Sonnet: 200K tokens (~800K chars)
 * - Gemini 1.5 Pro: 1M tokens
 * 
 * We set a reasonable limit of 400K chars (~100K tokens) to balance
 * capability with cost and response time.
 */
const MAX_DOCUMENT_LENGTH = 400000;

/**
 * For documents exceeding the limit, we truncate intelligently
 * keeping the beginning and end of the document
 */
const TRUNCATION_HEAD_RATIO = 0.7; // Keep 70% from the beginning
const TRUNCATION_TAIL_RATIO = 0.25; // Keep 25% from the end (5% reserved for truncation message)

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

  // Calculate how much to keep from head and tail
  const headLength = Math.floor(maxLength * TRUNCATION_HEAD_RATIO);
  const tailLength = Math.floor(maxLength * TRUNCATION_TAIL_RATIO);
  
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
  if (!document || typeof document !== "string") {
    return errorResponse("VALIDATION_ERROR", "Document content is required");
  }
  
  // Truncate if necessary (rather than rejecting)
  const processedDocument = truncateDocument(document, MAX_DOCUMENT_LENGTH);
  
  return { document: processedDocument };
}

// ============================================================================
// AI PROVIDER CONFIGURATION
// ============================================================================

/**
 * Fireworks AI provider for open-source models
 */
const fireworks = createOpenAI({
  apiKey: process.env.FIREWORKS_API_KEY ?? "",
  baseURL: "https://api.fireworks.ai/inference/v1",
});

// ============================================================================
// MODEL RESOLUTION
// ============================================================================

/**
 * Model mapping for each provider
 */
const MODEL_MAP = {
  "gpt-4o": () => openai("gpt-4o"),
  "gemini-1.5-pro": () => google("models/gemini-1.5-pro-latest"),
  "mistral-large": () => mistral("mistral-large-latest"),
  "claude-3-5-sonnet": () => anthropic("claude-3-5-sonnet-20240620"),
  "llama-v3p1-405b": () =>
    fireworks("accounts/fireworks/models/llama-v3p1-405b-instruct"),
} as const;

/**
 * Get the AI model instance for a given model name
 */
function getModel(modelName: AIModelName) {
  const modelFactory = MODEL_MAP[modelName];

  if (!modelFactory) {
    throw new Error(`Unsupported model: ${modelName}`);
  }

  return modelFactory();
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
  document: string,
  language: string,
  modelName: AIModelName
): Promise<ReturnType<typeof createStreamableValue>["value"] | ActionResponse> {
  try {
    await requireAuthenticatedUser();

    // Validate and prepare document (truncates if too large)
    const prepared = prepareDocument(document);
    if ("success" in prepared) {
      return prepared; // Return error response
    }

    if (!language || typeof language !== "string") {
      return errorResponse("VALIDATION_ERROR", "Language is required");
    }

    const userPrompt = `Provided document:\n${prepared.document}\n\nProvided language:\n${language}`;

    return generateStreamingResponse(AI_PROMPTS.TRANSLATION, userPrompt, modelName);
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
  document: string,
  question: string,
  modelName: AIModelName
): Promise<ReturnType<typeof createStreamableValue>["value"] | ActionResponse> {
  try {
    await requireAuthenticatedUser();

    // Validate and prepare document (truncates if too large)
    const prepared = prepareDocument(document);
    if ("success" in prepared) {
      return prepared; // Return error response
    }

    if (!question || typeof question !== "string" || !question.trim()) {
      return errorResponse("VALIDATION_ERROR", "Question is required");
    }

    const userPrompt = `Provided document:\n${prepared.document}\n\nProvided question:\n${question}`;

    return generateStreamingResponse(
      AI_PROMPTS.QUESTION_ANSWER,
      userPrompt,
      modelName
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
