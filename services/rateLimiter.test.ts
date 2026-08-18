import { assertEquals, assertThrows } from "@std/assert";
import { createRateLimiter } from "./rateLimiter.ts";

Deno.test("rate limiter", async (t) => {
  let now = 0;

  await t.step("allows requests up to the configured limit", () => {
    const limiter = createRateLimiter({
      maxRequests: 2,
      now: () => now,
    });

    assertEquals(limiter.isRateLimited("client"), false);
    limiter.recordFailure("client");
    assertEquals(limiter.isRateLimited("client"), false);
    limiter.recordFailure("client");
    assertEquals(limiter.isRateLimited("client"), true);
  });

  await t.step("resets a client at the window boundary", () => {
    const limiter = createRateLimiter({
      maxRequests: 1,
      now: () => now,
      windowMs: 1_000,
    });

    limiter.recordFailure("client");
    assertEquals(limiter.isRateLimited("client"), true);

    now = 1_000;
    assertEquals(limiter.isRateLimited("client"), false);
  });

  await t.step("evicts the oldest client when capacity is reached", () => {
    const limiter = createRateLimiter({
      maxKeys: 2,
      maxRequests: 1,
      now: () => now,
    });

    limiter.recordFailure("oldest");
    limiter.recordFailure("second");
    limiter.recordFailure("third");

    assertEquals(limiter.isRateLimited("oldest"), false);
    assertEquals(limiter.isRateLimited("second"), true);
  });

  await t.step("keeps recently used clients during capacity eviction", () => {
    const limiter = createRateLimiter({
      maxKeys: 2,
      maxRequests: 2,
      now: () => now,
    });

    limiter.recordFailure("first");
    limiter.recordFailure("second");
    limiter.recordFailure("first");
    limiter.recordFailure("third");

    assertEquals(limiter.isRateLimited("first"), true);
    assertEquals(limiter.isRateLimited("second"), false);
  });

  await t.step("rejects non-positive options", () => {
    assertThrows(() => createRateLimiter({ maxKeys: 0 }), TypeError);
    assertThrows(() => createRateLimiter({ maxRequests: 0 }), TypeError);
    assertThrows(() => createRateLimiter({ windowMs: 0 }), TypeError);
  });
});
