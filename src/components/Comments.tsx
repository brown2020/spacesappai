"use client";

import { useState, useTransition } from "react";
import { MessageSquare, Trash2, X, Send } from "lucide-react";
import { toast } from "sonner";
import { useRoom } from "@liveblocks/react/suspense";
import { useComments, useOwner } from "@/hooks";
import { addComment, deleteComment } from "@/lib/documentActions";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth as firebaseAuth } from "@/firebase/firebaseConfig";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import type { Comment } from "@/types";

// ============================================================================
// TIME FORMATTING
// ============================================================================

function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString();
}

// ============================================================================
// COMMENT ITEM
// ============================================================================

interface CommentItemProps {
  comment: Comment;
  currentUserId: string | undefined;
  isDocOwner: boolean;
  roomId: string;
  onDeleted: () => void;
}

function CommentItem({ comment, currentUserId, isDocOwner, roomId, onDeleted }: CommentItemProps) {
  const [isDeleting, startTransition] = useTransition();
  const canDelete = comment.authorId === currentUserId || isDocOwner;

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteComment(roomId, comment.id);
      if (result.success) {
        onDeleted();
      } else {
        toast.error(result.error.message);
      }
    });
  };

  const initials = comment.authorName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  return (
    <div className="group flex gap-3 py-3">
      <Avatar className="h-7 w-7 shrink-0 mt-0.5">
        <AvatarImage src={comment.authorAvatar} alt={comment.authorName} />
        <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium truncate">{comment.authorName}</span>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>
        <p className="text-sm text-foreground whitespace-pre-wrap break-words">
          {comment.content}
        </p>
      </div>

      {canDelete && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label="Delete comment"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// COMMENT INPUT
// ============================================================================

interface CommentInputProps {
  roomId: string;
  onAdded: () => void;
}

function CommentInput({ roomId, onAdded }: CommentInputProps) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    startTransition(async () => {
      const result = await addComment(roomId, content);
      if (result.success) {
        setContent("");
        onAdded();
      } else {
        toast.error(result.error.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        disabled={isPending}
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        maxLength={5000}
      />
      <Button
        type="submit"
        size="sm"
        variant="ghost"
        disabled={!content.trim() || isPending}
        className="h-8 w-8 p-0 shrink-0"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}

// ============================================================================
// COMMENTS PANEL
// ============================================================================

interface CommentsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommentsPanel({ isOpen, onClose }: CommentsPanelProps) {
  const room = useRoom();
  const roomId = room.id;
  const { comments, isLoading, error, count, refresh } = useComments(roomId);
  const { isOwner } = useOwner();
  const [user] = useAuthState(firebaseAuth);

  if (!isOpen) return null;

  return (
    <div className="fixed top-[65px] right-0 bottom-0 w-80 sm:w-96 bg-background border-l shadow-lg z-40 flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <h2 className="text-sm font-medium">Comments ({count})</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={onClose}
          aria-label="Close comments"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Comment list */}
      <div className="flex-1 overflow-y-auto px-4">
        {error ? (
          <div className="text-center py-8 px-2">
            <p className="text-sm text-destructive font-medium mb-1">Failed to load comments</p>
            <p className="text-xs text-muted-foreground break-words">{error}</p>
          </div>
        ) : isLoading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="h-7 w-7 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-full bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No comments yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Start a discussion.</p>
          </div>
        ) : (
          <div className="divide-y">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={user?.uid}
                isDocOwner={isOwner}
                roomId={roomId}
                onDeleted={refresh}
              />
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <CommentInput roomId={roomId} onAdded={refresh} />
    </div>
  );
}

// ============================================================================
// COMMENTS BUTTON (for toolbar)
// ============================================================================

interface CommentsButtonProps {
  onClick: () => void;
  count: number;
}

export function CommentsButton({ onClick, count }: CommentsButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="gap-1.5"
    >
      <MessageSquare className="h-4 w-4" />
      {count > 0 && (
        <span className="text-xs">{count}</span>
      )}
    </Button>
  );
}
