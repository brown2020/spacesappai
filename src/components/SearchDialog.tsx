"use client";

import { useState, useCallback, useEffect, useRef, useMemo, useReducer } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useUserDocuments } from "@/hooks";
import PageIcon from "./PageIcon";
import { doc, getDoc } from "firebase/firestore";
import { db, COLLECTIONS } from "@/firebase/firebaseConfig";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RoomDocument } from "@/types";

type SearchableDocument = RoomDocument & {
  id: string;
  title: string;
  icon: string | null;
};

// ============================================================================
// SEARCH RESULT ITEM
// ============================================================================

interface SearchResultProps {
  roomDoc: SearchableDocument;
  isSelected: boolean;
  onClick: () => void;
}

function SearchResult({ roomDoc, isSelected, onClick }: SearchResultProps) {
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
      <PageIcon icon={roomDoc.icon} size="sm" />
      <span className="flex-1 truncate text-sm">{roomDoc.title}</span>
      <span className="text-xs text-muted-foreground capitalize shrink-0">
        {roomDoc.role}
      </span>
    </button>
  );
}

// ============================================================================
// SEARCH DIALOG CONTENT (mounted only while open — fresh state, no reset effects)
// ============================================================================

interface SearchDialogContentProps {
  onOpenChange: (open: boolean) => void;
}

function SearchDialogContent({ onOpenChange }: SearchDialogContentProps) {
  const router = useRouter();
  const { documents } = useUserDocuments();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  type MetadataState = {
    status: "loading" | "ready" | "error";
    byId: Record<string, { title: string; icon: string | null }>;
  };
  type MetadataAction =
    | { type: "ready"; byId: MetadataState["byId"] }
    | { type: "error" };

  const [metadataState, dispatchMetadata] = useReducer(
    (_state: MetadataState, action: MetadataAction): MetadataState => {
      if (action.type === "ready") {
        return { status: "ready", byId: action.byId };
      }
      return { status: "error", byId: {} };
    },
    { status: "loading", byId: {} } satisfies MetadataState
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const allDocs = useMemo(() => {
    return [...documents.owner, ...documents.editor, ...documents.viewer].filter(
      (d): d is RoomDocument & { id: string } => !!d.id
    );
  }, [documents]);

  const allDocIds = useMemo(() => allDocs.map((roomDoc) => roomDoc.id), [allDocs]);
  const allDocsKey = allDocIds.join("|");

  useEffect(() => {
    let isCancelled = false;

    async function loadMetadata() {
      if (allDocs.length === 0) {
        if (!isCancelled) {
          dispatchMetadata({ type: "ready", byId: {} });
        }
        return;
      }

      try {
        const entries = await Promise.all(
          allDocs.map(async (roomDoc) => {
            const docRef = doc(db, COLLECTIONS.DOCUMENTS, roomDoc.id);
            const snapshot = await getDoc(docRef);
            const data = snapshot.data();
            const rawTitle = data?.title;
            const title =
              typeof rawTitle === "string" && rawTitle.trim()
                ? rawTitle
                : "Untitled";
            const rawIcon = data?.icon;
            const icon = typeof rawIcon === "string" ? rawIcon : null;

            return [roomDoc.id, { title, icon }] as const;
          })
        );

        if (!isCancelled) {
          dispatchMetadata({
            type: "ready",
            byId: Object.fromEntries(entries),
          });
        }
      } catch (error) {
        console.error("[SearchDialog] Failed to load document metadata:", error);
        if (!isCancelled) {
          dispatchMetadata({ type: "error" });
        }
      }
    }

    void loadMetadata();

    return () => {
      isCancelled = true;
    };
    // allDocsKey captures identity of the document set without depending on array ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDocsKey]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);

  const searchableDocs = useMemo<SearchableDocument[]>(() => {
    return allDocs.map((roomDoc) => {
      const metadata = metadataState.byId[roomDoc.id];
      return {
        ...roomDoc,
        title: metadata?.title ?? "Untitled",
        icon: metadata?.icon ?? null,
      };
    });
  }, [allDocs, metadataState.byId]);

  const filteredDocs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return searchableDocs;

    return searchableDocs.filter((roomDoc) => {
      return (
        roomDoc.title.toLowerCase().includes(normalizedQuery) ||
        roomDoc.role.toLowerCase().includes(normalizedQuery) ||
        roomDoc.id.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query, searchableDocs]);

  const clampedSelectedIndex =
    filteredDocs.length === 0
      ? 0
      : Math.min(selectedIndex, filteredDocs.length - 1);

  const handleSelect = useCallback(
    (docId: string) => {
      router.push(`/doc/${docId}`);
      onOpenChange(false);
    },
    [router, onOpenChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) =>
          filteredDocs.length === 0
            ? 0
            : Math.min(i + 1, filteredDocs.length - 1)
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = filteredDocs[clampedSelectedIndex];
        if (selected?.id) {
          handleSelect(selected.id);
        }
      }
    },
    [filteredDocs, clampedSelectedIndex, handleSelect]
  );

  const isLoadingMetadata = metadataState.status === "loading";

  return (
    <DialogContent className="p-0 gap-0 max-w-lg overflow-hidden">
      <DialogTitle className="sr-only">Search documents</DialogTitle>

      <div className="flex items-center gap-3 px-4 py-3 border-b">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
        <label htmlFor="search-documents" className="sr-only">
          Search documents
        </label>
        <input
          id="search-documents"
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

      <div className="max-h-72 overflow-y-auto p-2">
        {filteredDocs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            {isLoadingMetadata
              ? "Loading documents..."
              : allDocIds.length === 0
              ? "No documents yet. Create one to get started."
              : "No documents found."}
          </p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {filteredDocs.map((roomDoc, index) => (
              <SearchResult
                key={roomDoc.id}
                roomDoc={roomDoc}
                isSelected={index === clampedSelectedIndex}
                onClick={() => handleSelect(roomDoc.id!)}
              />
            ))}
          </div>
        )}
      </div>
    </DialogContent>
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? <SearchDialogContent onOpenChange={onOpenChange} /> : null}
    </Dialog>
  );
}
