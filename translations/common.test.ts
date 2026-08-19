import { assertEquals, assertNotEquals } from "@std/assert";
import { createTranslator } from "@/plugins/i18n/mod.ts";
import hu from "./hu/common.json" with { type: "json" };
import srCyrl from "./sr-Cyrl-RS/common.json" with { type: "json" };
import srLatn from "./sr-Latn-RS/common.json" with { type: "json" };

const submissionErrorKeys = [
  "animated_image_not_allowed",
  "image_dimensions_too_large",
  "image_empty",
  "image_invalid",
  "image_invalid_type",
  "image_too_large",
  "images_invalid",
  "invalid_form_submission",
  "issue_category_not_found",
  "issue_category_required",
  "issue_submission_failed",
  "issue_type_not_found",
  "issue_type_not_in_category",
  "issue_type_required",
  "local_community_not_found",
  "local_community_required",
  "location_invalid",
  "location_not_in_community_polygon",
  "note_invalid",
  "note_too_long",
  "request_body_too_large",
  "too_many_images",
] as const;

Deno.test("common submission error translations", async (t) => {
  await t.step("have matching common keys in every language", () => {
    const expectedKeys = Object.keys(srLatn).sort();

    assertEquals(Object.keys(srCyrl).sort(), expectedKeys);
    assertEquals(Object.keys(hu).sort(), expectedKeys);
  });

  await t.step("have matching error keys in every language", () => {
    const expectedKeys = Object.keys(srLatn.error).sort();

    assertEquals(Object.keys(srCyrl.error).sort(), expectedKeys);
    assertEquals(Object.keys(hu.error).sort(), expectedKeys);
  });

  await t.step("contain every submission error message", () => {
    for (const key of submissionErrorKeys) {
      assertNotEquals(hu.error[key].trim(), "", `Missing Hungarian: ${key}`);
      assertNotEquals(
        srLatn.error[key].trim(),
        "",
        `Missing Serbian Latin: ${key}`,
      );
      assertNotEquals(
        srCyrl.error[key].trim(),
        "",
        `Missing Serbian Cyrillic: ${key}`,
      );
    }
  });

  await t.step("resolve through the application translator", () => {
    const huTranslator = createTranslator({ common: hu });
    const srCyrlTranslator = createTranslator({ common: srCyrl });
    const srLatnTranslator = createTranslator({ common: srLatn });

    for (const key of submissionErrorKeys) {
      const path = `common.error.${key}`;
      assertNotEquals(huTranslator(path), path);
      assertNotEquals(srCyrlTranslator(path), path);
      assertNotEquals(srLatnTranslator(path), path);
    }
  });
});
