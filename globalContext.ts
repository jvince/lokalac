import languages from "@/languages.ts";
import type { GlobalContext } from "@/types/app.ts";
import { define } from "@/types/app.ts";
import { AsyncLocalStorage } from "node:async_hooks";

export const serverStorage = new AsyncLocalStorage<GlobalContext>();

export const globalContext = () =>
  define.middleware(async (ctx) => {
    const contextValue: GlobalContext = {
      language: ctx.state.language,
      translation: ctx.state.translation,
      baseURL: ctx.url.origin,
      path: ctx.url.pathname,
    };

    return await serverStorage.run(contextValue, async () => {
      return await ctx.next();
    });
  });

export function useGlobalContext(): GlobalContext {
  const context = serverStorage.getStore();

  if (!context) {
    return {
      language: languages[0],
      translation: {},
      baseURL: "",
      path: "",
    };
  }

  return context;
}
