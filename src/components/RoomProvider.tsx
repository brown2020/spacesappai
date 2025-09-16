"use client";

import {
  ClientSideSuspense,
  RoomProvider as RoomProviderWrapper,
} from "@liveblocks/react/suspense";

import { ClipLoader } from "react-spinners";

type Props = { roomId: string; children: React.ReactNode };
export default function RoomProvider({ roomId, children }: Props) {
  return (
    <RoomProviderWrapper id={roomId} initialPresence={{ cursor: null }}>
      <ClientSideSuspense
        fallback={
          <div className="flex w-full mx-auto items-center justify-center mt-10">
            <ClipLoader size={50} color="#4169E1" />
          </div>
        }
      >
        {children}
      </ClientSideSuspense>
    </RoomProviderWrapper>
  );
}
