import type { Metadata } from "next";
import Document from "@/components/Document";
import { adminDb } from "@/firebase/firebaseAdmin";
import { COLLECTIONS } from "@/firebase/firebaseConfig";

// ============================================================================
// TYPES
// ============================================================================

interface DocumentPageProps {
  params: Promise<{ id: string }>;
}

// ============================================================================
// METADATA
// ============================================================================

export async function generateMetadata({
  params,
}: DocumentPageProps): Promise<Metadata> {
  const { id } = await params;
  if (!id || id.length > 128 || /[/]/.test(id)) {
    return { title: "Document" };
  }
  try {
    const snap = await adminDb.collection(COLLECTIONS.DOCUMENTS).doc(id).get();
    const title = (snap.data()?.title as string) || "Untitled";
    return { title };
  } catch {
    return { title: "Document" };
  }
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
