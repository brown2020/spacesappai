"use client";

import { FormEvent, useState, useCallback } from "react";
import { toast } from "sonner";
import { useDocumentTitle, useOwner } from "@/hooks";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Editor from "./Editor";
import DeleteDocument from "./DeleteDocument";
import InviteUser from "./InviteUser";
import ManageUsers from "./ManageUsers";
import LiveCursorProvider from "./LiveCursorProvider";
import Avatars from "./Avatars";
import { DocumentErrorBoundary } from "./ErrorBoundary";

// ============================================================================
// DOCUMENT HEADER
// ============================================================================

interface DocumentHeaderProps {
  documentId: string;
}

function DocumentHeader({ documentId }: DocumentHeaderProps) {
  const { title, setTitle, updateTitle, isUpdating } =
    useDocumentTitle(documentId);
  const { isOwner } = useOwner();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await updateTitle();
    } catch (err) {
      console.error("[DocumentHeader] Failed to update title:", err);
      toast.error("Failed to update title. Please try again.");
    }
  };

  return (
    <div className="flex max-w-6xl mx-auto justify-between pb-5">
      <form className="flex flex-1 gap-2" onSubmit={handleSubmit}>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Document title"
          aria-label="Document title"
        />

        <Button disabled={isUpdating || !title.trim()} type="submit">
          {isUpdating ? "Updating..." : "Update"}
        </Button>

        {isOwner && (
          <>
            <InviteUser />
            <DeleteDocument />
          </>
        )}
      </form>
    </div>
  );
}

// ============================================================================
// DOCUMENT TOOLBAR
// ============================================================================

interface DocumentToolbarProps {
  showAvatars: boolean;
}

function DocumentToolbar({ showAvatars }: DocumentToolbarProps) {
  return (
    <div className="flex max-w-6xl mx-auto justify-between items-center mb-5">
      <ManageUsers />
      {showAvatars && <Avatars />}
    </div>
  );
}

// ============================================================================
// MAIN DOCUMENT COMPONENT
// ============================================================================

interface DocumentProps {
  id: string;
}

export default function Document({ id }: DocumentProps) {
  const [isEditorReady, setIsEditorReady] = useState(false);

  // Stable callback to prevent re-renders
  const handleEditorReady = useCallback(() => {
    setIsEditorReady(true);
  }, []);

  return (
    <article className="flex-1 h-full bg-white p-5">
      <DocumentHeader documentId={id} />
      <DocumentToolbar showAvatars={isEditorReady} />

      <hr className="pb-10" />

      {/* 
        Wrap editor in error boundary to prevent crashes from breaking the whole app
        Always render Editor inside LiveCursorProvider to prevent re-mounting
        The onReady callback is stable so it won't cause unnecessary re-renders
      */}
      <DocumentErrorBoundary>
        <LiveCursorProvider>
          <Editor onReady={handleEditorReady} />
        </LiveCursorProvider>
      </DocumentErrorBoundary>
    </article>
  );
}
