import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("session sync wiring", () => {
  it("waits for auth and does not force-refresh the ID token on load", () => {
    const bridge = readFileSync(
      join(root, "src/components/FirebaseAuthBridge.tsx"),
      "utf8"
    );
    const client = readFileSync(
      join(root, "src/lib/sessionCookieClient.ts"),
      "utf8"
    );
    assert.match(bridge, /syncObservedAuthUser/);
    assert.doesNotMatch(bridge, /getIdToken\(/);
    assert.match(client, /authStateReady/);
    assert.match(client, /getIdTokenResult\(false\)/);
    assert.match(client, /observedSessionAction/);
    assert.doesNotMatch(client, /getIdToken\(\s*true\s*\)/);
    assert.doesNotMatch(client, /forceRefresh \*\/ true/);
  });

  it("reads a missing session as 200 with null", () => {
    const route = readFileSync(
      join(root, "src/app/api/auth/session/route.ts"),
      "utf8"
    );
    const getHandler = route.slice(
      route.indexOf("export async function GET"),
      route.indexOf("export async function POST")
    );
    assert.match(getHandler, /getAuthenticatedUser/);
    assert.match(getHandler, /session: user/);
    assert.match(getHandler, /: null/);
    assert.doesNotMatch(getHandler, /status:\s*401/);
  });
});
