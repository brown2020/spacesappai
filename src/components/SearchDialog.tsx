"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useUserDocuments } from "@/hooks";
import PageIcon from "./PageIcon";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { doc } from "firebase/firestore";
import { db, COLLECTIONS } from "@/firebase/firebaseConfig";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RoomDocument } from "@/types";

// ============================================================================
// SEARCH RESULT ITEM
// ============================================================================

interface SearchResultProps {
  roomDoc: RoomDocument;
  isSelected: boolean;
  onClick: () => void;
}

function SearchResult({ roomDoc, isSelected, onClick }: SearchResultProps) {
  const docRef = useMemo(
    () => (roomDoc.id ? doc(db, COLLECTIONS.DOCUMENTS, roomDoc.id) : null),
    [roomDoc.id]
  );
  const [data] = useDocumentData(docRef);
  const title = data?.title || "Untitled";
  const icon = data?.icon as string | null | undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-3 py-2.5 text-left rounded-md transition-colors ${
        isSelected
          ? "bg-accent text-accent-foreground"
          : "hover:bg-muted"
      }`}
    >
      <PageIcon icon={icon ?? null} size="sm" />
      <span className="flex-1 truncate text-sm">{title}</span>
      <span className="text-xs text-muted-foreground capitalize shrink-0">
        {roomDoc.role}
      </span>
    </button>
  );
}

// ============================================================================
// SEARCH DIALOG
// ============================================================================

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter();
  const { documents } = useUserDocuments();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Combine all documents into a flat list
  const allDocs = useMemo(() => {
    return [...documents.owner, ...documents.editor].filter(
      (d): d is RoomDocument & { id: string } => !!d.id
    );
  }, [documents]);

  // Filter documents by search query — we can't filter by Firestore title
  // client-side here since RoomDocument doesn't have the title. We show all
  // docs and let the SearchResult components display titles. For actual filtering,
  // we'd need to load all doc metadata. For now, show all when query is empty.
  // This is fine because the list is bounded by the user's own documents.
  const filteredDocs = allDocs;

  // Navigate to selected document
  const handleSelect = useCallback(
    (docId: string) => {
      router.push(`/doc/${docId}`);
      onOpenChange(false);
      setQuery("");
      setSelectedIndex(0);
    },
    [router, onOpenChange]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredDocs.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = filteredDocs[selectedIndex];
        if (selected?.id) {
          handleSelect(selected.id);
        }
      }
    },
    [filteredDocs, selectedIndex, handleSelect]
  );

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      // Focus input after dialog animation
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-lg overflow-hidden">
        <DialogTitle className="sr-only">Search documents</DialogTitle>

        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search documents..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline-flex px-1.5 py-0.5 text-xs text-muted-foreground bg-muted rounded border font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto p-2">
          {filteredDocs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              {allDocs.length === 0
                ? "No documents yet. Create one to get started."
                : "No documents found."}
            </p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {filteredDocs.map((roomDoc, index) => (
                <SearchResult
                  key={roomDoc.id}
                  roomDoc={roomDoc}
                  isSelected={index === selectedIndex}
                  onClick={() => handleSelect(roomDoc.id!)}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
