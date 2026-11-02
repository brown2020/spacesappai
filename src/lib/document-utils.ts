import * as Y from "yjs";

/** Editor surface that can read the text the user actually sees. */
export interface AiDocumentReader {
  blocksToMarkdownLossy: () => string;
}

/**
 * Extract document content from a Yjs document
 * Returns null if the document is empty or invalid
 *
 * @param doc - The Yjs document
 * @returns The document content as a string, or null if empty
 */
export function getDocumentContent(doc: Y.Doc): string | null {
  const data: unknown = doc.get("document-store").toJSON();

  if (!data) {
    return null;
  }

  if (typeof data === "string") {
    return data.trim() ? data : null;
  }

  // For non-string data (objects/arrays), stringify
  const stringified = JSON.stringify(data);
  return stringified && stringified !== "{}" && stringified !== "[]"
    ? stringified
    : null;
}

/**
 * Text sent to Translate and Chat.
 * Prefer the mounted editor so a visible document is used even when the
 * Yjs fragment has not caught up, then fall back to that fragment.
 */
export function readAiDocumentText(
  doc: Y.Doc,
  editor?: AiDocumentReader | null
): string | null {
  if (editor) {
    try {
      const markdown = editor.blocksToMarkdownLossy().trim();
      if (markdown) return markdown;
    } catch {
      // The fragment is still a valid source when the editor cannot export.
    }
  }

  return getDocumentContent(doc);
}


