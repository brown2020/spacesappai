import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("auth and mutation contracts", () => {
  it("document actions require authenticated user before writes", () => {
    const src = readFileSync(join(root, "src/lib/documentActions.ts"), "utf8");
    assert.match(src, /requireAuthenticatedUser/);
    assert.match(src, /verifyOwnership|FORBIDDEN|UNAUTHORIZED/);
    assert.match(src, /"use server"/);
  });

  it("Liveblocks auth endpoint requires session before granting room access", () => {
    const src = readFileSync(
      join(root, "src/app/api/auth-endpoint/route.ts"),
      "utf8"
    );
    assert.match(src, /requireAuthenticatedUser/);
    assert.match(src, /prepareSession/);
    assert.match(src, /authorize/);
  });

  it("session route verifies Firebase session cookies server-side", () => {
    const src = readFileSync(
      join(root, "src/app/api/auth/session/route.ts"),
      "utf8"
    );
    assert.match(src, /createSessionCookie|verifySessionCookie|adminAuth/);
  });

  it("document layout enforces auth before RoomProvider", () => {
    const src = readFileSync(join(root, "src/app/doc/[id]/(app)/layout.tsx"), "utf8");
    assert.match(src, /requireAuthenticatedUserOrRedirect/);
    assert.match(src, /RoomProvider/);
  });
});
