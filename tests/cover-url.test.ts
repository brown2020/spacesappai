import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isSafeCoverImageUrl } from "../src/lib/cover-url.ts";

describe("isSafeCoverImageUrl", () => {
  it("accepts https URLs only", () => {
    assert.equal(isSafeCoverImageUrl("https://cdn.example/cover.png"), true);
    assert.equal(isSafeCoverImageUrl("http://cdn.example/cover.png"), false);
    assert.equal(isSafeCoverImageUrl("javascript:alert(1)"), false);
    assert.equal(isSafeCoverImageUrl("data:text/html,hi"), false);
    assert.equal(isSafeCoverImageUrl("not a url"), false);
    assert.equal(isSafeCoverImageUrl(`https://cdn.example/${"a".repeat(2000)}`), false);
  });
});
