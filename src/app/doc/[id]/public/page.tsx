import { notFound } from "next/navigation";
import Link from "next/link";
import { adminDb } from "@/firebase/firebaseAdmin";
import { COLLECTIONS } from "@/firebase/firebaseConfig";
import { liveblocks } from "@/lib/liveblocks";
import * as Y from "yjs";
import PageIcon from "@/components/PageIcon";

// ============================================================================
// TYPES
// ============================================================================

interface PublicPageProps {
  params: Promise<{ id: string }>;
}

// ============================================================================
// YJS CONTENT HELPERS
// ============================================================================

function yDocToText(yDoc: Y.Doc): string {
  const xmlFragment = yDoc.getXmlFragment("document-store");
  return xmlFragmentToHtml(xmlFragment);
}

function xmlFragmentToHtml(fragment: Y.XmlFragment): string {
  let html = "";
  for (let i = 0; i < fragment.length; i++) {
    const child = fragment.get(i);
    if (child instanceof Y.XmlElement) {
      html += xmlElementToHtml(child);
    } else if (child instanceof Y.XmlText) {
      html += xmlTextToHtml(child);
    }
  }
  return html;
}

function xmlElementToHtml(element: Y.XmlElement): string {
  const tag = element.nodeName;
  const attrs = element.getAttributes();

  // Build attribute string
  let attrStr = "";
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "blockType" || key === "id") continue;
    if (typeof value === "string") {
      attrStr += ` ${key}="${escapeHtml(value)}"`;
    }
  }

  // Get inner content
  let inner = "";
  for (let i = 0; i < element.length; i++) {
    const child = element.get(i);
    if (child instanceof Y.XmlElement) {
      inner += xmlElementToHtml(child);
    } else if (child instanceof Y.XmlText) {
      inner += xmlTextToHtml(child);
    }
  }

  // Self-closing tags
  if (["br", "hr", "img"].includes(tag)) {
    return `<${tag}${attrStr} />`;
  }

  return `<${tag}${attrStr}>${inner}</${tag}>`;
}

function xmlTextToHtml(text: Y.XmlText): string {
  const delta = text.toDelta();
  let html = "";
  for (const op of delta) {
    if (typeof op.insert === "string") {
      let segment = escapeHtml(op.insert);
      const attrs = op.attributes as Record<string, unknown> | undefined;
      if (attrs?.bold) segment = `<strong>${segment}</strong>`;
      if (attrs?.italic) segment = `<em>${segment}</em>`;
      if (attrs?.underline) segment = `<u>${segment}</u>`;
      if (attrs?.strikethrough) segment = `<s>${segment}</s>`;
      if (attrs?.code) segment = `<code>${segment}</code>`;
      html += segment;
    }
  }
  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ============================================================================
// PUBLIC PAGE
// ============================================================================

export default async function PublicDocumentPage({ params }: PublicPageProps) {
  const { id } = await params;

  // Validate ID
  if (!id || id.length > 128 || /[/]/.test(id)) {
    notFound();
  }

  // Check that the document exists and is published
  const docSnap = await adminDb.collection(COLLECTIONS.DOCUMENTS).doc(id).get();

  if (!docSnap.exists) {
    notFound();
  }

  const docData = docSnap.data();
  if (!docData?.isPublished) {
    notFound();
  }

  const title = (docData.title as string) || "Untitled";
  const icon = (docData.icon as string | null) ?? null;
  const coverImage = (docData.coverImage as string | null) ?? null;

  // Fetch the Yjs binary from Liveblocks
  let contentHtml = "";
  try {
    const yjsData = await liveblocks.getYjsDocumentAsBinaryUpdate(id);
    const yDoc = new Y.Doc();
    Y.applyUpdate(yDoc, new Uint8Array(yjsData));
    contentHtml = yDocToText(yDoc);
    yDoc.destroy();
  } catch (error) {
    console.error("[public-page] Failed to fetch Yjs content:", error);
    contentHtml = "<p>Unable to load document content.</p>";
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Document content */}
      <article className="max-w-3xl mx-auto px-6 py-12">
        {/* Cover image */}
        {coverImage && (
          <div className="h-48 rounded-lg overflow-hidden bg-muted mb-8 -mx-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImage}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <PageIcon icon={icon} size="lg" />
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          </div>
        </header>

        {/* Content */}
        <div
          className="prose prose-sm sm:prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </article>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Built with{" "}
            <Link href="/" className="text-brand hover:underline font-medium">
              Spaces
            </Link>
          </p>
          <Link
            href="/"
            className="text-sm text-brand hover:underline font-medium"
          >
            Create your own
          </Link>
        </div>
      </footer>
    </div>
  );
}
