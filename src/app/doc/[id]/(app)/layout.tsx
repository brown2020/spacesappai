import { notFound } from "next/navigation";
import RoomProvider from "@/components/RoomProvider";
import LiveBlocksProvider from "@/components/LiveBlocksProvider";
import { requireAuthenticatedUserOrRedirect } from "@/lib/firebase-session";
import { getUserRoomMembership } from "@/lib/firestore-helpers";
import { prefetchLiveblocksToken } from "@/lib/liveblocks-auth";
import { ensureRoomHasOwner } from "@/lib/room-ownership";

// ============================================================================
// TYPES
// ============================================================================

interface DocumentLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

async function prepareDocumentRoom(id: string): Promise<string | null> {
  if (!id || id.length > 128 || id.includes("/")) {
    notFound();
  }

  const user = await requireAuthenticatedUserOrRedirect(
    `/?redirect=${encodeURIComponent(`/doc/${id}`)}`
  );
  await ensureRoomHasOwner(id, user);
  const membership = await getUserRoomMembership(user.uid, id);
  if (!membership) {
    notFound();
  }

  if (!membership.role) return null;
  return prefetchLiveblocksToken(user, id, membership.role);
}

// ============================================================================
// DOCUMENT LAYOUT
// ============================================================================

export default async function DocumentLayout({
  children,
  params,
}: DocumentLayoutProps) {
  const { id } = await params;
  const token = await prepareDocumentRoom(id);

  return (
    <LiveBlocksProvider
      initialToken={token ? { roomId: id, token } : null}
    >
      <RoomProvider roomId={id}>{children}</RoomProvider>
    </LiveBlocksProvider>
  );
}
