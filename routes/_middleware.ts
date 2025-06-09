import { FreshContext } from "$fresh/server.ts";

export function handler(_: Request, ctx: FreshContext) {
  if (ctx.url.pathname === "/") {
    return new Response(null, {
      status: 307,
      headers: {
        "Location": "/issues",
      },
    });
  }

  return ctx.next();
}
