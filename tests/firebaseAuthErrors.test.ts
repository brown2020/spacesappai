import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getFirebaseAuthErrorCode,
  mapFirebaseAuthError,
} from "../src/lib/firebaseAuthErrors.ts";

describe("mapFirebaseAuthError", () => {
  it("maps invalid-credential to a friendly message", () => {
    const error = {
      code: "auth/invalid-credential",
      message: "Firebase: Error (auth/invalid-credential).",
    };
    const message = mapFirebaseAuthError(error);
    assert.match(message, /Incorrect email or password/i);
    assert.doesNotMatch(message, /Firebase/i);
  });

  it("maps email-already-in-use and weak-password", () => {
    assert.match(
      mapFirebaseAuthError({ code: "auth/email-already-in-use" }),
      /already exists/i
    );
    assert.match(
      mapFirebaseAuthError({ code: "auth/weak-password" }),
      /at least 6/i
    );
  });

  it("falls back when code is unknown", () => {
    assert.match(mapFirebaseAuthError({ code: "auth/mystery" }), /try again/i);
  });

  it("extracts code from Error.message when code is missing", () => {
    const error = new Error("Firebase: Error (auth/too-many-requests).");
    assert.match(mapFirebaseAuthError(error), /Too many attempts/i);
  });

  it("getFirebaseAuthErrorCode reads code property", () => {
    assert.equal(
      getFirebaseAuthErrorCode({ code: "auth/invalid-email" }),
      "auth/invalid-email"
    );
    assert.equal(getFirebaseAuthErrorCode("nope"), null);
  });
});
