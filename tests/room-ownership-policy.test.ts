import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { decideOwnershipPromotion } from "../src/lib/room-ownership-policy.ts";

describe("decideOwnershipPromotion", () => {
  it("does nothing when a canonical owner exists", () => {
    assert.equal(
      decideOwnershipPromotion({
        hasCanonicalOwner: true,
        ownerCandidateCount: 1,
        hasVerifiedLegacyMatch: false,
        currentRole: "editor",
      }),
      "noop"
    );
  });

  it("promotes an editor when no owner rows exist", () => {
    assert.equal(
      decideOwnershipPromotion({
        hasCanonicalOwner: false,
        ownerCandidateCount: 0,
        hasVerifiedLegacyMatch: false,
        currentRole: "editor",
      }),
      "promote"
    );
  });

  it("does not promote a viewer just because the owner row is gone", () => {
    assert.equal(
      decideOwnershipPromotion({
        hasCanonicalOwner: false,
        ownerCandidateCount: 0,
        hasVerifiedLegacyMatch: false,
        currentRole: "viewer",
      }),
      "noop"
    );
  });

  it("does not promote from an unverified legacy email match", () => {
    assert.equal(
      decideOwnershipPromotion({
        hasCanonicalOwner: false,
        ownerCandidateCount: 2,
        hasVerifiedLegacyMatch: false,
        currentRole: "editor",
      }),
      "noop"
    );
  });

  it("creates an owner entry for a verified legacy owner", () => {
    assert.equal(
      decideOwnershipPromotion({
        hasCanonicalOwner: false,
        ownerCandidateCount: 1,
        hasVerifiedLegacyMatch: true,
        currentRole: null,
      }),
      "create-from-legacy"
    );
  });

  it("fails closed when there are too many owner rows to inspect", () => {
    assert.equal(
      decideOwnershipPromotion({
        hasCanonicalOwner: false,
        ownerCandidateCount: 51,
        hasVerifiedLegacyMatch: true,
        currentRole: "editor",
      }),
      "noop"
    );
  });
});
