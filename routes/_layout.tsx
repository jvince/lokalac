import { Partial } from "$fresh/runtime.ts";
import { defineLayout } from "$fresh/src/server/defines.ts";
import { AppState } from "$types/app.ts";
import { SiteHeader } from "../components/layout/SiteHeader.tsx";

export default defineLayout<AppState>((_, { Component }) => {
  return (
    <div class="max-w-[100rem] mx-auto">
      <SiteHeader />

      <main class="my-8">
        <Partial name="main">
          <Component />
        </Partial>
      </main>
    </div>
  );
});
