export type IssueSortDirection = "asc" | "desc";
export type IssueStatusFilter =
  | "all"
  | "open"
  | "reported"
  | "resolved"
  | "rejected";

export interface IssueListQuery {
  community: string;
  status: IssueStatusFilter;
  updatedAt: IssueSortDirection;
  cursor: string;
}

export class InvalidIssueListQueryError extends Error {}

const issueStatuses = new Set<IssueStatusFilter>([
  "all",
  "open",
  "reported",
  "resolved",
  "rejected",
]);

const cursorPattern = /^[A-Za-z0-9_-]+$/;

export function parseIssueListQuery(
  searchParams: URLSearchParams,
  communityIds: Iterable<string>,
): IssueListQuery {
  const communities = new Set(communityIds);
  const community = searchParams.get("community") ?? "all";
  const status = searchParams.get("status") ?? "all";
  const updatedAt = searchParams.get("updatedAt") ?? "desc";
  const cursor = searchParams.get("cursor") ?? "";

  if (community !== "all" && !communities.has(community)) {
    throw new InvalidIssueListQueryError("Invalid community filter.");
  }

  if (!issueStatuses.has(status as IssueStatusFilter)) {
    throw new InvalidIssueListQueryError("Invalid status filter.");
  }

  if (updatedAt !== "asc" && updatedAt !== "desc") {
    throw new InvalidIssueListQueryError("Invalid sort direction.");
  }

  if (
    cursor.length > 1_024 ||
    (cursor.length > 0 && !cursorPattern.test(cursor))
  ) {
    throw new InvalidIssueListQueryError("Invalid pagination cursor.");
  }

  return {
    community,
    status: status as IssueStatusFilter,
    updatedAt,
    cursor,
  };
}
