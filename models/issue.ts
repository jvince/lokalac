import { kv } from "$services/kv.ts";
import {
  IssueCategory,
  IssueCategoryIndex as IssueCategoryPrimaryKey,
} from "./issue-category.ts";
import {
  IssueType,
  IssueTypeIndex as IssueTypePrimaryKey,
} from "./issue-type.ts";
import { LocalCommunity, LocalCommunityIndex } from "./local-community.ts";

export const IssueIndex = "issue";

export enum IssueSecondaryIndex {
  ByCommunity = "issue_by_community",
  ByCategory = "issue_by_category",
  ByIssueType = "issue_by_type",
  ByIssueStatus = "issue_by_status",
}

export type IssueLocation = {
  lat: number;
  lng: number;
};

export interface Issue {
  id: string;
  communityId: string;
  categoryId: string;
  typeId: string;
  note?: string;
  status: IssueStatus;
  location?: IssueLocation;
  submittedAt: string;
  updatedAt?: string;
}

export interface IssueDTO extends Issue {
  community: LocalCommunity;
  category: IssueCategory;
  type: IssueType;
}

export enum IssueStatus {
  Open = "open",
  Reported = "reported",
  Resolved = "resolved",
  Rejected = "rejected",
}

export async function insertIssue(issue: Issue) {
  const primaryKey = [IssueIndex, issue.id];
  const byCommunityKey = [
    IssueSecondaryIndex.ByCommunity,
    issue.communityId,
    issue.id,
  ];

  const result = await kv.atomic()
    .check({ key: primaryKey, versionstamp: null })
    .check({ key: byCommunityKey, versionstamp: null })
    .set(primaryKey, issue)
    .set(byCommunityKey, issue)
    .commit();

  if (!result.ok) {
    throw new Error(`Failed to insert issue with ID ${issue.id}`);
  }
}

export async function getIssueById(
  id: string,
): Promise<IssueDTO | null> {
  const primaryKey = [IssueIndex, id];
  const result = await kv.get<Issue>(primaryKey);

  if (!result.value || typeof result.value !== "object") {
    return null;
  }

  return await resolve(result.value);
}

export async function* getIssuesByCommunity(
  communityId: string,
  options?: Deno.KvListOptions,
) {
  const result = kv.list<Issue>({
    prefix: [IssueSecondaryIndex.ByCommunity, communityId],
  }, options);

  for await (const item of result) {
    yield await resolve(item.value);
  }
}

export async function* getIssues(options?: Deno.KvListOptions) {
  const result = kv.list<Issue>({ prefix: [IssueIndex] }, options);

  for await (const item of result) {
    yield await resolve(item.value);
  }
}

async function resolve(obj: Issue): Promise<IssueDTO> {
  const data = await kv.getMany<[LocalCommunity, IssueCategory, IssueType]>([
    [LocalCommunityIndex, obj.communityId],
    [IssueCategoryPrimaryKey, obj.categoryId],
    [IssueTypePrimaryKey, obj.typeId],
  ]);

  return {
    ...obj,
    community: data[0].value as LocalCommunity,
    category: data[1].value as IssueCategory,
    type: data[2].value as IssueType,
  };
}
