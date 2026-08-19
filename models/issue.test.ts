import { assertEquals, assertRejects } from "@std/assert";
import { ulid } from "@std/ulid";
import { IssueCategoryIndex } from "./issue-category.ts";
import { IssueTypeIndex } from "./issue-type.ts";
import {
  deleteIssue,
  getIssuePrimaryKey,
  getIssuesByCommunityAndStatus,
  getIssueSecondaryKeys,
  insertIssue,
  inspectIssueIndexes,
  type Issue,
  type IssueIndexReference,
  IssueSecondaryIndex,
  IssueStatus,
  repairIssueIndexes,
  updateIssue,
} from "./issue.ts";
import { LocalCommunityIndex } from "./local-community.ts";

function createIssue(id: string, patch: Partial<Issue> = {}): Issue {
  return {
    communityId: "community-1",
    categoryId: "roads",
    typeId: "pothole",
    status: IssueStatus.Open,
    note: "Broken pavement",
    location: { lat: 46.1, lng: 19.6 },
    images: ["/upload/image.webp"],
    createdAt: "2026-08-19T10:00:00Z",
    updatedAt: "2026-08-19T10:00:00Z",
    ...patch,
    id,
  };
}

async function assertIndexes(
  store: Deno.Kv,
  issue: Issue,
  expected: IssueIndexReference | null,
) {
  for (const key of getIssueSecondaryKeys(issue)) {
    assertEquals((await store.get(key)).value, expected, JSON.stringify(key));
  }
}

Deno.test("issue persistence keeps secondary indexes consistent", async (t) => {
  const directory = await Deno.makeTempDir({
    prefix: "lokalac-issue-persistence-test-",
  });
  const uploadDir = `${directory}/upload`;
  const store = await Deno.openKv(`${directory}/kv.sqlite`);

  try {
    await t.step(
      "inserts primary-key references into every index",
      async () => {
        const issue = createIssue(ulid());
        const reference = { primaryKey: getIssuePrimaryKey(issue.id) };

        await insertIssue(issue, store);

        assertEquals(
          (await store.get(getIssuePrimaryKey(issue.id))).value,
          issue,
        );
        await assertIndexes(store, issue, reference);

        await assertRejects(
          () => insertIssue(issue, store),
          Error,
          `Failed to insert issue with ID ${issue.id}`,
        );
      },
    );

    await t.step("detects a missing record during update", async () => {
      const id = ulid();

      await assertRejects(
        () => updateIssue(id, { note: "Missing" }, store),
        Error,
        `Issue with ID ${id} does not exist`,
      );
    });

    await t.step("atomically moves all affected index entries", async () => {
      const original = createIssue(ulid());
      await insertIssue(original, store);

      const updated = await updateIssue(original.id, {
        communityId: "community-2",
        categoryId: "lighting",
        typeId: "street-light",
        status: IssueStatus.Resolved,
        note: "Repaired",
        updatedAt: "2026-08-20T10:00:00Z",
      }, store);
      const reference = { primaryKey: getIssuePrimaryKey(original.id) };

      assertEquals(
        (await store.get(getIssuePrimaryKey(original.id))).value,
        updated,
      );
      const updatedKeyIds = new Set(
        getIssueSecondaryKeys(updated).map((key) => JSON.stringify(key)),
      );
      for (const oldKey of getIssueSecondaryKeys(original)) {
        if (!updatedKeyIds.has(JSON.stringify(oldKey))) {
          assertEquals((await store.get(oldKey)).value, null);
        }
      }
      await assertIndexes(store, updated, reference);
    });

    await t.step(
      "indexed listings resolve the current primary record",
      async () => {
        const issue = createIssue(ulid(), {
          communityId: "listing-community",
          categoryId: "listing-category",
          typeId: "listing-type",
        });
        await Promise.all([
          store.set([LocalCommunityIndex, issue.communityId], {
            id: issue.communityId,
            name: "Center",
            phone: [],
            link: "",
          }),
          store.set([IssueCategoryIndex, issue.categoryId], {
            id: issue.categoryId,
            name: "Roads",
            description: "",
          }),
          store.set([IssueTypeIndex, issue.typeId], {
            id: issue.typeId,
            name: "Pothole",
            description: "",
            category: issue.categoryId,
          }),
        ]);
        await insertIssue(issue, store);
        await updateIssue(issue.id, { note: "Current primary value" }, store);

        const result = await getIssuesByCommunityAndStatus(
          issue.communityId,
          issue.status,
          undefined,
          store,
        );

        assertEquals(result.items.length, 1);
        assertEquals(result.items[0].note, "Current primary value");
      },
    );

    await t.step("deletes the primary record and every index", async () => {
      const issue = createIssue(ulid());
      await insertIssue(issue, store);

      assertEquals(
        await deleteIssue(issue.id, { store, uploadDir }),
        { status: "deleted" },
      );
      assertEquals(
        (await store.get(getIssuePrimaryKey(issue.id))).value,
        null,
      );
      await assertIndexes(store, issue, null);
    });

    await t.step("rejects one of two concurrent updates", async () => {
      const issue = createIssue(ulid());
      await insertIssue(issue, store);

      let readCount = 0;
      let releaseReads!: () => void;
      const bothRead = new Promise<void>((resolve) => {
        releaseReads = resolve;
      });
      const coordinatedStore = {
        atomic: () => store.atomic(),
        get: async <T>(key: Deno.KvKey) => {
          const entry = await store.get<T>(key);
          readCount += 1;

          if (readCount === 2) {
            releaseReads();
          }

          await bothRead;
          return entry;
        },
      };

      const results = await Promise.allSettled([
        updateIssue(issue.id, { note: "First" }, coordinatedStore),
        updateIssue(issue.id, { note: "Second" }, coordinatedStore),
      ]);

      assertEquals(
        results.map((result) => result.status).sort(),
        ["fulfilled", "rejected"],
      );
      const stored = await store.get<Issue>(getIssuePrimaryKey(issue.id));
      assertEquals(
        ["First", "Second"].includes(stored.value?.note ?? ""),
        true,
      );
    });

    await t.step(
      "detects and repairs stale, invalid, and missing indexes",
      async () => {
        const original = createIssue(ulid());
        await insertIssue(original, store);

        const changed = createIssue(original.id, {
          communityId: "community-3",
          status: IssueStatus.Reported,
        });
        await store.set(getIssuePrimaryKey(original.id), changed);

        const changedKeys = getIssueSecondaryKeys(changed);
        await store.set(changedKeys[1], changed);
        await store.set(
          [IssueSecondaryIndex.ByCommunity, "orphan", ulid()],
          { primaryKey: ["issue", "missing"] },
        );
        const unusedIndexKey = ["issue_by_category", "roads", original.id];
        await store.set(unusedIndexKey, original);

        const problems = await inspectIssueIndexes(store);
        assertEquals(
          [...new Set(problems.map((problem) => problem.type))].sort(),
          ["invalid_value", "missing", "orphaned"],
        );

        assertEquals(await repairIssueIndexes(store), problems);
        assertEquals(await inspectIssueIndexes(store), []);
        await assertIndexes(
          store,
          changed,
          { primaryKey: getIssuePrimaryKey(changed.id) },
        );
        assertEquals(
          (await store.get(getIssueSecondaryKeys(original)[1])).value,
          null,
        );
        assertEquals((await store.get(unusedIndexKey)).value, null);
      },
    );
  } finally {
    store.close();
    await Deno.remove(directory, { recursive: true });
  }
});
