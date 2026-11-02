import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import * as Y from "yjs";
import { $syncPluginStateUpdate } from "@y/prosemirror";
import { BlockNoteEditor } from "@blocknote/core";
import { withCollaboration } from "@blocknote/core/yjs";
import { readAiDocumentText } from "../src/lib/document-utils.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("editor yjs binding", () => {
  it("binds BlockNote to the yjs v13 entry Liveblocks syncs", () => {
    const src = readFileSync(join(root, "src/components/Editor.tsx"), "utf8");
    const translate = readFileSync(
      join(root, "src/components/TranslateDocument.tsx"),
      "utf8"
    );
    const chat = readFileSync(join(root, "src/components/ChatToDocument.tsx"), "utf8");
    assert.match(src, /from "@blocknote\/core\/yjs"/);
    assert.match(src, /withCollaboration/);
    assert.doesNotMatch(src, /from "@blocknote\/core\/y"/);
    assert.doesNotMatch(src, /next\/dynamic/);
    assert.match(src, /generateSummary/);
    assert.match(src, /generateAnswer/);
    assert.match(translate, /Select a language first/);
    assert.doesNotMatch(translate, /disabled=\{!language/);
    assert.match(chat, /Enter a question first/);
    assert.doesNotMatch(chat, /disabled=\{!question\.trim\(\)/);
  });

  it("rejects a yjs v13 fragment in the Yjs 14 sync schema used by @blocknote/core/y", () => {
    const doc = new Y.Doc();
    const fragment = doc.getXmlFragment("document-store");
    assert.throws(
      () => $syncPluginStateUpdate.expect({ ytype: fragment }),
      /ytype|Union|Expected value/
    );
  });

  it("creates a collaborative editor on a yjs v13 fragment without prosemirror history", () => {
    const doc = new Y.Doc();
    const fragment = doc.getXmlFragment("document-store");
    const awareness = {
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
    };
    const options = withCollaboration({
      collaboration: {
        fragment,
        user: { name: "Ada", color: "#111111" },
        provider: { awareness },
      },
    });
    assert.equal(options.disableExtensions?.includes("history"), true);

    const editor = BlockNoteEditor.create(options);
    assert.ok(editor);
    assert.equal(editor.document.length > 0, true);
  });

  it("reads visible editor text before the yjs fragment", () => {
    const doc = new Y.Doc();
    assert.equal(readAiDocumentText(doc), null);
    assert.equal(
      readAiDocumentText(doc, { blocksToMarkdownLossy: () => "  Hello from the editor  " }),
      "Hello from the editor"
    );
    assert.equal(
      readAiDocumentText(doc, {
        blocksToMarkdownLossy: () => {
          throw new Error("export failed");
        },
      }),
      null
    );

    const text = new Y.XmlText();
    text.insert(0, "Stored in yjs");
    doc.getXmlFragment("document-store").insert(0, [text]);
    const stored = readAiDocumentText(doc);
    assert.equal(typeof stored, "string");
    assert.match(stored ?? "", /Stored in yjs/);
  });
});
