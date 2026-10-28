import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const page = readFileSync(join(root, "src/app/doc/[id]/public/page.tsx"), "utf8");

describe("public document page", () => {
  it("does not pass an image loader from the server component", () => {
    assert.doesNotMatch(page, /loader=\{/);
    assert.match(page, /RemoteImage/);
  });

  it("hides unpublished titles and caps the Yjs payload", () => {
    assert.match(page, /if \(!data\?\.isPublished\)/);
    assert.match(page, /MAX_PUBLIC_YJS_BYTES/);
    assert.match(page, /export const revalidate = 60/);
  });
});
