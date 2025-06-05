import { IS_BROWSER } from "$fresh/runtime.ts";
import { createContext } from "preact";
import { useContext } from "preact/hooks";

export interface GlobalContext {
  lang: string;
}

const defaultGlobalContext: GlobalContext = {
  lang: "rs",
}

const Context = createContext<GlobalContext>(null!);

export function useGlobalContext() {
  const context = useContext(Context);
  return context ?? defaultGlobalContext;
}

export { Context };
