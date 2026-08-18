import { createRateLimiter } from "@/services/rateLimiter.ts";
import { assertEquals } from "@std/assert";
import {
  createSubmissionQuota,
  SUBMISSION_QUOTA_WINDOW_MS,
} from "./submissionQuota.ts";

Deno.test("submission quota", async (t) => {
  let now = 0;
  const quota = createSubmissionQuota(createRateLimiter({
    maxRequests: 2,
    now: () => now,
    windowMs: SUBMISSION_QUOTA_WINDOW_MS,
  }));

  await t.step("allows attempts up to the limit", () => {
    assertEquals(quota("client-a"), undefined);
    assertEquals(quota("client-a"), undefined);
  });

  await t.step("returns 429 with Retry-After after the limit", () => {
    const response = quota("client-a");

    assertEquals(response?.status, 429);
    assertEquals(
      response?.headers.get("Retry-After"),
      String(SUBMISSION_QUOTA_WINDOW_MS / 1000),
    );
    assertEquals(
      response?.headers.get("X-Content-Type-Options"),
      "nosniff",
    );
  });

  await t.step("tracks clients independently", () => {
    assertEquals(quota("client-b"), undefined);
  });

  await t.step("resets at the window boundary", () => {
    now = SUBMISSION_QUOTA_WINDOW_MS;

    assertEquals(quota("client-a"), undefined);
  });
});
