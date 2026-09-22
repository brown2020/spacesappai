"use client";

import { useEffect, useRef } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { auth as firebaseAuth } from "@/firebase/firebaseConfig";
import {
  clearServerSession,
  setServerSessionFromIdToken,
} from "@/lib/sessionCookieClient";

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
          const idToken = await user.getIdToken(/* forceRefresh */ true);
          await setServerSessionFromIdToken(idToken);
        } catch (error) {
          console.error("[FirebaseAuthBridge] Failed to sync session:", error);
        } finally {
          isInFlightRef.current = false;
        }
      })();
    });

    return () => unsubscribe();
  }, []);

  return null;
}
