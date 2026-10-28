import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isRecentAuthTime, isTrustedSessionPost } from "../src/lib/session-guards.ts";

const NOW = 1_700_000_000_000;

describe("session guards", () => {
  it("accepts an ID token minted a few minutes ago", () => {
    assert.equal(isRecentAuthTime(NOW / 1000 - 60, NOW), true);
    assert.equal(isRecentAuthTime(NOW / 1000 - 6 * 60, NOW), false);
    assert.equal(isRecentAuthTime(NOW / 1000 + 5 * 60, NOW), false);
  });

  it("requires a same-origin JSON post", () => {
    assert.equal(
      isTrustedSessionPost({
        origin: "https://spaces.example",
        host: "spaces.example",
        forwardedHost: "spaces.example",
        contentType: "application/json",
      }),
      true
    );
    assert.equal(
      isTrustedSessionPost({
        origin: "https://evil.example",
        host: "spaces.example",
        forwardedHost: "evil.example",
        contentType: "application/json",
      }),
      false
    );
    assert.equal(
      isTrustedSessionPost({
        origin: "https://evil.example",
        host: "spaces.example",
        forwardedHost: null,
        contentType: "application/json",
      }),
      false
    );
    assert.equal(
      isTrustedSessionPost({
        origin: "https://spaces.example",
        host: "spaces.example",
        forwardedHost: null,
        contentType: "text/plain",
      }),
      false
    );
    assert.equal(
      isTrustedSessionPost({
        origin: null,
        host: "spaces.example",
        forwardedHost: null,
        contentType: "application/json",
      }),
      false
    );
  });
});
