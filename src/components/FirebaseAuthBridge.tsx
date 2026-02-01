"use client";

import { useEffect, useRef } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { auth as firebaseAuth } from "@/firebase/firebaseConfig";

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
  const isInFlightRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(firebaseAuth, (user) => {
      // Signed out
      if (!user) {
        isInFlightRef.current = false;
        void clearServerSession();
        return;
      }

      // Always refresh the session on token change to keep server session in sync.
      // Only skip if a refresh is already in progress.
      if (isInFlightRef.current) return;
      isInFlightRef.current = true;

      void (async () => {
        try {
          const idToken = await user.getIdToken();
          await setServerSessionFromIdToken(idToken);
        } finally {
          isInFlightRef.current = false;
        }
      })();
    });

    return () => unsubscribe();
  }, []);

  return null;
}
