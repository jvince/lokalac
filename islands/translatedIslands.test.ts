import { assertStringIncludes } from "@std/assert";
import { createElement } from "preact";
import { renderToString } from "npm:preact-render-to-string@^6.6.3";
import hu from "@/translations/hu/common.json" with { type: "json" };
import { DialogLocationView } from "./DialogLocationView.tsx";
import { DialogNoteView } from "./DialogNotesView.tsx";

const context = {
  baseURL: "https://example.test",
  language: {
    code: "hu",
    localizedName: "Magyar",
    package: "hu",
  },
  path: "/issues?lang=hu",
  translation: { common: hu },
};

Deno.test("translated dialog islands receive request locale context", () => {
  const noteHtml = renderToString(createElement(DialogNoteView, {
    _ctx: context,
    note: "Megjegyzés",
  }));
  const locationHtml = renderToString(createElement(DialogLocationView, {
    _ctx: context,
    location: { lat: 46.1, lng: 19.6 },
  }));

  assertStringIncludes(noteHtml, hu.view_note);
  assertStringIncludes(locationHtml, hu.view_location);
});
