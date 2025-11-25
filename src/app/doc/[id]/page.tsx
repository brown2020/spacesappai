import Document from "@/components/Document";

// ============================================================================
// TYPES
// ============================================================================

interface DocumentPageProps {
  params: Promise<{ id: string }>;
}

// ============================================================================
// DOCUMENT PAGE
// ============================================================================

export default async function DocumentPage({ params }: DocumentPageProps) {
  // Resolve async params (Next.js 16 pattern)
  const { id } = await params;

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <Document id={id} />
    </div>
  );
}
