import { optionalString } from "@/utils/lang.ts";
import * as v from "@valibot/valibot";
import { IssueStatus } from "./issue.ts";
import { IssueDetailsSchema, IssueLocationSchema } from "./issue-submission.ts";

export const IssueEditSchema = v.object({
  ...IssueDetailsSchema.entries,
  status: v.enum(IssueStatus, "error.issue_status_invalid"),
  versionstamp: v.pipe(
    v.string("error.issue_update_conflict"),
    v.minLength(1, "error.issue_update_conflict"),
  ),
});

export type IssueEdit = v.InferOutput<typeof IssueEditSchema>;

function parseLocation(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value === "") return undefined;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export function formDataToIssueEdit(formData: FormData) {
  const location = parseLocation(formData.get("location"));
  const note = formData.get("note");
  const input = v.safeParse(IssueEditSchema, {
    communityId: formData.get("local_community"),
    categoryId: formData.get("issue_category"),
    typeId: formData.get("issue_type"),
    note: note === null ? undefined : note,
    location,
    status: formData.get("status"),
    versionstamp: formData.get("versionstamp"),
  });
  const parsedLocation = v.safeParse(IssueLocationSchema, location);

  return {
    input,
    formValues: {
      communityId: optionalString(formData.get("local_community")),
      categoryId: optionalString(formData.get("issue_category")),
      typeId: optionalString(formData.get("issue_type")),
      note: optionalString(formData.get("note")),
      location: parsedLocation.success ? parsedLocation.output : undefined,
      status: optionalString(formData.get("status")) as IssueStatus | undefined,
    },
  };
}
