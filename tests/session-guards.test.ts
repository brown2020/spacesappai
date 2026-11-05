import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isRecentAuthTime,
  isTrustedSessionPost,
  observedSessionAction,
} from "../src/lib/session-guards.ts";

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

  it("mints a session only for the user who just signed in", () => {
    const now = 1_700_000_000_000;
    assert.equal(
      observedSessionAction({
        callbackUid: "user-a",
        currentUid: "user-a",
        authTimeSeconds: now / 1000 - 30,
        nowMs: now,
      }),
      "mint"
    );
    assert.equal(
      observedSessionAction({
        callbackUid: "user-a",
        currentUid: "user-a",
        authTimeSeconds: now / 1000 - 60 * 60,
        nowMs: now,
      }),
      "skip"
    );
    assert.equal(
      observedSessionAction({
        callbackUid: "user-a",
        currentUid: "user-a",
        authTimeSeconds: null,
        nowMs: now,
      }),
      "skip"
    );
  });

  it("clears a session only after auth has settled on signed-out", () => {
    assert.equal(
      observedSessionAction({
        callbackUid: null,
        currentUid: null,
        authTimeSeconds: null,
      }),
      "clear"
    );
    assert.equal(
      observedSessionAction({
        callbackUid: null,
        currentUid: "user-a",
        authTimeSeconds: null,
      }),
      "skip"
    );
    assert.equal(
      observedSessionAction({
        callbackUid: "user-a",
        currentUid: null,
        authTimeSeconds: 1_700_000_000,
      }),
      "skip"
    );
  });
});
