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

// ============================================================================
// DOCUMENT LAYOUT
// ============================================================================

export default async function DocumentLayout({
  children,
  params,
}: DocumentLayoutProps) {
  // Resolve async params (Next.js 16 pattern)
  const { id } = await params;

  // Protect this route - requires authentication (server session cookie)
  await requireAuthenticatedUserOrRedirect(`/?redirect=${encodeURIComponent(`/doc/${id}`)}`);

  // Self-heal: if a room somehow lost its last owner, restore ownership for the
  // current user (only if they already have a room entry).
  await ensureRoomHasOwner(id);

  return <RoomProvider roomId={id}>{children}</RoomProvider>;
}
