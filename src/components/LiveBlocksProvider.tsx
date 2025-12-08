"use client";

import { LiveblocksProvider } from "@liveblocks/react/suspense";
import { UI } from "@/constants";
import type { ChildrenProps } from "@/types";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * LiveBlocksProvider wraps the app with Liveblocks context for real-time collaboration.
 * Uses authEndpoint for authentication, which means the server-side secret key is used
 * (not the public key). The auth endpoint at /api/auth-endpoint handles authentication
 * and room access control.
 */
export default function LiveBlocksProvider({ children }: ChildrenProps) {
  return (
    <LiveblocksProvider
      throttle={UI.LIVEBLOCKS_THROTTLE}
      authEndpoint="/api/auth-endpoint"
    >
      {children}
    </LiveblocksProvider>
  );
}
