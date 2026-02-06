"use client";

import { useState, useCallback, useMemo, useTransition } from "react";
import { ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { doc } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { db, COLLECTIONS } from "@/firebase/firebaseConfig";
import { updateDocumentCover } from "@/lib/documentActions";
import { useOwner } from "@/hooks";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

// ============================================================================
// COVER URL INPUT
// ============================================================================

interface CoverUrlInputProps {
  onSubmit: (url: string) => void;
  isPending: boolean;
}

function CoverUrlInput({ onSubmit, isPending }: CoverUrlInputProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    try {
      new URL(trimmed);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    onSubmit(trimmed);
    setUrl("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="url"
        placeholder="Paste image URL..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={isPending}
        className="h-8 text-sm"
        autoFocus
      />
      <Button type="submit" size="sm" disabled={!url.trim() || isPending} className="h-8">
        {isPending ? "..." : "Set"}
      </Button>
    </form>
  );
}

// ============================================================================
// DOCUMENT COVER
// ============================================================================

interface DocumentCoverProps {
  documentId: string;
}

export default function DocumentCover({ documentId }: DocumentCoverProps) {
  const docRef = useMemo(
    () => doc(db, COLLECTIONS.DOCUMENTS, documentId),
    [documentId]
  );
  const [data] = useDocumentData(docRef);
  const { canEdit } = useOwner();
  const [isPending, startTransition] = useTransition();
  const [showAddButton, setShowAddButton] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const coverImage = (data?.coverImage as string | null) ?? null;

  const handleSetCover = useCallback(
    (url: string) => {
      startTransition(async () => {
        const result = await updateDocumentCover(documentId, url);
        if (result.success) {
          setPopoverOpen(false);
        } else {
          toast.error(result.error.message);
        }
      });
    },
    [documentId]
  );

  const handleRemoveCover = useCallback(() => {
    startTransition(async () => {
      const result = await updateDocumentCover(documentId, null);
      if (!result.success) {
        toast.error(result.error.message);
      }
    });
  }, [documentId]);

  // No cover and not editable — render nothing
  if (!coverImage && !canEdit) {
    return null;
  }

  // No cover but editable — show "Add cover" on hover
  if (!coverImage) {
    return (
      <div
        className="max-w-6xl mx-auto mb-2"
        onMouseEnter={() => setShowAddButton(true)}
        onMouseLeave={() => !popoverOpen && setShowAddButton(false)}
      >
        <div className="h-8 flex items-center">
          {showAddButton && (
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground text-xs gap-1.5 h-7"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  Add cover
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <p className="text-sm font-medium mb-2">Cover image</p>
                <CoverUrlInput
                  onSubmit={handleSetCover}
                  isPending={isPending}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    );
  }

  // Has cover — show it with controls
  return (
    <div className="relative group max-w-6xl mx-auto mb-4">
      <div className="h-48 rounded-lg overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverImage}
          alt="Document cover"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Controls overlay — visible on hover for editors */}
      {canEdit && (
        <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="secondary" size="sm" className="h-7 text-xs shadow-sm">
                Change cover
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <p className="text-sm font-medium mb-2">Cover image</p>
              <CoverUrlInput
                onSubmit={handleSetCover}
                isPending={isPending}
              />
            </PopoverContent>
          </Popover>

          <Button
            variant="secondary"
            size="sm"
            className="h-7 w-7 p-0 shadow-sm"
            onClick={handleRemoveCover}
            disabled={isPending}
            aria-label="Remove cover"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
