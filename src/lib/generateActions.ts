"use server";

import { createStreamableValue } from "@ai-sdk/rsc";
import { streamText, type CoreMessage } from "ai";
import { createOpenAI, openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { mistral } from "@ai-sdk/mistral";
import { anthropic } from "@ai-sdk/anthropic";
import { auth } from "@clerk/nextjs/server";
import { AI_PROMPTS } from "@/constants";
import type { AIModelName } from "@/types";

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Maximum document length in characters for AI processing
 * This prevents excessive token usage and API timeouts
 * ~50,000 characters is roughly 12,500 tokens (at 4 chars/token avg)
 */
const MAX_DOCUMENT_LENGTH = 50000;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate document for AI processing
 * @throws Error if document is invalid
 */
function validateDocument(document: string): void {
  if (!document || typeof document !== "string") {
    throw new Error("Document content is required");
  }
  
  if (document.length > MAX_DOCUMENT_LENGTH) {
    throw new Error(
      `Document is too large for AI processing. Maximum ${MAX_DOCUMENT_LENGTH.toLocaleString()} characters allowed, but received ${document.length.toLocaleString()} characters.`
    );
  }
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
 */
async function generateStreamingResponse(
  systemPrompt: string,
  userPrompt: string,
  modelName: AIModelName
) {
  await auth.protect();

  const model = getModel(modelName);

  const messages: CoreMessage[] = [
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
 * @returns Streamable value with the summary text
 * @throws Error if document is too large or invalid
 */
export async function generateSummary(
  document: string,
  language: string,
  modelName: AIModelName
) {
  await auth.protect();
  
  // Validate document size and content
  validateDocument(document);
  
  if (!language || typeof language !== "string") {
    throw new Error("Language is required");
  }

  const userPrompt = `Provided document:\n${document}\n\nProvided language:\n${language}`;

  return generateStreamingResponse(
    AI_PROMPTS.TRANSLATION,
    userPrompt,
    modelName
  );
}

/**
 * Generate an answer to a question about a document
 *
 * @param document - The document content to reference
 * @param question - The question to answer
 * @param modelName - The AI model to use
 * @returns Streamable value with the answer text
 * @throws Error if document is too large or invalid
 */
export async function generateAnswer(
  document: string,
  question: string,
  modelName: AIModelName
) {
  await auth.protect();
  
  // Validate document size and content
  validateDocument(document);
  
  if (!question || typeof question !== "string" || !question.trim()) {
    throw new Error("Question is required");
  }

  const userPrompt = `Provided document:\n${document}\n\nProvided question:\n${question}`;

  return generateStreamingResponse(
    AI_PROMPTS.QUESTION_ANSWER,
    userPrompt,
    modelName
  );
}
