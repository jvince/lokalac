import { appConfig } from "@/config.ts";
import { kv } from "@/services/kv.ts";
import { isValidUlid } from "@/utils/ulid.ts";
import { dirname, resolve as resolvePath } from "@std/path";

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
  ByUpdatedAt = "issue_by_updated_at",
  ByCommunity = "issue_by_community",
  ByIssueStatus = "issue_by_status",
  ByCommunityAndStatus = "issue_by_community_and_status",
}

const LegacyIssueSecondaryIndexes = [
  "issue_by_category",
  "issue_by_type",
] as const;

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

export type DeleteIssueResult =
  | { status: "deleted" }
  | { status: "not_found" }
  | { status: "invalid_id" };

export type IssuePrimaryKey = [typeof IssueIndex, string];

export interface IssueIndexReference {
  primaryKey: IssuePrimaryKey;
}

export type IssueIndexProblem =
  | {
    type: "missing" | "invalid_value";
    key: Deno.KvKey;
    reference: IssueIndexReference;
  }
  | {
    type: "orphaned";
    key: Deno.KvKey;
  };

type IssueInsertStore = Pick<Deno.Kv, "atomic">;
type IssueUpdateStore = Pick<Deno.Kv, "atomic" | "get">;

async function processIterator<T, K>(
  iterator: Deno.KvListIterator<T>,
  resolver: (item: T) => Promise<K | null>,
  limit: number | undefined = Number.POSITIVE_INFINITY,
) {
  let pageCursor = "";
  const items: K[] = [];

  for await (const item of iterator) {
    const resolved = await resolver(item.value);

    if (resolved === null) {
      continue;
    }

    if (items.length === limit) {
      return { cursor: pageCursor, items };
    }

    items.push(resolved);
    pageCursor = iterator.cursor;
  }

  return { cursor: "", items };
}

function getIssueDirectory(
  id: string,
  uploadDir: string = appConfig.uploadDir,
): string {
  const uploadRoot = resolvePath(uploadDir);
  const issueDirectory = resolvePath(uploadRoot, id);

  if (dirname(issueDirectory) !== uploadRoot) {
    throw new Error("Invalid issue directory path.");
  }

  return issueDirectory;
}

export function isIssueStatus(value: unknown): value is IssueStatus {
  if (typeof value !== "string") {
    return false;
  }

  return Object.values(IssueStatus).includes(value as IssueStatus);
}

export function getIssuePrimaryKey(id: string): IssuePrimaryKey {
  return [IssueIndex, id];
}

export function getIssueSecondaryKeys(issue: Issue): Deno.KvKey[] {
  return [[
    IssueSecondaryIndex.ByUpdatedAt,
    issue.updatedAt,
    issue.id,
  ], [
    IssueSecondaryIndex.ByCommunity,
    issue.communityId,
    issue.updatedAt,
    issue.id,
  ], [
    IssueSecondaryIndex.ByIssueStatus,
    issue.status,
    issue.updatedAt,
    issue.id,
  ], [
    IssueSecondaryIndex.ByCommunityAndStatus,
    issue.communityId,
    issue.status,
    issue.updatedAt,
    issue.id,
  ]];
}

function createIssueIndexReference(id: string): IssueIndexReference {
  return { primaryKey: getIssuePrimaryKey(id) };
}

function keyId(key: Deno.KvKey): string {
  return JSON.stringify(key);
}

function isIssueIndexReference(
  value: unknown,
  reference: IssueIndexReference,
): boolean {
  if (!value || typeof value !== "object" || !("primaryKey" in value)) {
    return false;
  }

  return keyId((value as IssueIndexReference).primaryKey) ===
    keyId(reference.primaryKey);
}

export async function insertIssue(
  issue: Issue,
  store: IssueInsertStore = kv,
) {
  const primaryKey = getIssuePrimaryKey(issue.id);
  const reference = createIssueIndexReference(issue.id);
  let operation = store.atomic()
    .check({ key: primaryKey, versionstamp: null })
    .set(primaryKey, issue);

  for (const secondaryKey of getIssueSecondaryKeys(issue)) {
    operation = operation.set(secondaryKey, reference);
  }

  const result = await operation.commit();

  if (!result.ok) {
    throw new Error(`Failed to insert issue with ID ${issue.id}`);
  }
}

export async function updateIssue(
  id: string,
  patch: Partial<Issue>,
  store: IssueUpdateStore = kv,
) {
  const key = getIssuePrimaryKey(id);
  const entry = await store.get<Issue>(key);

  if (entry.value === null) {
    throw new Error(`Issue with ID ${id} does not exist`);
  }

  const updatedIssue = { ...entry.value, ...patch, id };
  const previousKeys = new Map(
    getIssueSecondaryKeys(entry.value).map((key) => [keyId(key), key]),
  );
  const updatedKeys = new Map(
    getIssueSecondaryKeys(updatedIssue).map((key) => [keyId(key), key]),
  );
  const reference = createIssueIndexReference(id);
  let operation = store.atomic()
    .check({ key, versionstamp: entry.versionstamp })
    .set(key, updatedIssue);

  for (const [keyIdentifier, previousKey] of previousKeys) {
    if (!updatedKeys.has(keyIdentifier)) {
      operation = operation.delete(previousKey);
    }
  }

  for (const updatedKey of updatedKeys.values()) {
    operation = operation.set(updatedKey, reference);
  }

  const result = await operation.commit();

  if (!result.ok) {
    throw new Error(`Failed to update issue with ID ${id}`);
  }

  return updatedIssue;
}

