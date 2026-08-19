import { defaultLanguage } from "@/languages.ts";
import type { GlobalContext } from "@/types/app.ts";
import { createContext } from "preact";
import { useContext } from "preact/hooks";

const defaultGlobalContextValue: GlobalContext = {
  baseURL: "",
  language: defaultLanguage,
  path: "",
  translation: {},
};

const ClientGlobalContext = createContext<GlobalContext>(
  defaultGlobalContextValue,
);

export const { Provider: ClientGlobalContextProvider } = ClientGlobalContext;

export function useGlobalContext() {
  const context = useContext(ClientGlobalContext);

  if (!context) {
    return defaultGlobalContextValue;
  }

  return context;
}
