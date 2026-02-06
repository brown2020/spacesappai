"use client";

import { useState, useTransition, useCallback } from "react";
import { useRoom } from "@liveblocks/react/suspense";
import { toast } from "sonner";
import { Share2, Copy, Globe, Check, AlertCircle, X } from "lucide-react";
import { useRoomUsers, useOwner, useIsMounted } from "@/hooks";
import {
  inviteUserToDocument,
  removeUserFromDocument,
  updateUserRole,
  togglePublishDocument,
} from "@/lib/documentActions";
import { isValidEmail, normalizeEmail, cn } from "@/lib/utils";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { doc } from "firebase/firestore";
import { db, COLLECTIONS } from "@/firebase/firebaseConfig";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import type { RoomRole } from "@/types";

// ============================================================================
// INVITE SECTION
// ============================================================================

interface InviteSectionProps {
  roomId: string;
}

function InviteSection({ roomId }: InviteSectionProps) {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<RoomRole>("editor");
  const [error, setError] = useState("");

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    startTransition(async () => {
      const result = await inviteUserToDocument(
        roomId,
        normalizeEmail(email),
        role
      );

      if (result.success) {
        setEmail("");
        setRole("editor");
        toast.success(`Invited ${email} as ${role}`);
      } else {
        setError(result.error.message);
      }
    });
  };

  return (
    <form onSubmit={handleInvite} className="space-y-2">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          disabled={isPending}
          className={cn(
            "flex-1 h-9 text-sm",
            error && "border-destructive"
          )}
        />
        <Select value={role} onValueChange={(v) => setRole(v as RoomRole)}>
          <SelectTrigger className="w-24 h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" size="sm" disabled={!email || isPending} className="h-9">
          {isPending ? "..." : "Invite"}
        </Button>
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </form>
  );
}

// ============================================================================
// USER LIST
// ============================================================================

interface UserListProps {
  roomId: string;
  isOwner: boolean;
}

function UserList({ roomId, isOwner }: UserListProps) {
  const { users, currentUserId } = useRoomUsers(roomId);
  const [, startTransition] = useTransition();
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const isMountedRef = useIsMounted();

  const handleRoleChange = useCallback(
    (userId: string, newRole: RoomRole) => {
      startTransition(async () => {
        const result = await updateUserRole(roomId, userId, newRole);
        if (isMountedRef.current) {
          if (result.success) {
            toast.success("Role updated");
          } else {
            toast.error(result.error.message);
          }
        }
      });
    },
    [roomId, isMountedRef]
  );

  const handleRemove = useCallback(
    (userId: string) => {
      setRemovingUserId(userId);
      startTransition(async () => {
        try {
          const result = await removeUserFromDocument(roomId, userId);
          if (isMountedRef.current) {
            if (result.success) {
              toast.success("User removed");
            } else {
              toast.error(result.error.message);
            }
          }
        } finally {
          if (isMountedRef.current) setRemovingUserId(null);
        }
      });
    },
    [roomId, isMountedRef]
  );

  if (users.length === 0) {
    return (
      <p className="text-muted-foreground text-sm text-center py-3">
        No users found
      </p>
    );
  }

  return (
    <div className="divide-y max-h-48 overflow-y-auto">
      {users.map((user) => {
        const isCurrentUser = user.userId === currentUserId;
        const displayName = isCurrentUser
          ? `You (${user.userEmail || user.userId})`
          : user.userEmail || user.userId;
        const canChangeRole = isOwner && !isCurrentUser && user.role !== "owner";
        const canRemove = isOwner && !isCurrentUser;

        return (
          <div key={user.userId} className="flex items-center justify-between py-2">
            <p className="text-sm truncate flex-1 mr-2">{displayName}</p>

            <div className="flex items-center gap-1.5 shrink-0">
              {canChangeRole ? (
                <Select
                  value={user.role}
                  onValueChange={(v) => handleRoleChange(user.userId, v as RoomRole)}
                >
                  <SelectTrigger className="h-7 w-24 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <span className="px-2 py-1 text-xs bg-muted rounded-md capitalize">
                  {user.role}
                </span>
              )}

              {canRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemove(user.userId)}
                  disabled={removingUserId === user.userId}
                  aria-label={`Remove ${user.userId}`}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// PUBLISH SECTION
// ============================================================================

interface PublishSectionProps {
  roomId: string;
  isPublished: boolean;
  isOwner: boolean;
}

function PublishSection({ roomId, isPublished, isOwner }: PublishSectionProps) {
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/doc/${roomId}/public`
    : "";

  const handleToggle = () => {
    startTransition(async () => {
      const result = await togglePublishDocument(roomId, !isPublished);
      if (result.success) {
        toast.success(isPublished ? "Document unpublished" : "Document published");
      } else {
        toast.error(result.error.message);
      }
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Publish to web</p>
            <p className="text-xs text-muted-foreground">
              {isPublished
                ? "Anyone with the link can view"
                : "Share a read-only link with anyone"}
            </p>
          </div>
        </div>
        {isOwner && (
          <Button
            variant={isPublished ? "default" : "outline"}
            size="sm"
            onClick={handleToggle}
            disabled={isPending}
            className="shrink-0"
          >
            {isPending ? "..." : isPublished ? "Published" : "Publish"}
          </Button>
        )}
      </div>

      {isPublished && (
        <div className="flex gap-2">
          <Input
            readOnly
            value={publicUrl}
            className="h-8 text-xs bg-muted"
            onFocus={(e) => e.target.select()}
          />
          <Button
            variant="outline"
            size="sm"
            className="h-8 shrink-0"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN SHARE MENU
// ============================================================================

export default function ShareMenu() {
  const room = useRoom();
  const roomId = room.id;
  const { isOwner, isReady } = useOwner();

  const docRef = doc(db, COLLECTIONS.DOCUMENTS, roomId);
  const [data] = useDocumentData(docRef);
  const isPublished = !!data?.isPublished;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share document</DialogTitle>
          <DialogDescription>
            Manage access and sharing for this document.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Invite section — owner only */}
          {isReady && isOwner && (
            <div>
              <h3 className="text-sm font-medium mb-2">Invite people</h3>
              <InviteSection roomId={roomId} />
            </div>
          )}

          {/* People with access */}
          <div>
            <h3 className="text-sm font-medium mb-2">People with access</h3>
            <UserList roomId={roomId} isOwner={isOwner} />
          </div>

          {/* Publish section */}
          <div className="border-t pt-4">
            <PublishSection
              roomId={roomId}
              isPublished={isPublished}
              isOwner={isOwner}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
