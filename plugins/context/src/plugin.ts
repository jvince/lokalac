import { Plugin } from "$fresh/server.ts";
import type { Context } from "preact";
import { setup, SHARED_CONTEXT_ID } from "./shared.ts";

export function context(
  Context: Context<any>,
  importURL: string,
): Plugin {
  setup(Context);

  const main = `data:application/javascript,import hydrate from "${
    new URL("./hydrate.ts", import.meta.url).href
  }";
  import { Context } from "${new URL(importURL, import.meta.url).href}";
  export default function(state) { hydrate(Context, state); }`;

  return {
    name: "context",
    entrypoints: { "main": main },
    render: (ctx) => {
      const res = ctx.render();
      const scripts = [];

      if (res.requiresHydration) {
        scripts.push({ entrypoint: "main", state: { id: SHARED_CONTEXT_ID } });
      }

      return {
        scripts,
      };
    },
  };
}
