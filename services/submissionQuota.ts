import type { RateLimiter } from "@/services/rateLimiter.ts";
import { createRateLimiter } from "@/services/rateLimiter.ts";

export const SUBMISSION_QUOTA_WINDOW_MS = 10 * 60 * 1000;
export const MAX_SUBMISSIONS_PER_WINDOW = 5;

export function createSubmissionQuota(
  rateLimiter: RateLimiter = createRateLimiter({
    maxKeys: 10_000,
    maxRequests: MAX_SUBMISSIONS_PER_WINDOW,
    windowMs: SUBMISSION_QUOTA_WINDOW_MS,
  }),
) {
  return (clientKey: string): Response | undefined => {
    if (rateLimiter.isRateLimited(clientKey)) {
      return new Response("Too many submissions.", {
        status: 429,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Retry-After": String(SUBMISSION_QUOTA_WINDOW_MS / 1000),
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    rateLimiter.recordFailure(clientKey);
    return undefined;
  };
}

export const submissionQuota = createSubmissionQuota();
