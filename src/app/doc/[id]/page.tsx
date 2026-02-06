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

  // Basic validation on the document ID
  if (!id || id.length > 128 || /[/]/.test(id)) {
    const { notFound } = await import("next/navigation");
    notFound();
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <Document id={id} />
    </div>
  );
}
