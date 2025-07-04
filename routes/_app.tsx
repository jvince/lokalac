import { defineApp } from "$fresh/server.ts";
import { AppState } from "$types/app.ts";
import { signal } from "@preact/signals";
import { Context, type GlobalContext } from "../globalContext.ts";
import { Partial } from "$fresh/runtime.ts";

export const theme = signal("winter");

export default defineApp<AppState>((_, { Component, state, url }) => {
  const { language, translation } = state;
  const contextValue: GlobalContext = {
    language,
    translation,
    baseURL: url.origin,
    path: url.pathname,
  };

  return (
    <Context.Provider value={contextValue}>
      <html data-theme={`${theme.value}`} lang={state.language.code}>
        <head>
          <meta charset="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>fresh-project</title>
          <link rel="stylesheet" href="/styles.css" />
          <link
            rel="stylesheet"
            href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
            crossorigin="anonymous"
          />
        </head>

        <body f-client-nav>
          <Partial name="body">
            <Component />
          </Partial>
        </body>
      </html>
    </Context.Provider>
  );
});
