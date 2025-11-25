import { Liveblocks } from "@liveblocks/node";
import { serverEnv } from "@/lib/env";

// ============================================================================
// LIVEBLOCKS CLIENT
// ============================================================================

/**
 * Liveblocks server-side client
 * Used for room management and authentication
 */
function createLiveblocksClient(): Liveblocks {
  const secretKey = serverEnv.liveblocks.secretKey;

  if (!secretKey) {
    throw new Error(
      "LIVEBLOCKS_PRIVATE_KEY is required. Please add it to your environment variables."
    );
  }

  return new Liveblocks({ secret: secretKey });
}

export const liveblocks = createLiveblocksClient();
