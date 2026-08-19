import { define } from "@/types/app.ts";

export const theme = "winter";

export default define.page(function App({ Component, state }) {
  return (
    <html data-theme={theme} lang={state.language.code}>
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <title>Lokalac</title>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossorigin="anonymous"
        />
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
});
