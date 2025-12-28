"use client";

import { useState } from "react";
import { MenuIcon } from "lucide-react";
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
// SIDEBAR MENU CONTENT
// ============================================================================

function SidebarMenuContent() {
  const { documents, isEmpty, isLoading, error } = useUserDocuments();

  return (
    <div className="flex flex-col gap-4">
      <NewDocumentButton />

      <nav className="flex flex-col gap-4 md:max-w-36">
        {isLoading && (
          <p className="text-gray-500 text-sm">Loading documents…</p>
        )}

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3">
            <p className="text-red-700 text-sm font-medium">
              Failed to load documents
            </p>
            <p className="text-red-700/80 text-xs mt-1 break-words">
              {error.message}
            </p>
            <p className="text-red-700/80 text-xs mt-2">
              If this is “permission-denied”, deploy `firestore.rules` to your Firebase project.
            </p>
          </div>
        )}

        {/* My Documents Section */}
        <section>
          <h2 className="text-gray-500 font-semibold text-sm mb-2">
            My Documents
          </h2>
          {documents.owner.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {documents.owner.map((doc) =>
                doc.id ? (
                  <li key={doc.id}>
                    <SidebarOption href={`/doc/${doc.id}`} id={doc.id} />
                  </li>
                ) : null
              )}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No documents yet</p>
          )}
        </section>

        {/* Shared With Me Section */}
        {documents.editor.length > 0 && (
          <section>
            <h2 className="text-gray-500 font-semibold text-sm mb-2">
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

        {isEmpty && (
          <p className="text-gray-400 text-sm italic">
            Create your first document to get started
          </p>
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
      className="p-2 hover:bg-gray-300 rounded-lg transition-colors"
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
          className="p-2 hover:bg-gray-300 rounded-lg transition-colors"
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
    <aside className="p-2 md:p-5 bg-gray-200 relative shrink-0">
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
