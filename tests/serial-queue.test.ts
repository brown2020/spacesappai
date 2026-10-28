import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createSerialQueue } from "../src/lib/serial-queue.ts";

describe("createSerialQueue", () => {
  it("runs tasks in enqueue order even when the first one is slower", async () => {
    const enqueue = createSerialQueue();
    const order: number[] = [];

    await Promise.all([
      enqueue(async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
        order.push(1);
      }),
      enqueue(async () => {
        order.push(2);
      }),
    ]);

    assert.deepEqual(order, [1, 2]);
  });
});
