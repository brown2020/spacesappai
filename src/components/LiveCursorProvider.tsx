"use client";

import { useCallback, useEffect } from "react";
import { useMyPresence, useOthers } from "@liveblocks/react/suspense";
import { AnimatePresence } from "framer-motion";
import FollowPointer from "./FollowPointer";
import type { ChildrenProps } from "@/types";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LiveCursorProvider({ children }: ChildrenProps) {
  const [, updateMyPresence] = useMyPresence();
  const others = useOthers();

  // Clear cursor presence on unmount to prevent stale cursors for other users
  useEffect(() => {
    return () => {
      updateMyPresence({ cursor: null });
    };
  }, [updateMyPresence]);

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

  // Filter to only users with active cursors (handles both null and undefined)
  const usersWithCursors = others.filter(
    (other) => other.presence?.cursor != null
  );

  return (
    <div onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}>
      {/* Render other users' cursors with exit animations */}
      <AnimatePresence>
        {usersWithCursors.map(({ connectionId, presence, info }) => (
          <FollowPointer
            key={connectionId}
            info={info}
            x={presence.cursor?.x ?? 0}
            y={presence.cursor?.y ?? 0}
          />
        ))}
      </AnimatePresence>

      {children}
    </div>
  );
}
