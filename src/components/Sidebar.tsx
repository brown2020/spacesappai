"use client";

import { useState } from "react";
import { MenuIcon, FileText } from "lucide-react";
import { useUserDocuments } from "@/hooks";
import NewDocumentButton from "./NewDocumentButton";
import SidebarOption from "./SidebarOption";
import ClientOnly from "./ClientOnly";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// ============================================================================
// LOADING SKELETON
// ============================================================================

function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-9 bg-muted animate-pulse rounded-md"
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// EMPTY STATE
// ============================================================================

function EmptyState() {
  return (
    <div className="text-center py-6">
      <div className="mb-3 inline-flex p-3 rounded-full bg-muted">
        <FileText className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground text-sm mb-4">
        No documents yet
      </p>
      <NewDocumentButton variant="outline" size="sm" />
    </div>
  );
}

// ============================================================================
// SIDEBAR MENU CONTENT
// ============================================================================

function SidebarMenuContent() {
  const { documents, isEmpty, isLoading, error } = useUserDocuments();

  return (
    <div className="flex flex-col gap-4">
      <NewDocumentButton />

      <nav className="flex flex-col gap-4 md:max-w-36">
        {isLoading && <LoadingSkeleton />}

        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
            <p className="text-destructive text-sm font-medium">
              Failed to load documents
            </p>
            <p className="text-destructive/80 text-xs mt-1 break-words">
              {error.message}
            </p>
            <p className="text-destructive/80 text-xs mt-2">
              If this is &quot;permission-denied&quot;, deploy `firestore.rules` to your Firebase project.
            </p>
          </div>
        )}

        {!isLoading && !error && isEmpty && <EmptyState />}

        {/* My Documents Section */}
        {!isLoading && documents.owner.length > 0 && (
          <section>
            <h2 className="text-muted-foreground font-semibold text-sm mb-2">
              My Documents
            </h2>
            <ul className="flex flex-col gap-2">
              {documents.owner.map((doc) =>
                doc.id ? (
                  <li key={doc.id}>
                    <SidebarOption href={`/doc/${doc.id}`} id={doc.id} />
                  </li>
                ) : null
              )}
            </ul>
          </section>
        )}

        {/* Shared With Me Section */}
        {!isLoading && documents.editor.length > 0 && (
          <section>
            <h2 className="text-muted-foreground font-semibold text-sm mb-2">
              Shared with me
            </h2>
            <ul className="flex flex-col gap-2">
              {documents.editor.map((doc) =>
                doc.id ? (
                  <li key={doc.id}>
                    <SidebarOption href={`/doc/${doc.id}`} id={doc.id} />
                  </li>
                ) : null
              )}
            </ul>
          </section>
        )}
      </nav>
    </div>
  );
}

// ============================================================================
// MENU BUTTON PLACEHOLDER
// ============================================================================

function MenuButtonPlaceholder() {
  return (
    <button
      className="p-2 hover:bg-muted rounded-lg transition-colors"
      aria-label="Open menu"
    >
      <MenuIcon size={24} />
    </button>
  );
}

// ============================================================================
// MOBILE SIDEBAR
// ============================================================================

function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <MenuIcon size={24} />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          {/* Only render content (and trigger data fetch) when sheet is open */}
          {isOpen && <SidebarMenuContent />}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ============================================================================
// MAIN SIDEBAR COMPONENT
// ============================================================================

export default function Sidebar() {
  return (
    <aside className="p-2 md:p-5 bg-muted relative shrink-0">
      {/* Mobile: Sheet drawer - wrapped in ClientOnly to prevent hydration mismatch */}
      <div className="md:hidden">
        <ClientOnly fallback={<MenuButtonPlaceholder />}>
          <MobileSidebar />
        </ClientOnly>
      </div>

      {/* Desktop: Always visible sidebar */}
      <div className="hidden md:block">
        <SidebarMenuContent />
      </div>
    </aside>
  );
}
