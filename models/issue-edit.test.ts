import { assertEquals } from "@std/assert";
import { formDataToIssueEdit } from "./issue-edit.ts";
import { IssueStatus } from "./issue.ts";

function validFormData() {
  const formData = new FormData();
  formData.set("local_community", "community");
  formData.set("issue_category", "category");
  formData.set("issue_type", "type");
  formData.set("note", "Updated note");
  formData.set("location", JSON.stringify({ lat: 46.1, lng: 19.6 }));
  formData.set("status", IssueStatus.Resolved);
  formData.set("versionstamp", "00000000000000010000");
  return formData;
}

Deno.test("issue edit validation", async (t) => {
  await t.step("accepts editable details, status, and versionstamp", () => {
    const { input } = formDataToIssueEdit(validFormData());
    assertEquals(input.success, true);
    if (input.success) {
      assertEquals(input.output.status, IssueStatus.Resolved);
      assertEquals(input.output.location, { lat: 46.1, lng: 19.6 });
    }
  });

  await t.step("rejects invalid statuses", () => {
    const formData = validFormData();
    formData.set("status", "deleted");
    const { input } = formDataToIssueEdit(formData);
    assertEquals(input.success, false);
    if (!input.success) {
      assertEquals(input.issues[0].message, "error.issue_status_invalid");
    }
  });

  await t.step("requires a versionstamp", () => {
    const formData = validFormData();
    formData.delete("versionstamp");
    const { input } = formDataToIssueEdit(formData);
    assertEquals(input.success, false);
  });
});
