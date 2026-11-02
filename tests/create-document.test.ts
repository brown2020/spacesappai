/**
 * Main flow: a signed-in user creates a document and lands in the editor.
 * The server action is the only writer; the button only navigates on success.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

function functionBody(source: string, name: string): string {
  const start = source.indexOf(`export async function ${name}`);
  assert.notEqual(start, -1, `${name} should be exported`);
  const next = source.indexOf("export async function", start + 1);
  return source.slice(start, next === -1 ? undefined : next);
}

describe("create document flow", () => {
  it("creates an owner membership and a document in one transaction", () => {
    const fn = functionBody(read("src/server/documentActions.ts"), "createNewDocument");
    assert.match(fn, /requireAuthenticatedUser/);
    assert.match(fn, /adminDb\.runTransaction/);
    assert.match(fn, /title: "New Doc"/);
    assert.match(fn, /ownerId: user\.uid/);
    assert.match(fn, /role: "owner"/);
    assert.match(fn, /roomId: docRef\.id/);
    assert.match(fn, /successResponse\(\{ docId \}\)/);
    assert.match(fn, /UNAUTHORIZED/);
  });

  it("opens the new document after the action succeeds", () => {
    const button = read("src/components/NewDocumentButton.tsx");
    assert.match(button, /createNewDocument/);
    assert.match(button, /router\.push\(`\/doc\/\$\{result\.data\.docId\}`\)/);
    assert.match(button, /result\.success/);
    assert.match(button, /toast\.error\(result\.error\.message\)/);
  });

  it("offers the create action from the home page and the sidebar", () => {
    assert.match(read("src/app/page.tsx"), /<NewDocumentButton/);
    assert.match(read("src/components/HomeAuthCta.tsx"), /<NewDocumentButton/);
    assert.match(read("src/components/Sidebar.tsx"), /<NewDocumentButton/);
  });
});
