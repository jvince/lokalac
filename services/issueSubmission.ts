import type { IssueCategory } from "@/models/issue-category.ts";
import type { IssueSubmission } from "@/models/issue-submission.ts";
import { issueTypeBelongsToCategory } from "@/models/issue-submission.ts";
import type { IssueType } from "@/models/issue-type.ts";
import type {
  LocalCommunity,
  LocalCommunityPolygon,
} from "@/models/local-community.ts";
import { isPointInPolygon } from "@/utils/polygon.ts";

export interface IssueSubmissionDomainData {
  categories: readonly IssueCategory[];
  communities: readonly LocalCommunity[];
  issueTypes: readonly IssueType[];
  polygon: LocalCommunityPolygon | null;
}

export function validateIssueSubmissionDomain(
  submission: IssueSubmission,
  data: IssueSubmissionDomainData,
): string[] {
  const errors: string[] = [];
  const issueType = data.issueTypes.find((item) =>
    item.id === submission.typeId
  );

  if (!data.communities.some((item) => item.id === submission.communityId)) {
    errors.push("error.local_community_not_found");
  }

  if (!data.categories.some((item) => item.id === submission.categoryId)) {
    errors.push("error.issue_category_not_found");
  }

  if (!issueType) {
    errors.push("error.issue_type_not_found");
  } else if (!issueTypeBelongsToCategory(issueType, submission.categoryId)) {
    errors.push("error.issue_type_not_in_category");
  }

  if (
    submission.location &&
    !isPointInPolygon(
      [submission.location.lat, submission.location.lng],
      data.polygon,
    )
  ) {
    errors.push("error.location_not_in_community_polygon");
  }

  return errors;
}
