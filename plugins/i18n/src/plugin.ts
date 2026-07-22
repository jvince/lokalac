import type { Middleware } from "fresh";
import { createHandler } from "./handler.ts";
import type { i18nLanguage, i18nPluginConfig, i18nState } from "./types.ts";

function i18n<T extends readonly i18nLanguage[], State extends i18nState>(
  config: i18nPluginConfig<T>,
): Middleware<State> {
  return createHandler(config);
}

export { i18n };
