import { Container } from "$components/layout/Container.tsx";
import { Footer } from "$components/layout/Footer.jsx";
import { Header } from "$components/layout/Header.tsx";
import { defineLayout } from "$fresh/src/server/defines.ts";
import type { AppState } from "$types/app.ts";

export default defineLayout<AppState>((_, { Component }) => {
  return (
    <div class="grid grid-rows-[auto_1fr_auto] min-h-screen gap-4">
      <Header />

      <main>
        <Container>
          <Component />
        </Container>
      </main>

      <Footer />
    </div>
  );
});
