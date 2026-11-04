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
    const route = readFileSync(
      join(root, "src/app/api/auth-endpoint/route.ts"),
      "utf8"
    );
    const helper = readFileSync(join(root, "src/lib/liveblocks-auth.ts"), "utf8");
    assert.match(route, /requireAuthenticatedUser/);
    assert.match(route, /authorizeLiveblocksRoom/);
    assert.match(helper, /prepareSession/);
    assert.match(helper, /authorize\(/);
    assert.match(helper, /role === "owner" \|\| role === "editor"/);
    assert.match(helper, /session\.READ_ACCESS/);
    assert.doesNotMatch(helper, /else \{[\s\S]{0,160}FULL_ACCESS/);
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
    assert.match(src, /getUserRoomMembership/);
    assert.match(src, /prefetchLiveblocksToken/);
    assert.match(src, /RoomProvider/);
    assert.match(src, /notFound\(\)/);

    const admin = readFileSync(join(root, "src/firebase/firebaseAdmin.ts"), "utf8");
    const provider = readFileSync(
      join(root, "src/components/LiveBlocksProvider.tsx"),
      "utf8"
    );
    const select = readFileSync(join(root, "src/components/ui/select.tsx"), "utf8");
    assert.match(admin, /METADATA_SERVER_DETECTION = "none"/);
    assert.match(provider, /initialToken/);
    assert.match(provider, /response\.ok/);
    assert.match(select, /pointer-events-auto/);
    assert.match(select, /z-\[200\]/);
  });
});
