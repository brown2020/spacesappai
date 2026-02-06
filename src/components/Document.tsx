"use client";

import { FormEvent, useState, useCallback } from "react";
import { toast } from "sonner";
import { useDocumentTitle, useDocumentIcon, useOwner } from "@/hooks";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Editor from "./Editor";
import DeleteDocument from "./DeleteDocument";
import ShareMenu from "./ShareMenu";
import LiveCursorProvider from "./LiveCursorProvider";
import Avatars from "./Avatars";
import { DocumentErrorBoundary } from "./ErrorBoundary";
import CommentsPanel, { CommentsButton } from "./Comments";
import DocumentCover from "./DocumentCover";
import EmojiPicker from "./EmojiPicker";
import PageIcon from "./PageIcon";
import { useComments } from "@/hooks";

// ============================================================================
// DOCUMENT HEADER
// ============================================================================

interface DocumentHeaderProps {
  documentId: string;
}

function DocumentHeader({ documentId }: DocumentHeaderProps) {
  const { title, setTitle, updateTitle, isUpdating } =
    useDocumentTitle(documentId);
  const { icon, updateIcon } = useDocumentIcon(documentId);
  const { isOwner, canEdit, isReady } = useOwner();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await updateTitle();
    } catch (err) {
      console.error("[DocumentHeader] Failed to update title:", err);
      toast.error("Failed to update title. Please try again.");
    }
  };

  const handleIconSelect = useCallback(
    async (newIcon: string) => {
      try {
        await updateIcon(newIcon);
      } catch (err) {
        console.error("[DocumentHeader] Failed to update icon:", err);
        toast.error("Failed to update icon. Please try again.");
      }
    },
    [updateIcon]
  );

  const handleIconRemove = useCallback(async () => {
    try {
      await updateIcon(null);
    } catch (err) {
      console.error("[DocumentHeader] Failed to remove icon:", err);
      toast.error("Failed to remove icon. Please try again.");
    }
  }, [updateIcon]);

  return (
    <div className="flex max-w-6xl mx-auto justify-between pb-5">
      <div className="flex flex-1 gap-2 items-center">
        {/* Icon picker — only for users who can edit */}
        {canEdit ? (
          <EmojiPicker
            onSelect={handleIconSelect}
            onRemove={handleIconRemove}
            currentEmoji={icon}
          >
            <button
              type="button"
              className="flex items-center justify-center w-10 h-10 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label="Choose page icon"
            >
              <PageIcon icon={icon} size="md" />
            </button>
          </EmojiPicker>
        ) : (
          <div className="flex items-center justify-center w-10 h-10">
            <PageIcon icon={icon} size="md" />
          </div>
        )}

        {canEdit ? (
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

            {/* Share menu for all users, delete for owners only */}
            {isReady && (
              <>
                <ShareMenu />
                {isOwner && <DeleteDocument />}
              </>
            )}
          </form>
        ) : (
          <h1 className="text-lg font-semibold truncate flex-1">
            {title || "Untitled"}
          </h1>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// DOCUMENT TOOLBAR
// ============================================================================

interface DocumentToolbarProps {
  showAvatars: boolean;
  onToggleComments: () => void;
  commentCount: number;
}

function DocumentToolbar({ showAvatars, onToggleComments, commentCount }: DocumentToolbarProps) {
  return (
    <div className="flex max-w-6xl mx-auto justify-between items-center mb-5">
      <CommentsButton onClick={onToggleComments} count={commentCount} />
      {showAvatars ? <Avatars /> : <div />}
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
  const [commentsOpen, setCommentsOpen] = useState(false);
  const { count: commentCount } = useComments(id);

  // Stable callback to prevent re-renders
  const handleEditorReady = useCallback(() => {
    setIsEditorReady(true);
  }, []);

  const handleToggleComments = useCallback(() => {
    setCommentsOpen((prev) => !prev);
  }, []);

  return (
    <article className="flex-1 h-full bg-background p-5">
      <DocumentCover documentId={id} />
      <DocumentHeader documentId={id} />
      <DocumentToolbar
        showAvatars={isEditorReady}
        onToggleComments={handleToggleComments}
        commentCount={commentCount}
      />

      <hr className="pb-10" />

      <DocumentErrorBoundary>
        <LiveCursorProvider>
          <Editor onReady={handleEditorReady} />
        </LiveCursorProvider>
      </DocumentErrorBoundary>

      <CommentsPanel isOpen={commentsOpen} onClose={() => setCommentsOpen(false)} />
    </article>
  );
}
