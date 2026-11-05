"use client";

import { useEffect, useState } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { auth as firebaseAuth } from "@/firebase/firebaseConfig";
import { createSerialQueue } from "@/lib/serial-queue";
import { syncObservedAuthUser } from "@/lib/sessionCookieClient";

export default function FirebaseAuthBridge() {
  const [enqueue] = useState(createSerialQueue);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(firebaseAuth, (user) => {
      void enqueue(async () => {
        try {
          await syncObservedAuthUser(firebaseAuth, user);
        } catch (error) {
          console.error("[FirebaseAuthBridge] Failed to sync session:", error);
        }
      });
    });

    return () => unsubscribe();
  }, [enqueue]);

  return null;
}
