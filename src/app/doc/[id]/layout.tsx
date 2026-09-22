import RoomProvider from "@/components/RoomProvider";
import { requireAuthenticatedUserOrRedirect } from "@/lib/firebase-session";
import { ensureRoomHasOwner } from "@/lib/room-ownership";

// ============================================================================
// TYPES
// ============================================================================

interface DocumentLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

async function prepareDocumentRoom(id: string) {
  const user = await requireAuthenticatedUserOrRedirect(
    `/?redirect=${encodeURIComponent(`/doc/${id}`)}`
  );
  await ensureRoomHasOwner(id, user);
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

  return <RoomProvider roomId={id}>{children}</RoomProvider>;
}
