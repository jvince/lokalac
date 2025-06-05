import type { Plugin } from "$fresh/server.ts";
import { createHandler } from "./handler.ts";
import type { i18nPluginConfig, i18nState } from "./types.ts";

function i18n(config: i18nPluginConfig): Plugin<i18nState> {
  return {
    name: "i18n",
    middlewares: [
      {
        "path": "/",
        middleware: {
          handler: createHandler(config),
        },
      },
    ],
  };
}

export { i18n };
