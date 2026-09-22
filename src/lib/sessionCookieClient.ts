/**
 * Client helpers for syncing the httpOnly Firebase session cookie.
 * Kept outside React components so auth listeners do not embed fetch() in effects.
 */
export async function setServerSessionFromIdToken(
  idToken: string
): Promise<void> {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) throw new Error("Failed to create session");
}

export async function clearServerSession(): Promise<void> {
  await fetch("/api/auth/session", { method: "DELETE" }).catch(() => undefined);
}
