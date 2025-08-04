import { Container } from "$components/layout/Container.tsx";
import { Footer } from "$components/layout/Footer.jsx";
import { Header } from "$components/layout/Header.tsx";
import { defineLayout } from "$fresh/src/server/defines.ts";
import type { AppState } from "$types/app.ts";
import { Partial } from "$fresh/runtime.ts";

export default defineLayout<AppState>((_, { Component }) => {
  return (
    <div class="grid grid-rows-[auto_1fr_auto] min-h-screen">
      <Header />

      <main f-client-nav>
        <Partial name="content">
          <Container class="py-12">
            <Component />
          </Container>
        </Partial>
      </main>

      <Footer />
    </div>
  );
});
