"use client";

import { useCallback, useRef } from "react";
import { LiveblocksProvider } from "@liveblocks/react/suspense";
import { UI } from "@/constants";

interface LiveBlocksProviderProps {
  children: React.ReactNode;
  /**
   * Token minted while the document layout rendered. The first room connection
   * uses it once, then later connects go through /api/auth-endpoint.
   */
  initialToken?: { roomId: string; token: string } | null;
}

export default function LiveBlocksProvider({
  children,
  initialToken,
}: LiveBlocksProviderProps) {
  const initialTokenRef = useRef(initialToken);
  const consumedRoomRef = useRef<string | null>(null);

  const authEndpoint = useCallback(async (room?: string) => {
    const seeded = initialTokenRef.current;
    if (
      seeded?.token &&
      room &&
      room === seeded.roomId &&
      consumedRoomRef.current !== room
    ) {
      consumedRoomRef.current = room;
      return { token: seeded.token };
    }

    const response = await fetch("/api/auth-endpoint", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room }),
    });

    try {
      return await response.json();
    } catch {
      return {
        error: "unauthorized",
        reason: "Liveblocks authentication failed",
      };
    }
  }, []);

  return (
    <LiveblocksProvider
      throttle={UI.LIVEBLOCKS_THROTTLE}
      authEndpoint={initialToken?.token ? authEndpoint : "/api/auth-endpoint"}
    >
      {children}
    </LiveblocksProvider>
  );
}
