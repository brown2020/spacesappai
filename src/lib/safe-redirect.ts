const REDIRECT_BASE = "https://spaces.local";

/**
 * Accept only same-origin paths. Browsers normalize "\" to "/" before parsing,
 * so "/\\evil.com" is a scheme-relative URL and must be rejected.
 */
export function isSafeRedirectPath(redirectPath: string | null | undefined): boolean {
  if (!redirectPath || redirectPath.length > 2000) return false;
  if (!redirectPath.startsWith("/") || redirectPath.startsWith("//")) return false;
  if (redirectPath.includes("\\") || redirectPath.includes("\0")) return false;

  try {
    const resolved = new URL(redirectPath, REDIRECT_BASE);
    return resolved.origin === REDIRECT_BASE;
  } catch {
    return false;
  }
}
