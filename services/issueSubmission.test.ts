import { assertEquals } from "@std/assert";
import type { IssueSubmission } from "@/models/issue-submission.ts";
import type { IssueSubmissionDomainData } from "./issueSubmission.ts";
import { validateIssueSubmissionDomain } from "./issueSubmission.ts";

const submission: IssueSubmission = {
  communityId: "community-1",
  categoryId: "roads",
  typeId: "pothole",
  location: { lat: 1, lng: 1 },
  images: [],
};

const domainData: IssueSubmissionDomainData = {
  communities: [{
    id: "community-1",
    name: "Center",
    phone: [],
    link: "",
  }],
  categories: [{ id: "roads", name: "Roads", description: "" }],
  issueTypes: [{
    id: "pothole",
    name: "Pothole",
    description: "",
    category: "roads",
  }],
  polygon: [[0, 0], [0, 2], [2, 2], [2, 0], [0, 0]],
};

Deno.test("issue submission domain validation", async (t) => {
  await t.step("accepts a submission satisfying all domain rules", () => {
    assertEquals(validateIssueSubmissionDomain(submission, domainData), []);
  });

  await t.step("rejects unknown domain references", () => {
    assertEquals(
      validateIssueSubmissionDomain(submission, {
        ...domainData,
        communities: [],
        categories: [],
        issueTypes: [],
      }),
      [
        "error.local_community_not_found",
        "error.issue_category_not_found",
        "error.issue_type_not_found",
      ],
    );
  });

  await t.step("rejects an issue type from another category", () => {
    assertEquals(
      validateIssueSubmissionDomain(submission, {
        ...domainData,
        issueTypes: [{ ...domainData.issueTypes[0], category: "lighting" }],
      }),
      ["error.issue_type_not_in_category"],
    );
  });

  await t.step("rejects a location outside the community polygon", () => {
    assertEquals(
      validateIssueSubmissionDomain(
        { ...submission, location: { lat: 3, lng: 3 } },
        domainData,
      ),
      ["error.location_not_in_community_polygon"],
    );
  });
});
