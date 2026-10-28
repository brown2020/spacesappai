import { notFound } from "next/navigation";
import RoomProvider from "@/components/RoomProvider";
import LiveBlocksProvider from "@/components/LiveBlocksProvider";
import { requireAuthenticatedUserOrRedirect } from "@/lib/firebase-session";
import { userHasRoomAccess } from "@/lib/firestore-helpers";
import { ensureRoomHasOwner } from "@/lib/room-ownership";

// ============================================================================
// TYPES
// ============================================================================

interface DocumentLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

async function prepareDocumentRoom(id: string) {
  if (!id || id.length > 128 || id.includes("/")) {
    notFound();
  }

  const user = await requireAuthenticatedUserOrRedirect(
    `/?redirect=${encodeURIComponent(`/doc/${id}`)}`
  );
  await ensureRoomHasOwner(id, user);
  const allowed = await userHasRoomAccess(user.uid, id);
  if (!allowed) {
    notFound();
  }
}

// ============================================================================
// DOCUMENT LAYOUT
// ============================================================================

export default async function DocumentLayout({
  children,
  params,
}: DocumentLayoutProps) {
  const { id } = await params;
  await prepareDocumentRoom(id);

  return (
    <LiveBlocksProvider>
      <RoomProvider roomId={id}>{children}</RoomProvider>
    </LiveBlocksProvider>
  );
}
