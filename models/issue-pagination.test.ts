import { assertEquals, assertRejects } from "@std/assert";
import { IssueCategoryIndex } from "./issue-category.ts";
import { IssueTypeIndex } from "./issue-type.ts";
import {
  getIssuesByCommunityAndStatus,
  insertIssue,
  type Issue,
  IssueStatus,
} from "./issue.ts";
import { LocalCommunityIndex } from "./local-community.ts";

const issues: Issue[] = [
  createIssue("issue-a", "north", IssueStatus.Open, "2026-08-19T10:00:00Z"),
  createIssue("issue-b", "north", IssueStatus.Open, "2026-08-19T11:00:00Z"),
  createIssue(
    "issue-c",
    "north",
    IssueStatus.Resolved,
    "2026-08-19T12:00:00Z",
  ),
  createIssue("issue-d", "south", IssueStatus.Open, "2026-08-19T13:00:00Z"),
  createIssue(
    "issue-e",
    "south",
    IssueStatus.Resolved,
    "2026-08-19T14:00:00Z",
  ),
  createIssue(
    "issue-f",
    "south",
    IssueStatus.Resolved,
    "2026-08-19T14:00:00Z",
  ),
];

function createIssue(
  id: string,
  communityId: string,
  status: IssueStatus,
  updatedAt: string,
): Issue {
  return {
    id,
    communityId,
    categoryId: "category",
    typeId: "type",
    status,
    createdAt: updatedAt,
    updatedAt,
  };
}

function expectedIds(
  community: string,
  status: string,
  reverse: boolean,
) {
  const result = issues.filter((issue) =>
    (community === "all" || issue.communityId === community) &&
    (status === "all" || issue.status === status)
  ).sort((left, right) => {
    const comparison = left.updatedAt.localeCompare(right.updatedAt) ||
      left.id.localeCompare(right.id);
    return reverse ? -comparison : comparison;
  });

  return result.map((issue) => issue.id);
}

async function readAllPages(
  store: Deno.Kv,
  community: string,
  status: string,
  reverse: boolean,
) {
  const ids: string[] = [];
  const pageSizes: number[] = [];
  let cursor = "";

  do {
    const result = await getIssuesByCommunityAndStatus(
      community,
      status,
      { cursor, limit: 2, reverse },
      store,
    );
    ids.push(...result.items.map((issue) => issue.id));
    pageSizes.push(result.items.length);
    cursor = result.cursor;
  } while (cursor);

  return { ids, pageSizes };
}

Deno.test("issue filtering, sorting, and pagination", async (t) => {
  const directory = await Deno.makeTempDir({
    prefix: "lokalac-issue-pagination-test-",
  });
  const store = await Deno.openKv(`${directory}/kv.sqlite`);

  try {
    await Promise.all([
      store.set([LocalCommunityIndex, "north"], {
        id: "north",
        name: "North",
        phone: [],
        link: "",
      }),
      store.set([LocalCommunityIndex, "south"], {
        id: "south",
        name: "South",
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
    await Promise.all(issues.map((issue) => insertIssue(issue, store)));

    const filters = [
      ["all", "all"],
      ["north", "all"],
      ["all", IssueStatus.Open],
      ["south", IssueStatus.Resolved],
    ] as const;

    for (const [community, status] of filters) {
      for (const reverse of [false, true]) {
        await t.step(
          `${community}/${status} ${reverse ? "descending" : "ascending"}`,
          async () => {
            const result = await readAllPages(
              store,
              community,
              status,
              reverse,
            );

            assertEquals(
              result.ids,
              expectedIds(community, status, reverse),
            );
            assertEquals(
              result.pageSizes.every((size) => size > 0 && size <= 2),
              true,
            );
          },
        );
      }
    }

    await t.step("handles exact and partial page boundaries", async () => {
      assertEquals(
        (await readAllPages(store, "all", "all", false)).pageSizes,
        [2, 2, 2],
      );
      assertEquals(
        (await readAllPages(store, "north", "all", false)).pageSizes,
        [2, 1],
      );
    });

    await t.step("rejects invalid model filters", async () => {
      await assertRejects(
        () => getIssuesByCommunityAndStatus("all", "unknown", {}, store),
        TypeError,
        "Invalid issue filters.",
      );
    });

    await t.step("rejects an invalid opaque cursor", async () => {
      await assertRejects(
        () =>
          getIssuesByCommunityAndStatus(
            "all",
            "all",
            { cursor: "notacursor", limit: 2 },
            store,
          ),
        TypeError,
      );
    });
  } finally {
    store.close();
    await Deno.remove(directory, { recursive: true });
  }
});
