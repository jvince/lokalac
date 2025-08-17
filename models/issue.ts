import { kv } from "$services/kv.ts";
import { exists } from "@std/fs";
import { appConfig } from "../config.ts";
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
  ByCommunityAndStatus = "issue_by_community_and_status",
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
  createdAt: string;
  updatedAt: string;
  images?: string[];
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

async function processIterator<T, K>(
  iterator: Deno.KvListIterator<T>,
  resolver: (item: T) => Promise<K>,
  limit: number | undefined = Number.POSITIVE_INFINITY,
) {
  const _limit = limit - 1;
  let _cursor = "";
  const items: K[] = [];
  let count = 0;

  for await (const item of iterator) {
    count += 1;
    items.push(await resolver(item.value));

    if (count <= _limit) {
      _cursor = iterator.cursor;
    }
  }

  return {
    cursor: count > _limit ? _cursor : "",
    items: limit ? items.slice(0, _limit) : items,
  };
}

export function isIssueStatus(value: unknown): value is IssueStatus {
  if (typeof value !== "string") {
    return false;
  }

  return Object.values(IssueStatus).includes(value as IssueStatus);
}

export async function insertIssue(issue: Issue) {
  const primaryKey = [IssueIndex, issue.id];
  const byCommunityKey = [
    IssueSecondaryIndex.ByCommunity,
    issue.communityId,
    issue.id,
  ];

  const byStatusKey = [
    IssueSecondaryIndex.ByIssueStatus,
    issue.status,
    issue.id,
  ];

  const byCommunityAndStatusKey = [
    IssueSecondaryIndex.ByCommunityAndStatus,
    issue.communityId,
    issue.status,
    issue.id,
  ];

  const result = await kv.atomic()
    .check({ key: primaryKey, versionstamp: null })
    .check({ key: byCommunityKey, versionstamp: null })
    .set(primaryKey, issue)
    .set(byCommunityKey, issue)
    .set(byStatusKey, issue)
    .set(byCommunityAndStatusKey, issue)
    .commit();

  if (!result.ok) {
    throw new Error(`Failed to insert issue with ID ${issue.id}`);
  }
}

export async function updateIssue(id: string, issue: Partial<Issue>) {
  const key = [IssueIndex, id];
  const entry = await kv.get<Issue>([IssueIndex, id]);

  if (!entry) {
    throw new Error(`Issue with ID ${id} does not exist`);
  }

  const result = await kv.atomic()
    .check({ key, versionstamp: entry.versionstamp })
    .set(key, { ...entry.value, ...issue })
    .commit();

  if (!result.ok) {
    console.log(result);
    throw new Error(`Failed to update issue with ID ${id}`);
  }
}

export async function deleteIssue(
  id: string | undefined | null,
) {
  if (typeof id !== "string") {
    return null;
  }

  await kv.delete([IssueIndex, id]);

  if (await exists(`./${appConfig.uploadDir}/${id}`)) {
    await Deno.remove(`./${appConfig.uploadDir}/${id}`, { recursive: true });
  }
}

export async function getIssueById(
  id: string | undefined | null,
): Promise<IssueDTO | null> {
  if (typeof id !== "string" || id.trim() === "") {
    return null;
  }

  const primaryKey = [IssueIndex, id];
  const result = await kv.get<Issue>(primaryKey);

  if (!result.value || typeof result.value !== "object") {
    return null;
  }

  return await resolve(result.value);
}

export async function getIssuesByCommunity(
  communityId: string,
  options?: Deno.KvListOptions,
) {
  return await processIterator(
    kv.list<Issue>({
      prefix: [IssueSecondaryIndex.ByCommunity, communityId],
    }, options),
    resolve,
    options?.limit,
  );
}

export async function getIssuesByStatus(
  status: IssueStatus,
  options?: Deno.KvListOptions,
) {
  return await processIterator(
    kv.list<Issue>({
      prefix: [IssueSecondaryIndex.ByIssueStatus, status],
    }, options),
    resolve,
    options?.limit,
  );
}

export async function getIssuesByCommunityAndStatus(
  communityId?: string,
  status?: string | null,
  options?: Deno.KvListOptions,
) {
  if (
    typeof communityId !== "string" || typeof status !== "string" ||
    (communityId === "all" && status === "all")
  ) {
    return await getIssues(options);
  }

  if (communityId !== "all" && status === "all") {
    return await getIssuesByCommunity(communityId, options);
  }

  if (communityId === "all" && status !== "all" && isIssueStatus(status)) {
    return await getIssuesByStatus(status, options);
  }

  return await processIterator(
    kv.list<Issue>({
      prefix: [
        IssueSecondaryIndex.ByCommunityAndStatus,
        communityId,
        status,
      ],
    }, options),
    resolve,
  );
}

export async function getIssues(options?: Deno.KvListOptions) {
  return await processIterator(
    kv.list<Issue>({ prefix: [IssueIndex] }, options),
    resolve,
    options?.limit,
  );
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
