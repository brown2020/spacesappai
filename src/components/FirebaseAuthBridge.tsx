"use client";

import { useEffect, useRef } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { auth as firebaseAuth } from "@/firebase/firebaseConfig";
import { createSerialQueue } from "@/lib/serial-queue";
import {
  clearServerSession,
  setServerSessionFromIdToken,
} from "@/lib/sessionCookieClient";

export default function FirebaseAuthBridge() {
  const enqueueRef = useRef(createSerialQueue());

  useEffect(() => {
    const enqueue = enqueueRef.current;
    const unsubscribe = onIdTokenChanged(firebaseAuth, (user) => {
      void enqueue(async () => {
        if (!user) {
          await clearServerSession();
          return;
        }

        const uid = user.uid;
        try {
          const idToken = await user.getIdToken(/* forceRefresh */ true);
          // Drop the result when a later sign-out or account switch already ran.
          if (firebaseAuth.currentUser?.uid !== uid) return;
          const result = await setServerSessionFromIdToken(idToken);
          if (result === "rejected") return;
        } catch (error) {
          console.error("[FirebaseAuthBridge] Failed to sync session:", error);
        }
      });
    });

    return () => unsubscribe();
  }, []);

  return null;
}
