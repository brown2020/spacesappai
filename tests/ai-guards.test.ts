import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  AI_INPUT_LIMITS,
  evaluateAiQuota,
  isDocumentWithinInputLimit,
  isSupportedAiModel,
  isSupportedLanguage,
  normalizeAiQuestion,
} from "../src/lib/ai-guards.ts";

describe("AI request guards", () => {
  it("allowlists models and languages", () => {
    assert.equal(isSupportedAiModel("gpt-4o"), true);
    assert.equal(isSupportedAiModel("constructor"), false);
    assert.equal(isSupportedAiModel("gpt-5"), false);
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
