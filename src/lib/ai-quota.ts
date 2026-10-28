import { adminDb } from "@/firebase/firebaseAdmin";
import { COLLECTIONS } from "@/firebase/firebaseConfig";
import { evaluateAiQuota, type AiWindowState } from "@/lib/ai-guards";

/**
 * Consume one AI request for this user. Fails closed when the counter
 * cannot be updated. The row lives under users/{uid}/private, which client
 * rules do not allow.
 */
export async function consumeAiQuota(uid: string): Promise<boolean> {
  const ref = adminDb
    .collection(COLLECTIONS.USERS)
    .doc(uid)
    .collection("private")
    .doc("aiRateLimit");

  return adminDb.runTransaction(async (transaction) => {
    const snap = await transaction.get(ref);
    const data = snap.data();
    const state: AiWindowState | null = data
      ? {
          windowStartMs:
            typeof data.windowStartMs === "number" ? data.windowStartMs : 0,
          count: typeof data.count === "number" ? data.count : 0,
        }
      : null;
    const decision = evaluateAiQuota(state, Date.now());
    if (!decision.allowed) return false;
    transaction.set(ref, decision.next, { merge: true });
    return true;
  });
}
