import { assertEquals } from "@std/assert";
import {
  addQueryParameter,
  createLanguageSwitchUrl,
  normalizeIssueListReturnUrl,
} from "./url.ts";

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

Deno.test("issue list return URLs are confined to the application", () => {
  assertEquals(
    normalizeIssueListReturnUrl(
      "/issues?community=center&status=open&lang=hu",
      "hu",
    ),
    "/issues?community=center&status=open&lang=hu",
  );
  assertEquals(
    normalizeIssueListReturnUrl("https://example.com/issues", "hu"),
    "/issues?lang=hu",
  );
  assertEquals(
    normalizeIssueListReturnUrl("//example.com/issues", "sr-Latn-RS"),
    "/issues",
  );
  assertEquals(
    addQueryParameter("/issues?status=open", "updated", "1"),
    "/issues?status=open&updated=1",
  );
});
