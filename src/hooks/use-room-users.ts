"use client";

import { useMemo } from "react";
import { collectionGroup, query, where } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { useUser } from "@clerk/nextjs";
import { db } from "@/firebase/firebaseConfig";
import type { RoomDocument } from "@/types";

interface UseRoomUsersReturn {
  users: RoomDocument[];
  isLoading: boolean;
  error: Error | undefined;
  currentUserEmail: string | undefined;
}

/**
 * Hook for fetching users in a room
 */
export function useRoomUsers(roomId: string): UseRoomUsersReturn {
  const { user } = useUser();

  const [snapshot, isLoading, error] = useCollection(
    user
      ? query(collectionGroup(db, "rooms"), where("roomId", "==", roomId))
      : null
  );

  const users = useMemo(() => {
    if (!snapshot?.docs) return [];

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as RoomDocument[];
  }, [snapshot]);

  const currentUserEmail = user?.emailAddresses[0]?.toString();

  return {
    users,
    isLoading,
    error,
    currentUserEmail,
  };
}
