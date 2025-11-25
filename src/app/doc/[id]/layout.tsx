import { auth } from "@clerk/nextjs/server";
import RoomProvider from "@/components/RoomProvider";

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

  // Protect this route - requires authentication
  await auth.protect();

  return <RoomProvider roomId={id}>{children}</RoomProvider>;
}
