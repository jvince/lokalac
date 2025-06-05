import type { MiddlewareHandler } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import type { i18nPluginConfig } from "./types.ts";
import { i18nState } from "./types.ts";

export function createHandler(
  config: i18nPluginConfig,
): MiddlewareHandler<i18nState> {
  console.debug("i18n plugin handler created with config:", config);

  const { defaultLanguage, languages, languagesDir } = config;

  return async (req, ctx) => {
    if (ctx.destination !== "route" && ctx.destination !== "notFound") {
      return await ctx.next();
    }

    

    // const path = ctx.url.pathname;
    // const lang = ctx.url.pathname.split(".").pop() ?? defaultLanguage;

    // ctx.state.language = languages.includes(lang) ? lang : defaultLanguage;

    // if (languages.includes(lang)) {
    //   ctx.state.language = lang;
    //   ctx.state.i18nPath = path;
    // } else {
    //   ctx.state.language = defaultLanguage;
    //   ctx.state.i18nPath = `${path}.${defaultLanguage}`;
    // }

    const res = await ctx.next();

    return res;
  };
}
