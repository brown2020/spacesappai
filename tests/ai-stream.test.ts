import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { streamText } from "ai";
import { MockLanguageModelV4, simulateReadableStream } from "ai/test";
import { createXai } from "@ai-sdk/xai";
import { AI_MODEL_NAMES } from "../src/lib/ai-guards.ts";
import {
  AI_ACTION_DEADLINE_MS,
  AI_FAILURE_MESSAGE,
  AI_FUNCTION_MAX_DURATION_S,
  AI_TIMEOUT_NOTICE,
  getAiProviderOptions,
  pipeModelStream,
  remainingStreamTimeoutMs,
} from "../src/lib/ai-stream.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function recordingSink() {
  const calls = { text: "", done: 0, errors: [] as string[] };
  return {
    calls,
    sink: {
      append(text: string) {
        calls.text += text;
      },
      done() {
        calls.done += 1;
      },
      error(message: string) {
        calls.errors.push(message);
      },
    },
  };
}

function slowTextModel(words: number, delayMs: number) {
  return new MockLanguageModelV4({
    doStream: async () => ({
      stream: simulateReadableStream({
        chunkDelayInMs: delayMs,
        chunks: [
          { type: "text-start", id: "1" },
          ...Array.from({ length: words }, (_, i) => ({
            type: "text-delta" as const,
            id: "1",
            delta: `w${i} `,
          })),
          { type: "text-end", id: "1" },
          {
            type: "finish",
            finishReason: { unified: "stop", raw: "stop" },
            usage: {
              inputTokens: { total: 1, noCache: 1, cacheRead: 0, cacheWrite: 0 },
              outputTokens: { total: words, text: words, reasoning: 0 },
            },
          },
        ],
      }),
    }),
  });
}

describe("AI function deadline", () => {
  it("keeps the model deadline at least 5s under the function limit", () => {
    assert.equal(AI_FUNCTION_MAX_DURATION_S, 60);
    assert.ok(AI_ACTION_DEADLINE_MS <= AI_FUNCTION_MAX_DURATION_S * 1000 - 5_000);
    assert.ok(AI_ACTION_DEADLINE_MS > 15_000);
  });

  it("counts time already spent in the action against the deadline", () => {
    assert.equal(remainingStreamTimeoutMs(1_000, 1_000), AI_ACTION_DEADLINE_MS);
    assert.equal(remainingStreamTimeoutMs(1_000, 3_500), AI_ACTION_DEADLINE_MS - 2_500);
    assert.equal(remainingStreamTimeoutMs(0, AI_ACTION_DEADLINE_MS + 10_000), 1);
  });

  it("sets maxDuration on the doc route that runs the AI actions", () => {
    const page = readFileSync(join(root, "src/app/doc/[id]/(app)/page.tsx"), "utf8");
    const match = page.match(/export const maxDuration = (\d+);/);
    assert.ok(match, "doc page must export a literal maxDuration");
    assert.equal(Number(match[1]), AI_FUNCTION_MAX_DURATION_S);

    const editor = readFileSync(join(root, "src/components/Editor.tsx"), "utf8");
    assert.match(editor, /from "@\/lib\/generateActions"/);
  });

  it("passes the deadline and provider options to streamText", () => {
    const src = readFileSync(join(root, "src/lib/generateActions.ts"), "utf8");
    assert.match(src, /providerOptions:\s*getAiProviderOptions\(modelName\)/);
    assert.match(
      src,
      /timeout:\s*\{\s*totalMs:\s*remainingStreamTimeoutMs\(actionStartedAtMs, Date\.now\(\)\)/
    );
    assert.match(src, /pipeModelStream\(result\.stream/);
    assert.equal(src.match(/const startedAtMs = Date\.now\(\);/g)?.length, 2);
  });
});

describe("per-model provider options", () => {
  it("uses low reasoning effort for Grok 4.7 only", () => {
    assert.deepEqual(getAiProviderOptions("grok-4.7"), {
      xai: { reasoningEffort: "low" },
    });
    for (const model of AI_MODEL_NAMES.filter((m) => m !== "grok-4.7")) {
      assert.equal(getAiProviderOptions(model), undefined, model);
    }
  });

  it("sends low effort to xAI and drops penalties and stop", async () => {
    const bodies: Record<string, unknown>[] = [];
    const xai = createXai({
      apiKey: "test-key",
      fetch: async (_url, init) => {
        bodies.push(JSON.parse(String(init?.body)));
        return new Response(JSON.stringify({ error: { message: "stub" } }), {
          status: 400,
          headers: { "content-type": "application/json" },
        });
      },
    });

    const result = streamText({
      model: xai.responses("grok-4.7"),
      prompt: "hi",
      maxRetries: 0,
      providerOptions: getAiProviderOptions("grok-4.7"),
      frequencyPenalty: 0.5,
      presencePenalty: 0.5,
      stopSequences: ["END"],
      onError() {},
    });
    for await (const part of result.stream) void part;

    assert.equal(bodies.length, 1);
    const [body] = bodies;
    assert.equal(body.model, "grok-4.7");
    assert.deepEqual(body.reasoning, { effort: "low" });
    assert.equal("frequency_penalty" in body, false);
    assert.equal("presence_penalty" in body, false);
    assert.equal("stop" in body, false);
  });
});

describe("pipeModelStream", () => {
  it("ends a reply cut off at the deadline cleanly with a notice", async () => {
    const { calls, sink } = recordingSink();
    const startedAt = Date.now();
    const result = streamText({
      model: slowTextModel(40, 25),
      prompt: "hi",
      timeout: { totalMs: 120 },
    });

    const outcome = await pipeModelStream(result.stream, sink);

    assert.equal(outcome, "timeout");
    assert.ok(Date.now() - startedAt < 40 * 25, "stopped before the full reply");
    assert.match(calls.text, /^w0 /);
    assert.ok(calls.text.endsWith(AI_TIMEOUT_NOTICE));
    assert.equal(calls.done, 1);
    assert.deepEqual(calls.errors, []);
  });

  it("finishes normally when the reply beats the deadline", async () => {
    const { calls, sink } = recordingSink();
    const result = streamText({
      model: slowTextModel(3, 1),
      prompt: "hi",
      timeout: { totalMs: 5_000 },
    });

    assert.equal(await pipeModelStream(result.stream, sink), "done");
    assert.equal(calls.text, "w0 w1 w2 ");
    assert.equal(calls.done, 1);
    assert.deepEqual(calls.errors, []);
  });

  it("reports provider errors once and does not mark the reply done", async () => {
    const { calls, sink } = recordingSink();
    const failures: unknown[] = [];
    const result = streamText({
      model: new MockLanguageModelV4({
        doStream: async () => {
          throw new Error("provider-down");
        },
      }),
      prompt: "hi",
      maxRetries: 0,
      onError() {},
    });

    const outcome = await pipeModelStream(result.stream, sink, (e) => failures.push(e));

    assert.equal(outcome, "error");
    assert.deepEqual(calls.errors, [AI_FAILURE_MESSAGE]);
    assert.equal(calls.done, 0);
    assert.equal(failures.length, 1);
  });
});
