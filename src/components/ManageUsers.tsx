"use client";

import { useState, useTransition } from "react";
import { useRoom } from "@liveblocks/react/suspense";
import { toast } from "sonner";
import { useRoomUsers, useOwner, useIsMounted } from "@/hooks";
import { removeUserFromDocument } from "@/lib/documentActions";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// ============================================================================
// USER LIST ITEM
// ============================================================================

interface UserListItemProps {
  userId: string;
  label: string;
  role: string;
  isCurrentUser: boolean;
  isOwner: boolean;
  onRemove: () => void;
  isRemoving: boolean;
}

function UserListItem({
  userId,
  label,
  role,
  isCurrentUser,
  isOwner,
  onRemove,
  isRemoving,
}: UserListItemProps) {
  const displayName = isCurrentUser ? `You (${label})` : label;
  const canRemove = isOwner && !isCurrentUser;

  return (
    <div className="flex items-center justify-between py-2">
      <p className="text-sm truncate flex-1">{displayName}</p>

      <div className="flex items-center gap-2 shrink-0">
        <span className="px-2 py-1 text-xs bg-muted rounded-md capitalize">
          {role}
        </span>

        {canRemove && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onRemove}
            disabled={isRemoving}
            aria-label={`Remove ${userId}`}
          >
            {isRemoving ? "..." : "×"}
          </Button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ManageUsers() {
  const room = useRoom();
  const { users, currentUserId } = useRoomUsers(room.id);
  const { isOwner } = useOwner();
  const [, startTransition] = useTransition();
  // Track which specific user is being removed
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useIsMounted();

  const handleRemoveUser = (userId: string) => {
    setRemovingUserId(userId);
    startTransition(async () => {
      try {
        const result = await removeUserFromDocument(room.id, userId);

        if (isMountedRef.current) {
          if (result.success) {
            toast.success("User removed successfully");
          } else {
            toast.error(result.error.message);
          }
        }
      } finally {
        if (isMountedRef.current) {
          setRemovingUserId(null);
        }
      }
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Users ({users.length})</Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Users with Access</DialogTitle>
          <DialogDescription>
            Users who can view and edit this document.
          </DialogDescription>
        </DialogHeader>

        <hr className="my-2" />

        <div className="max-h-64 overflow-y-auto">
          {users.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              No users found
            </p>
          ) : (
            <div className="divide-y">
              {users.map((user) => (
                <UserListItem
                  key={user.userId}
                  userId={user.userId}
                  label={user.userEmail || user.userId}
                  role={user.role}
                  isCurrentUser={user.userId === currentUserId}
                  isOwner={isOwner}
                  onRemove={() => handleRemoveUser(user.userId)}
                  isRemoving={removingUserId === user.userId}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
