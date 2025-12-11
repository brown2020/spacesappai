import * as Y from "yjs";

/**
 * Extract document content from a Yjs document
 * Returns null if the document is empty or invalid
 *
 * @param doc - The Yjs document
 * @returns The document content as a string, or null if empty
 */
export function getDocumentContent(doc: Y.Doc): string | null {
  const data = doc.get("document-store").toJSON();

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
 * Check if a Yjs document has content
 *
 * @param doc - The Yjs document
 * @returns true if the document has content
 */
export function hasDocumentContent(doc: Y.Doc): boolean {
  return getDocumentContent(doc) !== null;
}
