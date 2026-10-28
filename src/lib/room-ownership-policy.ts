export const MAX_OWNER_CANDIDATES = 50;

export type PromotionDecision = "noop" | "promote" | "create-from-legacy";

/**
 * Decide whether the current member may become the canonical owner.
 * Viewers are not promoted. A verified email match against a legacy owner
 * row is the only path that creates a new uid entry or lifts a viewer.
 * Too many owner rows to inspect is fail-closed.
 */
export function decideOwnershipPromotion(input: {
  hasCanonicalOwner: boolean;
  ownerCandidateCount: number;
  hasVerifiedLegacyMatch: boolean;
  currentRole: "owner" | "editor" | "viewer" | null;
}): PromotionDecision {
  if (input.hasCanonicalOwner) return "noop";
  if (input.ownerCandidateCount > MAX_OWNER_CANDIDATES) return "noop";
  if (input.ownerCandidateCount > 0 && !input.hasVerifiedLegacyMatch) return "noop";

  if (input.currentRole === "owner") return "noop";
  if (input.currentRole === "editor") return "promote";
  if (input.hasVerifiedLegacyMatch && input.currentRole === "viewer") return "promote";
  if (input.hasVerifiedLegacyMatch && input.currentRole === null) return "create-from-legacy";
  return "noop";
}
