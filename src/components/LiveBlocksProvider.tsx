"use client";

import { LiveblocksProvider } from "@liveblocks/react/suspense";

type Props = { children: React.ReactNode };

export default function LiveBlocksProvider({ children }: Props) {
  if (!process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY) {
    throw new Error("NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY is required");
  }

  return (
    <LiveblocksProvider throttle={16} authEndpoint={"/api/auth-endpoint"}>
      {children}
    </LiveblocksProvider>
  );
}
