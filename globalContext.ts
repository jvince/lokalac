import { createContext } from "preact";
import { useContext } from "preact/hooks";
import { i18nLanguage } from "$plugins/i18n/src/types.ts";
import supportedLanguages from "./supportedLanguages.ts";

export interface GlobalContext {
  language: i18nLanguage;
  translation: Record<string, Record<string, string>>;
  baseURL: URL;
}

const defaultGlobalContext: GlobalContext = {
  language: supportedLanguages[0],
  translation: {},
  baseURL: null!,
};

const Context = createContext<GlobalContext>(null!);

export function useGlobalContext() {
  const context = useContext(Context);
  return context ?? defaultGlobalContext;
}

export { Context };
