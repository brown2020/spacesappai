import type { Auth, User } from "firebase/auth";
import { observedSessionAction } from "@/lib/session-guards";

/**
 * Client helpers for syncing the httpOnly Firebase session cookie.
 * Kept outside React components so auth listeners do not embed fetch() in effects.
 */

export async function setServerSessionFromIdToken(
  idToken: string
): Promise<"ok" | "rejected"> {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (res.status === 401 || res.status === 403) return "rejected";
  if (!res.ok) throw new Error("Failed to create session");
  return "ok";
}

export async function clearServerSession(): Promise<void> {
  await fetch("/api/auth/session", { method: "DELETE" }).catch(() => undefined);
}

/**
 * Apply one Firebase auth callback to the server session.
 * Waits until persistence has restored the user, then skips the network call
 * unless this is a fresh sign-in (mint) or a settled sign-out (clear).
 * Does not force-refresh the ID token: a refresh notifies this listener again
 * and would repeat a rejected session POST.
 */
export async function syncObservedAuthUser(
  auth: Auth,
  observed: User | null
): Promise<void> {
  if (typeof auth.authStateReady === "function") {
    await auth.authStateReady();
  }

  const current = auth.currentUser;
  let authTimeSeconds: number | null = null;
  let idToken: string | null = null;

  if (current && observed && current.uid === observed.uid) {
    const tokenResult = await current.getIdTokenResult(false);
    if (auth.currentUser?.uid !== current.uid) return;
    const claim = tokenResult.claims.auth_time;
    authTimeSeconds = typeof claim === "number" ? claim : null;
    idToken = tokenResult.token;
  }

  const action = observedSessionAction({
    callbackUid: observed?.uid ?? null,
    currentUid: auth.currentUser?.uid ?? null,
    authTimeSeconds,
  });

  if (action === "clear") {
    await clearServerSession();
    return;
  }
  if (action !== "mint" || !idToken) return;

  const result = await setServerSessionFromIdToken(idToken);
  if (result === "rejected") return;
}
