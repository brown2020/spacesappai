const MAX_COVER_URL_LENGTH = 2000;

/** Cover images are rendered from a URL, so only https URLs are accepted. */
export function isSafeCoverImageUrl(value: string): boolean {
  if (typeof value !== "string" || value.length === 0 || value.length > MAX_COVER_URL_LENGTH) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}
