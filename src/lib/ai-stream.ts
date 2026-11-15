/**
 * AI streaming deadline and per-model call options. This module has no
 * path-alias imports so the Node test runner can load it directly.
 */

/** Must match `maxDuration` on the routes that invoke the AI server actions. */
export const AI_FUNCTION_MAX_DURATION_S = 60;

/** Headroom so a slow reply ends cleanly before the platform kills the function. */
export const AI_DEADLINE_MARGIN_MS = 5_000;

/** Wall-clock budget for one AI action, measured from when the action started. */
export const AI_ACTION_DEADLINE_MS =
  AI_FUNCTION_MAX_DURATION_S * 1000 - AI_DEADLINE_MARGIN_MS;

export const AI_TIMEOUT_NOTICE =
  "\n\n[Response stopped: the model took too long to finish.]";

export const AI_FAILURE_MESSAGE = "The AI request failed. Please try again.";

/**
 * Milliseconds left for the model call, so auth and quota work done earlier
 * in the action also count against the deadline. Never below 1ms because
 * streamText treats a non-positive timeout as "no timeout".
 */
export function remainingStreamTimeoutMs(
  actionStartedAtMs: number,
  nowMs: number
): number {
  return Math.max(1, actionStartedAtMs + AI_ACTION_DEADLINE_MS - nowMs);
}

/**
 * Provider options per model id. Grok 4.7 defaults to high reasoning effort,
 * which is too slow for chat replies inside the function limit.
 */
export function getAiProviderOptions(
  modelName: string
): { xai: { reasoningEffort: "low" } } | undefined {
  if (modelName === "grok-4.7") {
    return { xai: { reasoningEffort: "low" } };
  }
  return undefined;
}

type StreamPart =
  | { type: "text-delta"; text: string }
  | { type: "error"; error: unknown }
  | { type: "abort" }
  | { type: string };

export interface TextStreamSink {
  append(text: string): void;
  done(): void;
  error(message: string): void;
}

/**
 * Forward model text to the client stream. Settles the sink exactly once:
 * `done` on finish or deadline abort (with a notice), `error` on failure.
 */
export async function pipeModelStream(
  parts: AsyncIterable<StreamPart>,
  sink: TextStreamSink,
  onFailure: (error: unknown) => void = () => {}
): Promise<"done" | "timeout" | "error"> {
  try {
    for await (const part of parts) {
      if (part.type === "text-delta" && "text" in part) {
        sink.append(part.text);
      } else if (part.type === "error") {
        onFailure("error" in part ? part.error : part);
        sink.error(AI_FAILURE_MESSAGE);
        return "error";
      } else if (part.type === "abort") {
        sink.append(AI_TIMEOUT_NOTICE);
        sink.done();
        return "timeout";
      }
    }
  } catch (error) {
    onFailure(error);
    sink.error(AI_FAILURE_MESSAGE);
    return "error";
  }
  sink.done();
  return "done";
}
