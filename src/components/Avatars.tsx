"use client";

import { useMemo } from "react";
import { useOthers, useSelf } from "@liveblocks/react/suspense";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

interface UniqueUser {
  id: string;
  name: string;
  avatar?: string;
  isSelf: boolean;
}

// ============================================================================
// AVATAR ITEM
// ============================================================================

interface AvatarItemProps {
  name: string;
  avatar?: string;
  isSelf: boolean;
}

/**
 * Single avatar item with tooltip
 * Note: Must be wrapped in TooltipProvider by parent
 */
function AvatarItem({ name, avatar, isSelf }: AvatarItemProps) {
  const displayName = isSelf ? "You" : name;
  const initials =
    name
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Avatar
          className={cn(
            "border-2 border-white cursor-pointer transition-transform hover:scale-110 hover:z-10",
            isSelf && "ring-2 ring-purple-500"
          )}
        >
          <AvatarImage src={avatar} alt={displayName} />
          <AvatarFallback className="bg-purple-100 text-purple-700 text-xs font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {displayName}
      </TooltipContent>
    </Tooltip>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Avatars() {
  const self = useSelf();
  const others = useOthers();

  // Deduplicate users - same user might have multiple connections (tabs)
  // Use a Map to keep only one entry per user ID
  const uniqueUsers = useMemo<UniqueUser[]>(() => {
    const userMap = new Map<string, UniqueUser>();

    // Add self first
    if (self) {
      userMap.set(self.id, {
        id: self.id,
        name: self.info?.name || "Anonymous",
        avatar: self.info?.avatar,
        isSelf: true,
      });
    }

    // Add others (will skip if already exists with same id)
    others.forEach((other) => {
      if (!userMap.has(other.id)) {
        userMap.set(other.id, {
          id: other.id,
          name: other.info?.name || "Anonymous",
          avatar: other.info?.avatar,
          isSelf: false,
        });
      }
    });

    return Array.from(userMap.values());
  }, [self, others]);

  if (uniqueUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-500 hidden sm:inline">
        {uniqueUsers.length === 1
          ? "Just you"
          : `${uniqueUsers.length} editing`}
      </span>

      {/* Single TooltipProvider wrapping all avatars for better performance */}
      <TooltipProvider delayDuration={100}>
        <div className="flex -space-x-3">
          {uniqueUsers.map((user) => (
            <AvatarItem
              key={user.id}
              name={user.name}
              avatar={user.avatar}
              isSelf={user.isSelf}
            />
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}
