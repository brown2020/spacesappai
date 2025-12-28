"use client";

import { useEffect, useRef } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { auth as firebaseAuth } from "@/firebase/firebaseConfig";
import { migrateUserRoomsToUid } from "@/lib/migrations";

async function setServerSessionFromIdToken(idToken: string): Promise<void> {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) throw new Error("Failed to create session");
}

async function clearServerSession(): Promise<void> {
  await fetch("/api/auth/session", { method: "DELETE" }).catch(() => undefined);
}

export default function FirebaseAuthBridge() {
  const hasAuthedRef = useRef(false);
  const isInFlightRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(firebaseAuth, (user) => {
      // Signed out
      if (!user) {
        hasAuthedRef.current = false;
        isInFlightRef.current = false;
        void clearServerSession();
        return;
      }

      if (hasAuthedRef.current || isInFlightRef.current) return;
      isInFlightRef.current = true;

      void (async () => {
        try {
          const idToken = await user.getIdToken();
          await setServerSessionFromIdToken(idToken);

          // One-time migration: move legacy rooms from users/{email} -> users/{uid}
          try {
            await migrateUserRoomsToUid();
          } catch (err) {
            // Migration is best-effort; never block app boot on it.
            console.warn(
              "[FirebaseAuthBridge] migrateUserRoomsToUid failed:",
              err
            );
          }

          hasAuthedRef.current = true;
        } finally {
          isInFlightRef.current = false;
        }
      })();
    });

    return () => unsubscribe();
  }, []);

  return null;
}
