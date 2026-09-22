import { Liveblocks } from "@liveblocks/node";
import { serverEnv } from "@/lib/env";

// ============================================================================
// LIVEBLOCKS CLIENT
// ============================================================================

/**
 * Liveblocks server-side client
 * Used for room management and authentication.
 * Constructed lazily so `next build` can collect page data without secrets.
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

let client: Liveblocks | null = null;

export function getLiveblocks(): Liveblocks {
  if (!client) {
    client = createLiveblocksClient();
  }
  return client;
}

export const liveblocks: Liveblocks = new Proxy({} as Liveblocks, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getLiveblocks(), prop, receiver);
    return typeof value === "function" ? value.bind(getLiveblocks()) : value;
  },
});
