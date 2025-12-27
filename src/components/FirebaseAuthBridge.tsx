"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { signInWithCustomToken, signOut } from "firebase/auth";
import { auth as firebaseAuth } from "@/firebase/firebaseConfig";
import { migrateUserRoomsToUid } from "@/lib/migrations";

async function fetchFirebaseCustomToken(): Promise<string> {
  const res = await fetch("/api/firebase-token", { method: "POST" });
  if (!res.ok) throw new Error("Failed to fetch Firebase token");
  const data = (await res.json()) as { token?: string };
  if (!data.token) throw new Error("Firebase token missing");
  return data.token;
}

export default function FirebaseAuthBridge() {
  const { isLoaded, isSignedIn, user } = useUser();
  const hasAuthedRef = useRef(false);
  const isInFlightRef = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    // When signed out of Clerk, also sign out of Firebase Auth.
    if (!isSignedIn) {
      hasAuthedRef.current = false;
      isInFlightRef.current = false;
      void signOut(firebaseAuth).catch(() => undefined);
      return;
    }

    // Signed in but no user object yet.
    if (!user) return;

    if (hasAuthedRef.current || isInFlightRef.current) return;
    isInFlightRef.current = true;

    void (async () => {
      try {
        const token = await fetchFirebaseCustomToken();
        await signInWithCustomToken(firebaseAuth, token);

        // One-time migration: move legacy rooms from users/{email} -> users/{uid}
        await migrateUserRoomsToUid();

        hasAuthedRef.current = true;
      } finally {
        isInFlightRef.current = false;
      }
    })();
  }, [isLoaded, isSignedIn, user]);

  return null;
}


