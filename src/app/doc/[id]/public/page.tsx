import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { createElement, type ReactNode } from "react";
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
// YJS CONTENT HELPERS (sanitized React tree — no dangerouslySetInnerHTML)
// ============================================================================

function yDocToReact(yDoc: Y.Doc): ReactNode {
  const xmlFragment = yDoc.getXmlFragment("document-store");
  return <>{xmlFragmentToReact(xmlFragment)}</>;
}

function xmlFragmentToReact(fragment: Y.XmlFragment): ReactNode[] {
  const nodes: ReactNode[] = [];
  for (let i = 0; i < fragment.length; i++) {
    const child = fragment.get(i);
    if (child instanceof Y.XmlElement) {
      nodes.push(xmlElementToReact(child, i));
    } else if (child instanceof Y.XmlText) {
      nodes.push(xmlTextToReact(child, i));
    }
  }
  return nodes;
}

function xmlElementToReact(element: Y.XmlElement, key: number): ReactNode {
  const tag = element.nodeName;

  const children: ReactNode[] = [];
  for (let i = 0; i < element.length; i++) {
    const child = element.get(i);
    if (child instanceof Y.XmlElement) {
      children.push(xmlElementToReact(child, i));
    } else if (child instanceof Y.XmlText) {
      children.push(xmlTextToReact(child, i));
    }
  }

  if (!SAFE_TAGS.has(tag)) {
    return <span key={key}>{children}</span>;
  }

  const attrs = element.getAttributes();
  const allowedAttrs = SAFE_ATTRS[tag];
  const props: Record<string, string> = {};
  if (allowedAttrs) {
    for (const [attrKey, value] of Object.entries(attrs)) {
      if (!allowedAttrs.has(attrKey)) continue;
      if (typeof value === "string") {
        if (
          (attrKey === "href" || attrKey === "src") &&
          /^\s*(javascript|data):/i.test(value)
        ) {
          continue;
        }
        props[attrKey] = value;
      }
    }
  }

  if (tag === "br") {
    return <br key={key} />;
  }
  if (tag === "hr") {
    return <hr key={key} />;
  }

  if (tag === "img") {
    const src = props.src;
    if (!src || !src.startsWith("https://")) return null;
    return (
      <Image
        key={key}
        src={src}
        alt={props.alt ?? ""}
        width={props.width ? Number(props.width) || 800 : 800}
        height={props.height ? Number(props.height) || 450 : 450}
        unoptimized
        loader={({ src: s }) => s}
      />
    );
  }

  if (tag === "a") {
    return (
      <a key={key} href={props.href} title={props.title} rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return createElement(tag, { key }, ...children);
}

function xmlTextToReact(text: Y.XmlText, key: number): ReactNode {
  const delta = text.toDelta();
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const op of delta as Array<{ insert?: unknown; attributes?: Record<string, unknown> }>) {
    if (typeof op.insert !== "string") continue;
    const start = cursor;
    cursor += op.insert.length;
    const textKey = `t-${key}-${start}-${cursor}-${op.insert.length}`;
    let segment: ReactNode = op.insert;
    const attrs = op.attributes;
    if (attrs?.code) segment = <code>{segment}</code>;
    if (attrs?.bold) segment = <strong>{segment}</strong>;
    if (attrs?.italic) segment = <em>{segment}</em>;
    if (attrs?.underline) segment = <u>{segment}</u>;
    if (attrs?.strikethrough) segment = <s>{segment}</s>;
    parts.push(<span key={textKey}>{segment}</span>);
  }
  return <span key={key}>{parts}</span>;
}

const SAFE_TAGS = new Set([
  "p", "div", "span", "br", "hr",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "strong", "em", "u", "s", "code", "pre", "blockquote",
  "table", "thead", "tbody", "tr", "th", "td",
  "a", "img",
]);

const SAFE_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title"]),
  img: new Set(["src", "alt", "width", "height"]),
};

// ============================================================================
// METADATA
// ============================================================================

export async function generateMetadata({
  params,
}: PublicPageProps): Promise<Metadata> {
  const { id } = await params;
  if (!id || id.length > 128 || /[/]/.test(id)) {
    return { title: "Document" };
  }
  try {
    const docSnap = await adminDb.collection(COLLECTIONS.DOCUMENTS).doc(id).get();
    const title = (docSnap.data()?.title as string) || "Untitled";
    return {
      title,
      description: `Published document: ${title}`,
    };
  } catch {
    return { title: "Document" };
  }
}

// ============================================================================
// PUBLIC PAGE
// ============================================================================

export default async function PublicDocumentPage({ params }: PublicPageProps) {
  const { id } = await params;

  if (!id || id.length > 128 || /[/]/.test(id)) {
    notFound();
  }

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
  const rawCoverImage = (docData.coverImage as string | null) ?? null;
  const coverImage = rawCoverImage?.startsWith("https://") ? rawCoverImage : null;

  let content: ReactNode = <p>Unable to load document content.</p>;
  try {
    const yjsData = await liveblocks.getYjsDocumentAsBinaryUpdate(id);
    const yDoc = new Y.Doc();
    Y.applyUpdate(yDoc, new Uint8Array(yjsData));
    content = yDocToReact(yDoc);
    yDoc.destroy();
  } catch (error) {
    console.error("[public-page] Failed to fetch Yjs content:", error);
  }

  return (
    <div className="min-h-screen bg-background">
      <article className="max-w-3xl mx-auto px-6 py-12">
        {coverImage && (
          <div className="h-48 rounded-lg overflow-hidden bg-muted mb-8 -mx-2">
            <Image
              src={coverImage}
              alt=""
              width={1200}
              height={192}
              unoptimized
              loader={({ src }) => src}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <PageIcon icon={icon} size="lg" />
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          </div>
        </header>

        <div className="prose prose-sm sm:prose dark:prose-invert max-w-none">
          {content}
        </div>
      </article>

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
