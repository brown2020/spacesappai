import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { errorResponse, successResponse } from "../src/lib/action-utils.ts";

describe("action-utils", () => {
  it("errorResponse shapes ActionResponse errors", () => {
    const res = errorResponse("UNAUTHORIZED", "Please sign in");
    assert.equal(res.success, false);
    if (!res.success) {
      assert.equal(res.error.code, "UNAUTHORIZED");
      assert.match(res.error.message, /sign in/i);
    }
  });

  it("successResponse shapes ActionResponse data", () => {
    const res = successResponse({ docId: "doc_1" });
    assert.equal(res.success, true);
    if (res.success) {
      assert.equal(res.data?.docId, "doc_1");
    }
  });
});
