import { assertEquals, assertThrows } from "@std/assert";
import { createHandler, createTranslationLoader } from "./handler.ts";

Deno.test("i18n handler configuration", async (t) => {
  await t.step("rejects a default language outside the configured list", () => {
    assertThrows(
      () =>
        createHandler({
          defaultLanguage: "missing",
          languages: [{
            code: "hu",
            localizedName: "Magyar",
            package: "hu",
          }],
          languagesDir: "./translations",
        }),
      Error,
      'Default language "missing" not found',
    );
  });

  await t.step("accepts a configured default language", () => {
    createHandler({
      defaultLanguage: "hu",
      languages: [{
        code: "hu",
        localizedName: "Magyar",
        package: "hu",
      }],
      languagesDir: "./translations",
    });
  });
});

Deno.test("translation loader caches each locale and package", async () => {
  let reads = 0;
  const load = createTranslationLoader((path) => {
    reads += 1;
    return Promise.resolve(JSON.stringify({ path }));
  });

  const [first, second] = await Promise.all([
    load("translations", "common", "hu"),
    load("translations", "common", "hu"),
  ]);

  assertEquals(first, second);
  assertEquals(reads, 1);

  await load("translations", "common", "sr-Latn-RS");
  await load("translations", "admin", "hu");
  assertEquals(reads, 3);
});
