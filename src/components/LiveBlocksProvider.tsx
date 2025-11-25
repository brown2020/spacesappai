"use client";

import { LiveblocksProvider } from "@liveblocks/react/suspense";
import { UI } from "@/constants";
import type { ChildrenProps } from "@/types";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LiveBlocksProvider({ children }: ChildrenProps) {
  // Validate that the public key exists
  if (!process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY) {
    throw new Error(
      "NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY is required. Please add it to your environment variables."
    );
  }

  return (
    <LiveblocksProvider
      throttle={UI.LIVEBLOCKS_THROTTLE}
      authEndpoint="/api/auth-endpoint"
    >
      {children}
    </LiveblocksProvider>
  );
}
