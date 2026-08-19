// deno-lint-ignore-file no-explicit-any

import { ClientGlobalContextProvider } from "@/clientGlobalContext.ts";
import { GlobalContext } from "@/types/app.ts";
import { type ComponentType, createElement } from "preact";

interface WithGlobalContextProps {
  _ctx: GlobalContext;
}

export function withGlobalContext<P>(
  Component: ComponentType<P>,
) {
  function WithGlobalContext(props: P & WithGlobalContextProps) {
    const { _ctx, ...rest } = props;

    return (
      <ClientGlobalContextProvider value={_ctx}>
        {createElement(Component, rest as any)}
      </ClientGlobalContextProvider>
    );
  }

  return WithGlobalContext;
}
