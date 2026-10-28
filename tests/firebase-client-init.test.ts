import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("firebase client init", () => {
  it("does not call getAuth or initializeApp until the browser has config", () => {
    const src = readFileSync(join(root, "src/firebase/firebaseConfig.ts"), "utf8");
    assert.match(src, /typeof window === "undefined"/);
    assert.match(src, /isFirebaseClientConfigured/);
    assert.match(src, /console\.warn/);
    assert.doesNotMatch(src, /export const auth: Auth = getAuth\(/);
    assert.doesNotMatch(src, /const app = initializeFirebaseApp\(\)/);
    assert.match(src, /NEXT_PUBLIC_FIREBASE_APIKEY/);
  });
});
