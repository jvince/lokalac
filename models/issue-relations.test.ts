import { assertEquals, assertNotEquals } from "@std/assert";
import { ulid } from "@std/ulid";
import { IssueCategoryIndex } from "./issue-category.ts";
import {
  getIssueById,
  getIssues,
  insertIssue,
  inspectIssueIntegrity,
  type Issue,
  IssueStatus,
} from "./issue.ts";
import { IssueTypeIndex } from "./issue-type.ts";
import { LocalCommunityIndex } from "./local-community.ts";

function createIssue(id: string, patch: Partial<Issue> = {}): Issue {
  return {
    id,
    communityId: "community",
    categoryId: "category",
    typeId: "type",
    status: IssueStatus.Open,
    createdAt: "2026-08-19T10:00:00Z",
    updatedAt: `2026-08-19T10:00:00.${id.slice(-3)}Z`,
    ...patch,
  };
}

Deno.test("issue relation resolution is batched and integrity is reported", async (t) => {
  const directory = await Deno.makeTempDir({
    prefix: "lokalac-issue-relations-test-",
  });
  const uploadDir = `${directory}/upload`;
  const store = await Deno.openKv(`${directory}/kv.sqlite`);

  try {
    await Deno.mkdir(uploadDir);
    await Promise.all([
      store.set([LocalCommunityIndex, "community"], {
        id: "community",
        name: "Community",
        phone: [],
        link: "",
      }),
      store.set([IssueCategoryIndex, "category"], {
        id: "category",
        name: "Category",
        description: "",
      }),
      store.set([IssueTypeIndex, "type"], {
        id: "type",
        name: "Type",
        description: "",
        category: "category",
      }),
    ]);

    const issues = [
      createIssue(ulid()),
      createIssue(ulid()),
      createIssue(ulid()),
    ];
    await Promise.all(issues.map((issue) => insertIssue(issue, store)));
    let orphans: Issue[] = [];

    await t.step(
      "discards lookahead before two bulk relation queries",
      async () => {
        const batches: Deno.KvKey[][] = [];
        const instrumentedStore = new Proxy(store, {
          get(target, property) {
            if (property === "getMany") {
              return async (keys: Deno.KvKey[]) => {
                batches.push([...keys]);
                return await target.getMany(keys);
              };
            }

            const value = Reflect.get(target, property);
            return typeof value === "function" ? value.bind(target) : value;
          },
        });

        const result = await getIssues({ limit: 2 }, instrumentedStore);

        assertEquals(result.items.length, 2);
        assertNotEquals(result.cursor, "");
        assertEquals(batches.length, 2);
        assertEquals(batches[0].length, 2);
        assertEquals(batches[1].length, 3);
      },
    );

    await t.step(
      "missing relations are omitted instead of cast as records",
      async () => {
        orphans = [
          createIssue(ulid(), { communityId: "missing-community" }),
          createIssue(ulid(), { categoryId: "missing-category" }),
          createIssue(ulid(), { typeId: "missing-type" }),
        ];
        await Promise.all(orphans.map((issue) => insertIssue(issue, store)));

        for (const issue of orphans) {
          assertEquals(await getIssueById(issue.id, store), null);
        }
        const result = await getIssues(undefined, store);
        assertEquals(
          result.items.some((issue) =>
            orphans.some((orphan) => orphan.id === issue.id)
          ),
          false,
        );
      },
    );

    await t.step("reports orphaned references and upload entries", async () => {
      await Deno.mkdir(`${uploadDir}/${issues[0].id}`);
      await Deno.mkdir(`${uploadDir}/orphaned-upload`);

      const report = await inspectIssueIntegrity({ store, uploadDir });
      assertEquals(
        report.orphanedReferences.map((reference) =>
          `${reference.relation}:${reference.referencedId}`
        ).sort(),
        [
          "category:missing-category",
          "community:missing-community",
          "type:missing-type",
        ],
      );
      assertEquals(report.orphanedUploads, ["orphaned-upload"]);
    });
  } finally {
    store.close();
    await Deno.remove(directory, { recursive: true });
  }
});
