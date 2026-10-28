import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("auth and mutation contracts", () => {
  it("document actions require authenticated user before writes", () => {
    const src = readFileSync(join(root, "src/server/documentActions.ts"), "utf8");
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
    assert.match(src, /role === "owner" \|\| role === "editor"/);
    assert.doesNotMatch(src, /session\.FULL_ACCESS[\s\S]{0,80}else \{/);
  });

  it("session route verifies Firebase session cookies server-side", () => {
    const src = readFileSync(
      join(root, "src/app/api/auth/session/route.ts"),
      "utf8"
    );
    assert.match(src, /createSessionCookie|verifySessionCookie|adminAuth/);
    assert.match(src, /isRecentAuthTime/);
    assert.match(src, /isTrustedSessionPost/);
    assert.match(src, /revokeRefreshTokens/);
  });

  it("document layout enforces auth before RoomProvider", () => {
    const src = readFileSync(join(root, "src/app/doc/[id]/(app)/layout.tsx"), "utf8");
    assert.match(src, /requireAuthenticatedUserOrRedirect/);
    assert.match(src, /userHasRoomAccess/);
    assert.match(src, /RoomProvider/);
  });
});
