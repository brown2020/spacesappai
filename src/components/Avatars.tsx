"use client";

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
// AVATAR ITEM
// ============================================================================

interface AvatarItemProps {
  name: string;
  avatar?: string;
  isSelf: boolean;
}

function AvatarItem({ name, avatar, isSelf }: AvatarItemProps) {
  const displayName = isSelf ? "You" : name;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <TooltipProvider delayDuration={100}>
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
    </TooltipProvider>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Avatars() {
  const self = useSelf();
  const others = useOthers();

  // Combine self with others, self first
  const allUsers = self ? [self, ...others] : others;

  if (allUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-500 hidden sm:inline">
        {allUsers.length === 1 ? "Just you" : `${allUsers.length} editing`}
      </span>

      <div className="flex -space-x-3">
        {allUsers.map((user) => (
          <AvatarItem
            key={user.id}
            name={user.info?.name || "Anonymous"}
            avatar={user.info?.avatar}
            isSelf={user.id === self?.id}
          />
        ))}
      </div>
    </div>
  );
}