export async function deleteIssue(
  id: string | undefined | null,
  options: { store?: Deno.Kv; uploadDir?: string } = {},
): Promise<DeleteIssueResult> {
  if (!isValidUlid(id)) {
    return { status: "invalid_id" };
  }

  const { store = kv, uploadDir = appConfig.uploadDir } = options;
  const primaryKey = getIssuePrimaryKey(id);
  const entry = await store.get<Issue>(primaryKey);

  if (entry.value === null) {
    return { status: "not_found" };
  }

  if (entry.value.id !== id) {
    throw new Error(
      `Issue ID mismatch: expected ${id}, got ${entry.value.id}.`,
    );
  }

  let operation = store.atomic()
    .check({ key: primaryKey, versionstamp: entry.versionstamp })
    .delete(primaryKey);

  for (const secondaryKey of getIssueSecondaryKeys(entry.value)) {
    operation = operation.delete(secondaryKey);
  }

  const result = await operation.commit();

  if (!result.ok) {
    throw new Error(`Failed to delete issue with ID ${id}`);
  }

  const issueDirectory = getIssueDirectory(id, uploadDir);

  try {
    await Deno.remove(issueDirectory, { recursive: true });
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      throw new Error(`Failed to remove files for issue ${id}`, {
        cause: error,
      });
    }
  }

  return { status: "deleted" };
}

export async function getIssueById(
  id: string | undefined | null,
): Promise<IssueDTO | null> {
  if (!isValidUlid(id)) {
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
  store: Deno.Kv = kv,
) {
  return await processIterator(
    store.list<IssueIndexReference>({
      prefix: [IssueSecondaryIndex.ByCommunity, communityId],
    }, { ...options, limit: undefined }),
    (reference) => resolveIssueReference(reference, store),
    options?.limit,
  );
}

export async function getIssuesByStatus(
  status: IssueStatus,
  options?: Deno.KvListOptions,
  store: Deno.Kv = kv,
) {
  return await processIterator(
    store.list<IssueIndexReference>({
      prefix: [IssueSecondaryIndex.ByIssueStatus, status],
    }, { ...options, limit: undefined }),
    (reference) => resolveIssueReference(reference, store),
    options?.limit,
  );
}

export async function getIssuesByCommunityAndStatus(
  communityId?: string,
  status?: string | null,
  options?: Deno.KvListOptions,
  store: Deno.Kv = kv,
) {
  if (
    typeof communityId !== "string" || communityId.length === 0 ||
    typeof status !== "string" ||
    (status !== "all" && !isIssueStatus(status))
  ) {
    throw new TypeError("Invalid issue filters.");
  }

  if (
    (communityId === "all" && status === "all")
  ) {
    return await getIssues(options, store);
  }

  if (communityId !== "all" && status === "all") {
    return await getIssuesByCommunity(communityId, options, store);
  }

  if (communityId === "all" && status !== "all" && isIssueStatus(status)) {
    return await getIssuesByStatus(status, options, store);
  }

  return await processIterator(
    store.list<IssueIndexReference>({
      prefix: [
        IssueSecondaryIndex.ByCommunityAndStatus,
        communityId,
        status,
      ],
    }, { ...options, limit: undefined }),
    (reference) => resolveIssueReference(reference, store),
    options?.limit,
  );
}

export async function getIssues(
  options?: Deno.KvListOptions,
  store: Deno.Kv = kv,
) {
  return await processIterator(
    store.list<IssueIndexReference>(
      { prefix: [IssueSecondaryIndex.ByUpdatedAt] },
      { ...options, limit: undefined },
    ),
    (reference) => resolveIssueReference(reference, store),
    options?.limit,
  );
}

async function resolve(obj: Issue, store: Deno.Kv = kv): Promise<IssueDTO> {
  const data = await store.getMany<[LocalCommunity, IssueCategory, IssueType]>([
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

async function resolveIssueReference(
  reference: IssueIndexReference,
  store: Deno.Kv = kv,
): Promise<IssueDTO | null> {
  if (!reference?.primaryKey) {
    return null;
  }

  const entry = await store.get<Issue>(reference.primaryKey);
  return entry.value === null ? null : await resolve(entry.value, store);
}

export async function inspectIssueIndexes(
  store: Deno.Kv = kv,
): Promise<IssueIndexProblem[]> {
  const expected = new Map<
    string,
    { key: Deno.KvKey; reference: IssueIndexReference }
  >();

  for await (const entry of store.list<Issue>({ prefix: [IssueIndex] })) {
    const reference = createIssueIndexReference(entry.value.id);

    for (const secondaryKey of getIssueSecondaryKeys(entry.value)) {
      expected.set(keyId(secondaryKey), { key: secondaryKey, reference });
    }
  }

  const problems: IssueIndexProblem[] = [];

  const indexes = [
    ...Object.values(IssueSecondaryIndex),
    ...LegacyIssueSecondaryIndexes,
  ];

  for (const index of indexes) {
    for await (const entry of store.list({ prefix: [index] })) {
      const id = keyId(entry.key);
      const expectedEntry = expected.get(id);

      if (!expectedEntry) {
        problems.push({ type: "orphaned", key: entry.key });
        continue;
      }

      if (!isIssueIndexReference(entry.value, expectedEntry.reference)) {
        problems.push({
          type: "invalid_value",
          key: entry.key,
          reference: expectedEntry.reference,
        });
      }

      expected.delete(id);
    }
  }

  for (const { key, reference } of expected.values()) {
    problems.push({ type: "missing", key, reference });
  }

  return problems;
}

export async function repairIssueIndexes(
  store: Deno.Kv = kv,
): Promise<IssueIndexProblem[]> {
  const problems = await inspectIssueIndexes(store);

  for (const problem of problems) {
    if (problem.type === "orphaned") {
      await store.delete(problem.key);
    } else {
      await store.set(problem.key, problem.reference);
    }
  }

  return problems;
}
