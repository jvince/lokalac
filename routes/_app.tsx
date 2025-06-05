import { defineApp } from "$fresh/server.ts";
import { AppState } from "$types/app.ts";
import { signal } from "@preact/signals";
import { Context } from "../globalContext.ts";

export const theme = signal("light");

export default defineApp<AppState>((req, { Component, state }) => {
  const lang = new URL(req.url).searchParams.get("lang") || "rs";
  console.log("Language set to:", lang);

  return (
    <Context.Provider value={{ lang }}>
      <html data-theme={`${theme.value}`} lang={state.language}>
        <head>
          <meta charset="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>fresh-project</title>
          <link rel="stylesheet" href="/styles.css" />
        </head>
        <body class="bg-base-100 min-h-dvh">
          <Component />
        </body>
      </html>
    </Context.Provider>
  );
});
