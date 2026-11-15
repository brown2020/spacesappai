import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  AI_INPUT_LIMITS,
  AI_MODEL_NAMES,
  evaluateAiQuota,
  isDocumentWithinInputLimit,
  isSupportedAiModel,
  isSupportedLanguage,
  normalizeAiQuestion,
} from "../src/lib/ai-guards.ts";

describe("AI request guards", () => {
  it("allowlists exactly the current flagship models", () => {
    assert.deepEqual(
      [...AI_MODEL_NAMES].sort(),
      ["claude-opus-5-5", "gemini-4-argon", "gpt-6.1-sol"]
    );
    for (const model of AI_MODEL_NAMES) {
      assert.equal(isSupportedAiModel(model), true);
    }
  });

  it("rejects retired, gateway-form and unknown model ids", () => {
    for (const model of [
      "gpt-4o",
      "gemini-1.5-pro",
      "gemini-1.5-pro-latest",
      "mistral-large",
      "claude-3-5-sonnet",
      "claude-3-5-sonnet-latest",
      "llama-v3p1-405b",
      "gpt-5",
      "openai/gpt-6.1-sol",
      "anthropic/claude-opus-5.5",
      "google/gemini-4-argon",
      "constructor",
      "",
      undefined,
      null,
    ]) {
      assert.equal(isSupportedAiModel(model), false, String(model));
    }
  });

  it("allowlists languages", () => {
    assert.equal(isSupportedLanguage("french"), true);
    assert.equal(isSupportedLanguage("French"), false);
    assert.equal(isSupportedLanguage("klingon"), false);
  });

  it("caps questions and oversized documents", () => {
    assert.equal(normalizeAiQuestion("  hello  "), "hello");
    assert.equal(normalizeAiQuestion(""), null);
    assert.equal(
      normalizeAiQuestion("x".repeat(AI_INPUT_LIMITS.MAX_QUESTION_LENGTH)),
      "x".repeat(AI_INPUT_LIMITS.MAX_QUESTION_LENGTH)
    );
    assert.equal(
      normalizeAiQuestion("x".repeat(AI_INPUT_LIMITS.MAX_QUESTION_LENGTH + 1)),
      null
    );
    assert.equal(isDocumentWithinInputLimit("notes"), true);
    assert.equal(isDocumentWithinInputLimit(""), false);
    assert.equal(
      isDocumentWithinInputLimit("x".repeat(AI_INPUT_LIMITS.MAX_DOCUMENT_INPUT_LENGTH + 1)),
      false
    );
  });

  it("rate limits inside a window and resets after it", () => {
    const first = evaluateAiQuota(null, 1_000, 60_000, 2);
    assert.equal(first.allowed, true);
    assert.deepEqual(first.next, { windowStartMs: 1_000, count: 1 });

    const second = evaluateAiQuota(first.next, 1_500, 60_000, 2);
    assert.equal(second.allowed, true);
    assert.equal(second.next.count, 2);

    const blocked = evaluateAiQuota(second.next, 2_000, 60_000, 2);
    assert.equal(blocked.allowed, false);
    assert.equal(blocked.next.count, 2);

    const reset = evaluateAiQuota(blocked.next, 61_000, 60_000, 2);
    assert.equal(reset.allowed, true);
    assert.deepEqual(reset.next, { windowStartMs: 61_000, count: 1 });
  });
});
