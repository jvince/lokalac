import type { Plugin } from "$fresh/server.ts";
import { createHandler } from "./handler.ts";
import type { CookiesState } from "./types.ts";

export function cookies(): Plugin<CookiesState> {
  return {
    name: "cookies",
    middlewares: [
      {
        path: "/",
        middleware: {
          handler: createHandler(),
        },
      },
    ],
  };
}
