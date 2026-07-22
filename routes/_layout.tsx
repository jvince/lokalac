import { Container } from "@/components/layout/Container.tsx";
import { Footer } from "@/components/layout/Footer.jsx";
import { Header } from "@/components/layout/Header.tsx";
import { define } from "@/types/app.ts";

export default define.layout(({ Component }) => {
  return (
    <div class="grid grid-rows-[auto_1fr_auto] min-h-screen">
      <Header />

      <main>
        <Container class="py-12">
          <Component />
        </Container>
      </main>

      <Footer />
    </div>
  );
});
