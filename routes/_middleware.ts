import { FreshContext } from "$fresh/server.ts";

export async function handler(_: Request, ctx: FreshContext) {
  if (ctx.url.pathname === "/") {
    return new Response(null, {
      status: 307,
      headers: {
        "Location": "/issues",
      },
    });
  }

  if (ctx.url.pathname.startsWith("/upload/")) {
    try {
      const file = await Deno.readFile(`./${ctx.url.pathname}`);

      return new Response(file, {
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      return new Response(null, {
        status: 404,
      });
    }
  }

  return ctx.next();
}
