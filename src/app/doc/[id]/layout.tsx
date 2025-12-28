import RoomProvider from "@/components/RoomProvider";
import { requireAuthenticatedUserOrRedirect } from "@/lib/firebase-session";

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

  return <RoomProvider roomId={id}>{children}</RoomProvider>;
}
