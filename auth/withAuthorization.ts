import type { RateLimiter } from "@/services/rateLimiter.ts";
import { createRateLimiter } from "@/services/rateLimiter.ts";
import { getRemoteAddr } from "@/utils/net.ts";
import type { HandlerFn } from "fresh";
import { basicAuth } from "./basicAuth.ts";

export const withAuthorization =
  (rateLimiter: RateLimiter) =>
  <T, S>(handler: HandlerFn<T, S>): HandlerFn<T, S> =>
  async (ctx) => {
    let remoteAddr: string;

    try {
      remoteAddr = getRemoteAddr(ctx);

      if (rateLimiter.isRateLimited(remoteAddr)) {
        return new Response("Too many requests.", { status: 429 });
      }
    } catch {
      return new Response("Something went wrong.", { status: 500 });
    }

    const unauthorized = await basicAuth(ctx.req);

    if (unauthorized) {
      rateLimiter.recordFailure(remoteAddr);
      return unauthorized;
    }

    return await handler(ctx);
  };

export const WithAuthorization = withAuthorization(
  createRateLimiter(),
);
