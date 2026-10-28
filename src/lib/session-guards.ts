/** ID tokens older than this cannot be exchanged for a session cookie. */
export const MAX_AUTH_AGE_MS = 5 * 60 * 1000;
const CLOCK_SKEW_MS = 60 * 1000;

export function isRecentAuthTime(authTimeSeconds: number, nowMs = Date.now()): boolean {
  if (!Number.isFinite(authTimeSeconds)) return false;
  const ageMs = nowMs - authTimeSeconds * 1000;
  return ageMs >= -CLOCK_SKEW_MS && ageMs <= MAX_AUTH_AGE_MS;
}

/**
 * Session minting is a cookie-setting POST. Require JSON and a same-origin
 * Origin header so a cross-site form cannot plant a session cookie.
 */
export function isTrustedSessionPost(input: {
  origin: string | null;
  host: string | null;
  forwardedHost: string | null;
  contentType: string | null;
}): boolean {
  if (!input.contentType?.toLowerCase().includes("application/json")) return false;
  if (!input.origin) return false;

  let originHost: string;
  try {
    originHost = new URL(input.origin).host;
  } catch {
    return false;
  }

  // Host is set by the browser to the URL it requested. x-forwarded-host is
  // not a forbidden header, so a cross-site script can set it. Trust Host,
  // and ignore a forwarded host that disagrees with it.
  const host = input.host?.split(",")[0]?.trim();
  if (!host || originHost !== host) return false;

  const forwarded = input.forwardedHost?.split(",")[0]?.trim();
  return !forwarded || forwarded === host;
}
