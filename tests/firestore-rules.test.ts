import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rules = readFileSync(join(root, "firestore.rules"), "utf8");

describe("firestore rules", () => {
  it("denies client writes to membership rows", () => {
    assert.match(
      rules,
      /match \/rooms\/\{roomId\} \{[\s\S]*allow create, update, delete: if false;/
    );
    assert.doesNotMatch(rules, /request\.resource\.data\.role == ['"]owner['"]/);
  });

  it("lets only owners change isPublished and limits document fields", () => {
    assert.match(rules, /data\.keys\(\)\.hasOnly\(\[/);
    assert.match(rules, /isPublishedFlag\(request\.resource\.data\) == isPublishedFlag\(resource\.data\)/);
    assert.match(rules, /\|\| isOwner\(documentId\)/);
    assert.match(rules, /!isPublishedFlag\(request\.resource\.data\)/);
  });

  it("rejects client comment writes so author fields come from the server", () => {
    assert.match(
      rules,
      /match \/comments\/\{commentId\} \{[\s\S]*allow create, update, delete: if false;/
    );
  });
});
