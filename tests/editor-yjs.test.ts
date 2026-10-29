import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import * as Y from "yjs";
import { $syncPluginStateUpdate } from "@y/prosemirror";
import { BlockNoteEditor } from "@blocknote/core";
import { CollaborationExtension } from "@blocknote/core/yjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("editor yjs binding", () => {
  it("binds BlockNote to the yjs v13 entry Liveblocks syncs", () => {
    const src = readFileSync(join(root, "src/components/Editor.tsx"), "utf8");
    assert.match(src, /from "@blocknote\/core\/yjs"/);
    assert.doesNotMatch(src, /from "@blocknote\/core\/y"/);
  });

  it("rejects a yjs v13 fragment in the Yjs 14 sync schema used by @blocknote/core/y", () => {
    const doc = new Y.Doc();
    const fragment = doc.getXmlFragment("document-store");
    assert.throws(
      () => $syncPluginStateUpdate.expect({ ytype: fragment }),
      /ytype|Union|Expected value/
    );
  });

  it("creates a collaborative editor on a yjs v13 fragment", () => {
    const doc = new Y.Doc();
    const fragment = doc.getXmlFragment("document-store");
    const editor = BlockNoteEditor.create({
      extensions: [
        CollaborationExtension({
          fragment,
          user: { name: "Ada", color: "#111111" },
          provider: {
            awareness: {
              on() {},
              off() {},
              getLocalState() {
                return null;
              },
              setLocalState() {},
              setLocalStateField() {},
              getStates() {
                return new Map();
              },
            },
          },
        }),
      ],
    });
    assert.ok(editor);
    assert.equal(editor.document.length > 0, true);
  });
});
