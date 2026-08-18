import { optionalString } from "@/utils/lang.ts";
import * as v from "@valibot/valibot";

export const MAX_ISSUE_IMAGES = 5;
export const MAX_ISSUE_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MiB
export const MAX_ISSUE_NOTE_LENGTH = 512;

export const ALLOWED_ISSUE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const IssueImageSchema = v.pipe(
  v.instance(File),
  v.check(
    (file) => file.size > 0,
    "error.image_empty",
  ),
  v.check(
    (file) => file.size <= MAX_ISSUE_IMAGE_SIZE,
    "error.image_too_large",
  ),
  v.check(
    (file) => ALLOWED_ISSUE_IMAGE_TYPES.has(file.type),
    "error.image_invalid_type",
  ),
);

const IssueLocationSchema = v.object({
  lat: v.pipe(
    v.number(),
    v.finite(),
    v.minValue(-90),
    v.maxValue(90),
  ),
  lng: v.pipe(
    v.number(),
    v.finite(),
    v.minValue(-180),
    v.maxValue(180),
  ),
});

export const IssueSubmissionSchema = v.object({
  communityId: v.pipe(
    v.string(),
    v.minLength(1),
  ),
  categoryId: v.pipe(
    v.string(),
    v.minLength(1),
  ),
  typeId: v.pipe(
    v.string(),
    v.minLength(1),
  ),
  note: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(
        MAX_ISSUE_NOTE_LENGTH,
        "error.note_too_long",
      ),
    ),
  ),
  location: v.optional(IssueLocationSchema),
  images: v.pipe(
    v.array(IssueImageSchema),
    v.maxLength(
      MAX_ISSUE_IMAGES,
      "error.too_many_images",
    ),
  ),
});

export type IssueSubmission = v.InferOutput<typeof IssueSubmissionSchema>;

function parseLocation(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value === "") {
    return undefined;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function isEmptyFileInput(value: FormDataEntryValue) {
  return value instanceof File && value.name === "" && value.size === 0;
}

export function formDataToIssue(formData: FormData) {
  const location = parseLocation(formData.get("location"));
  const note = formData.get("note");

  const input = v.safeParse(IssueSubmissionSchema, {
    communityId: formData.get("local_community"),
    categoryId: formData.get("issue_category"),
    typeId: formData.get("issue_type"),
    note: note === null ? undefined : note,
    location,
    images: formData.getAll("images[]").filter((value) =>
      !isEmptyFileInput(value)
    ),
  });

  const parsedLocation = v.safeParse(
    IssueLocationSchema,
    location,
  );

  const formValues = {
    communityId: optionalString(formData.get("local_community")),
    categoryId: optionalString(formData.get("issue_category")),
    typeId: optionalString(formData.get("issue_type")),
    note: optionalString(formData.get("note")),
    location: parsedLocation.success ? parsedLocation.output : undefined,
  };

  return { input, formValues };
}
