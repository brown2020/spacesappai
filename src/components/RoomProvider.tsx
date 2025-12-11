"use client";

import {
  ClientSideSuspense,
  RoomProvider as LiveblocksRoomProvider,
} from "@liveblocks/react/suspense";
import { SpinnerWithText } from "@/components/ui/spinner";

// ============================================================================
// TYPES
// ============================================================================

interface RoomProviderProps {
  roomId: string;
  children: React.ReactNode;
}

// ============================================================================
// LOADING FALLBACK
// ============================================================================

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center w-full min-h-[200px]">
      <SpinnerWithText size={40} text="Loading document..." />
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function RoomProvider({ roomId, children }: RoomProviderProps) {
  return (
    <LiveblocksRoomProvider id={roomId} initialPresence={{ cursor: null }}>
      <ClientSideSuspense fallback={<LoadingFallback />}>
        {children}
      </ClientSideSuspense>
    </LiveblocksRoomProvider>
  );
}
