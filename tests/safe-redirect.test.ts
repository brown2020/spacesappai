import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isSafeRedirectPath } from "../src/lib/safe-redirect.ts";

describe("isSafeRedirectPath", () => {
  it("allows same-origin paths", () => {
    assert.equal(isSafeRedirectPath("/doc/abc"), true);
    assert.equal(isSafeRedirectPath("/login?next=/doc/abc"), true);
  });

  it("rejects off-site and backslash redirects", () => {
    assert.equal(isSafeRedirectPath("//evil.com"), false);
    assert.equal(isSafeRedirectPath("/\\evil.com"), false);
    assert.equal(isSafeRedirectPath("https://evil.com"), false);
    assert.equal(isSafeRedirectPath("\\\\evil.com"), false);
    assert.equal(isSafeRedirectPath(null), false);
  });
});
