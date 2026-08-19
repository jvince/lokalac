import { assertEquals } from "@std/assert";
import { createLanguageSwitchUrl } from "./url.ts";

Deno.test("language switch URLs", async (t) => {
  await t.step("preserve query parameters while changing lang", () => {
    assertEquals(
      createLanguageSwitchUrl(
        "/issues?community=north&status=open&lang=hu&updatedAt=asc",
        "sr-Cyrl-RS",
      ),
      "/issues?community=north&status=open&lang=sr-Cyrl-RS&updatedAt=asc",
    );
  });

  await t.step("remove only lang when selecting the default locale", () => {
    assertEquals(
      createLanguageSwitchUrl(
        "/issues?community=north&lang=hu&cursor=opaque#results",
        "sr-Latn-RS",
      ),
      "/issues?community=north&cursor=opaque#results",
    );
  });

  await t.step("add lang without disturbing an existing query", () => {
    assertEquals(
      createLanguageSwitchUrl("/issues?status=resolved", "hu"),
      "/issues?status=resolved&lang=hu",
    );
  });
});
