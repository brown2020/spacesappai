"use client";

import { FormEvent, useState } from "react";
import { useDocumentTitle, useOwner } from "@/hooks";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Editor from "./Editor";
import DeleteDocument from "./DeleteDocument";
import InviteUser from "./InviteUser";
import ManageUsers from "./ManageUsers";
import LiveCursorProvider from "./LiveCursorProvider";
import Avatars from "./Avatars";

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateTitle();
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

  const handleEditorReady = () => {
    setIsEditorReady(true);
  };

  return (
    <article className="flex-1 h-full bg-white p-5">
      <DocumentHeader documentId={id} />
      <DocumentToolbar showAvatars={isEditorReady} />

      <hr className="pb-10" />

      {/* Render editor with live cursors once ready */}
      {isEditorReady ? (
        <LiveCursorProvider>
          <Editor />
        </LiveCursorProvider>
      ) : (
        <Editor onReady={handleEditorReady} />
      )}
    </article>
  );
}
