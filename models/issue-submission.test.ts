import { assertEquals } from "@std/assert";
import * as v from "@valibot/valibot";
import {
  formDataToIssue,
  IssueSubmissionSchema,
  MAX_ISSUE_IMAGE_SIZE,
  MAX_ISSUE_IMAGES,
  MAX_ISSUE_NOTE_LENGTH,
} from "./issue-submission.ts";

function createValidFormData() {
  const formData = new FormData();
  formData.set("local_community", "community-1");
  formData.set("issue_category", "category-1");
  formData.set("issue_type", "type-1");
  return formData;
}

function createFile(name: string) {
  return new File(["image"], name, { type: "image/png" });
}

function createValidSubmission() {
  return {
    communityId: "community-1",
    categoryId: "category-1",
    typeId: "type-1",
    images: [],
  };
}

Deno.test("issue submission validation", async (t) => {
  await t.step("accepts a minimal valid submission", () => {
    const { input } = formDataToIssue(createValidFormData());

    assertEquals(input.success, true);
  });

  await t.step("requires non-empty IDs", () => {
    const fields = [
      "local_community",
      "issue_category",
      "issue_type",
    ];

    for (const field of fields) {
      const missing = createValidFormData();
      missing.delete(field);
      assertEquals(formDataToIssue(missing).input.success, false, field);

      const empty = createValidFormData();
      empty.set(field, "");
      assertEquals(formDataToIssue(empty).input.success, false, field);
    }
  });

  await t.step("accepts valid optional coordinates", () => {
    const formData = createValidFormData();
    formData.set("location", JSON.stringify({ lat: 46.1, lng: 19.7 }));

    const { input } = formDataToIssue(formData);

    assertEquals(input.success, true);
    if (input.success) {
      assertEquals(input.output.location, { lat: 46.1, lng: 19.7 });
    }
  });

  await t.step("rejects malformed location JSON", () => {
    const formData = createValidFormData();
    formData.set("location", "{invalid");

    assertEquals(formDataToIssue(formData).input.success, false);
  });

  await t.step("rejects coordinates outside geographic ranges", () => {
    const invalidLocations = [
      { lat: -91, lng: 0 },
      { lat: 91, lng: 0 },
      { lat: 0, lng: -181 },
      { lat: 0, lng: 181 },
    ];

    for (const location of invalidLocations) {
      const result = v.safeParse(IssueSubmissionSchema, {
        ...createValidSubmission(),
        location,
      });

      assertEquals(result.success, false, JSON.stringify(location));
    }
  });

  await t.step("rejects non-finite coordinates", () => {
    const invalidLocations = [
      { lat: Number.NaN, lng: 0 },
      { lat: Number.POSITIVE_INFINITY, lng: 0 },
      { lat: 0, lng: Number.NEGATIVE_INFINITY },
    ];

    for (const location of invalidLocations) {
      const result = v.safeParse(IssueSubmissionSchema, {
        ...createValidSubmission(),
        location,
      });

      assertEquals(result.success, false);
    }
  });

  await t.step("enforces the note length limit", () => {
    const accepted = createValidFormData();
    accepted.set("note", "a".repeat(MAX_ISSUE_NOTE_LENGTH));
    assertEquals(formDataToIssue(accepted).input.success, true);

    const rejected = createValidFormData();
    rejected.set("note", "a".repeat(MAX_ISSUE_NOTE_LENGTH + 1));
    assertEquals(formDataToIssue(rejected).input.success, false);
  });

  await t.step("rejects a file submitted as the note", () => {
    const formData = createValidFormData();
    formData.set("note", createFile("note.png"));

    assertEquals(formDataToIssue(formData).input.success, false);
  });

  await t.step("enforces the image cardinality limit", () => {
    const accepted = createValidFormData();
    for (let index = 0; index < MAX_ISSUE_IMAGES; index++) {
      accepted.append("images[]", createFile(`${index}.png`));
    }
    assertEquals(formDataToIssue(accepted).input.success, true);

    const rejected = createValidFormData();
    for (let index = 0; index <= MAX_ISSUE_IMAGES; index++) {
      rejected.append("images[]", createFile(`${index}.png`));
    }
    assertEquals(formDataToIssue(rejected).input.success, false);
  });

  await t.step("enforces image MIME types", () => {
    const accepted = createValidFormData();
    accepted.append("images[]", createFile("image.png"));
    assertEquals(formDataToIssue(accepted).input.success, true);

    const rejected = createValidFormData();
    rejected.append(
      "images[]",
      new File(["image"], "image.gif", { type: "image/gif" }),
    );
    assertEquals(formDataToIssue(rejected).input.success, false);
  });

  await t.step("enforces the image byte limit", () => {
    const accepted = createValidFormData();
    accepted.append(
      "images[]",
      new File([new Uint8Array(MAX_ISSUE_IMAGE_SIZE)], "image.png", {
        type: "image/png",
      }),
    );
    assertEquals(formDataToIssue(accepted).input.success, true);

    const rejected = createValidFormData();
    rejected.append(
      "images[]",
      new File([new Uint8Array(MAX_ISSUE_IMAGE_SIZE + 1)], "image.png", {
        type: "image/png",
      }),
    );
    assertEquals(formDataToIssue(rejected).input.success, false);
  });

  await t.step("ignores untouched file inputs", () => {
    const formData = createValidFormData();
    formData.append(
      "images[]",
      new File([], "", { type: "application/octet-stream" }),
    );

    const { input } = formDataToIssue(formData);
    assertEquals(input.success, true);
    if (input.success) {
      assertEquals(input.output.images, []);
    }
  });

  await t.step("rejects empty selected images", () => {
    const formData = createValidFormData();
    formData.append(
      "images[]",
      new File([], "empty.png", { type: "image/png" }),
    );

    assertEquals(formDataToIssue(formData).input.success, false);
  });

  await t.step("rejects non-file image values", () => {
    const formData = createValidFormData();
    formData.append("images[]", "not-a-file");

    assertEquals(formDataToIssue(formData).input.success, false);
  });
});
