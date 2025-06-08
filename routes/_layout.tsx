import { Partial } from "$fresh/runtime.ts";
import { defineLayout } from "$fresh/src/server/defines.ts";
import { AppState } from "$types/app.ts";
import { SiteFooter } from "$components/layout/SiteFooter.jsx";
import { SiteHeader } from "$components/layout/SiteHeader.tsx";

export default defineLayout<AppState>((_, { Component }) => {
  return (
    <div class="grid grid-rows-[auto_1fr_auto] min-h-screen max-w-[100rem] mx-auto gap-4">
      <SiteHeader />

      <main>
        <Component />
      </main>

      <SiteFooter />
    </div>
  );
});
