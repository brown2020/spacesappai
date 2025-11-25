"use client";

import {
  ClientSideSuspense,
  RoomProvider as LiveblocksRoomProvider,
} from "@liveblocks/react/suspense";
import { ClipLoader } from "react-spinners";

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
      <div className="flex flex-col items-center gap-3">
        <ClipLoader size={40} color="#7c3aed" />
        <p className="text-sm text-gray-500">Loading document...</p>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function RoomProvider({ roomId, children }: RoomProviderProps) {
  return (
    <LiveblocksRoomProvider
      id={roomId}
      initialPresence={{ cursor: null }}
    >
      <ClientSideSuspense fallback={<LoadingFallback />}>
        {children}
      </ClientSideSuspense>
    </LiveblocksRoomProvider>
  );
}
