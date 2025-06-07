import { Partial } from "$fresh/runtime.ts";
import { defineLayout } from "$fresh/src/server/defines.ts";
import { AppState } from "$types/app.ts";
import { SiteHeader } from "../components/layout/SiteHeader.tsx";

export default defineLayout<AppState>((_, ctx) => {
  return (
    <div class="max-w-[100rem] mx-auto">
      <SiteHeader />
      
      <main>
        <Partial name="main">
          <ctx.Component />
        </Partial>
      </main>
    </div>
  );
});
