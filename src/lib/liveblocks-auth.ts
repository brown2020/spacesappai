import { getDocumentRef } from "@/lib/firestore-helpers";
import { liveblocks } from "@/lib/liveblocks";
import type { AuthenticatedUser } from "@/lib/firebase-session";

export type LiveblocksAuthResult =
  | { ok: true; body: string; status: number }
  | { ok: false; status: number; message: string };

/**
 * Grant a Liveblocks room token for a membership role.
 * Unknown roles fail closed. Owners and editors can edit; viewers are read-only.
 */
export async function authorizeLiveblocksRoom(
  user: AuthenticatedUser,
  roomId: string,
  role: string | undefined
): Promise<LiveblocksAuthResult> {
  if (role !== "owner" && role !== "editor" && role !== "viewer") {
    return {
      ok: false,
      status: 403,
      message: "You do not have access to this room",
    };
  }

  const session = liveblocks.prepareSession(user.uid, {
    userInfo: {
      name: user.name ?? "Anonymous",
      email: user.email ?? "anonymous",
      avatar: user.picture ?? "",
    },
  });

  if (role === "owner" || role === "editor") {
    session.allow(roomId, session.FULL_ACCESS);
  } else {
    session.allow(roomId, session.READ_ACCESS);
  }

  const { body, status } = await session.authorize();
  return { ok: true, body, status };
}

/**
 * Mint a token during the document render so the browser can connect
 * without a second cold /api/auth-endpoint round trip.
 * Returns null when minting fails; the client then uses the auth endpoint.
 */
export async function prefetchLiveblocksToken(
  user: AuthenticatedUser,
  roomId: string,
  role: string
): Promise<string | null> {
  try {
    const documentSnap = await getDocumentRef(roomId).get();
    if (!documentSnap.exists) return null;

    const authorized = await authorizeLiveblocksRoom(user, roomId, role);
    if (!authorized.ok || authorized.status !== 200) return null;

    const parsed: unknown = JSON.parse(authorized.body);
    if (!parsed || typeof parsed !== "object" || !("token" in parsed)) {
      return null;
    }

    const token = (parsed as { token?: unknown }).token;
    return typeof token === "string" && token.length > 0 ? token : null;
  } catch (error) {
    console.error("[liveblocks] Token prefetch failed:", error);
    return null;
  }
}
