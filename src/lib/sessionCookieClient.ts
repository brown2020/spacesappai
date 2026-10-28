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
