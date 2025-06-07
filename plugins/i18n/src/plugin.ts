import type { Plugin } from "$fresh/server.ts";
import { createHandler } from "./handler.ts";
import type { i18nLanguage, i18nPluginConfig, i18nState } from "./types.ts";

function i18n<T extends readonly i18nLanguage[]>(config: i18nPluginConfig<T>): Plugin<i18nState> {
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
