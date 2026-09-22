import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { cn, normalizeEmail, isValidEmail, getRoomIdFromPath } from "../src/lib/utils.ts";

describe("utils", () => {
  it("cn merges class names", () => {
    assert.match(cn("px-2", false && "hidden", "py-1"), /px-2/);
    assert.match(cn("px-2", "py-1"), /py-1/);
  });

  it("normalizeEmail lowercases and trims", () => {
    assert.equal(normalizeEmail("  Foo@Bar.COM "), "foo@bar.com");
    assert.equal(normalizeEmail(null), "");
  });

  it("isValidEmail accepts basic addresses", () => {
    assert.equal(isValidEmail("a@b.co"), true);
    assert.equal(isValidEmail("not-an-email"), false);
  });

  it("getRoomIdFromPath extracts and validates ids", () => {
    assert.equal(getRoomIdFromPath("/doc/abc123"), "abc123");
    assert.equal(getRoomIdFromPath("/doc/../evil"), null);
    assert.equal(getRoomIdFromPath("/other"), null);
  });
});
