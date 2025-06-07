import { i18nLanguage } from "$plugins/i18n/src/types.ts";
import { createContext } from "preact";
import { useContext } from "preact/hooks";
import languages from "./languages.ts";

export interface GlobalContext {
  language: i18nLanguage;
  translation: Record<string, Record<string, string>>;
  baseURL: string;
  path: string;
}

const defaultGlobalContext: GlobalContext = {
  language: languages[0],
  translation: {},
  baseURL: null!,
  path: "/",
};

const Context = createContext<GlobalContext>(null!);

export function useGlobalContext() {
  const context = useContext(Context);
  return context ?? defaultGlobalContext;
}

export { Context };
