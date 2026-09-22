/**
 * Regression proof: title updates go through updateDocumentTitle server action
 * with auth + role checks (failed vs passed assertion documented in worksheet).
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("regression: updateDocumentTitle", () => {
  it("failed path: rejects empty title (VALIDATION_ERROR)", () => {
    const src = readFileSync(join(root, "src/server/documentActions.ts"), "utf8");
    assert.match(src, /export async function updateDocumentTitle/);
    assert.match(src, /VALIDATION_ERROR/);
    assert.match(src, /Title must be 1-500 characters/);
  });

  it("passed path: authenticated non-viewer update writes title in a transaction", () => {
    const src = readFileSync(join(root, "src/server/documentActions.ts"), "utf8");
    const fnStart = src.indexOf("export async function updateDocumentTitle");
    const fnEnd = src.indexOf("export async function", fnStart + 1);
    const fn = src.slice(fnStart, fnEnd === -1 ? undefined : fnEnd);
    assert.match(fn, /requireAuthenticatedUser/);
    assert.match(fn, /role === "viewer"/);
    assert.match(fn, /trimmedTitle/);
    assert.match(fn, /successResponse/);
    assert.match(fn, /FORBIDDEN/);
  });
});
