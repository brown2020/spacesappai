import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { streamText } from "ai";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("AI streaming prompt", () => {
  it("sends instructions separately from the user prompt", () => {
    const src = readFileSync(join(root, "src/lib/generateActions.ts"), "utf8");
    assert.match(src, /instructions:\s*systemPrompt/);
    assert.match(src, /prompt:\s*userPrompt/);
    assert.match(src, /onError/);
    assert.match(src, /stream\.error\(/);
    assert.doesNotMatch(src, /role:\s*"system"/);
    assert.doesNotMatch(src, /generateText\(/);
  });

  it("does not reject instructions the way a system message is rejected", async () => {
    const errors: unknown[] = [];
    const result = streamText({
      model: {
        specificationVersion: "v3",
        provider: "test",
        modelId: "test",
        async doStream() {
          throw new Error("model-reached");
        },
      } as never,
      instructions: "Translate the document.",
      prompt: "Hello",
      onError({ error }) {
        errors.push(error);
      },
    });

    const parts: string[] = [];
    for await (const part of result.stream) {
      parts.push(part.type);
    }

    assert.equal(parts.includes("error"), true);
    assert.equal(
      errors.some(
        (error) => error instanceof Error && error.message === "model-reached"
      ),
      true
    );
    assert.equal(
      errors.some(
        (error) =>
          error instanceof Error &&
          error.message.includes("System messages are not allowed")
      ),
      false
    );
  });
});
