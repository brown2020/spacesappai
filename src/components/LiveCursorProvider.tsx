"use client";

import { useCallback } from "react";
import { useMyPresence, useOthers } from "@liveblocks/react/suspense";
import FollowPointer from "./FollowPointer";
import type { ChildrenProps } from "@/types";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LiveCursorProvider({ children }: ChildrenProps) {
  const [, updateMyPresence] = useMyPresence();
  const others = useOthers();

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      updateMyPresence({
        cursor: {
          x: Math.floor(e.pageX),
          y: Math.floor(e.pageY),
        },
      });
    },
    [updateMyPresence]
  );

  const handlePointerLeave = useCallback(() => {
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);

  // Filter to only users with active cursors
  const usersWithCursors = others.filter(
    (other) => other.presence?.cursor !== null
  );

  return (
    <div onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}>
      {/* Render other users' cursors */}
      {usersWithCursors.map(({ connectionId, presence, info }) => (
        <FollowPointer
          key={connectionId}
          info={info}
          x={presence.cursor?.x ?? 0}
          y={presence.cursor?.y ?? 0}
        />
      ))}

      {children}
    </div>
  );
}
