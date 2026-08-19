import { assertEquals, assertThrows } from "@std/assert";
import {
  InvalidIssueListQueryError,
  parseIssueListQuery,
} from "./issue-list-query.ts";

const communities = ["north", "south"];

Deno.test("issue list query validation", async (t) => {
  await t.step("applies controlled defaults", () => {
    assertEquals(parseIssueListQuery(new URLSearchParams(), communities), {
      community: "all",
      status: "all",
      updatedAt: "desc",
      cursor: "",
    });
  });

  await t.step("accepts valid filters and a cursor", () => {
    const params = new URLSearchParams({
      community: "north",
      status: "resolved",
      updatedAt: "asc",
      cursor: "Ib_wAAAAAAAA",
    });

    assertEquals(parseIssueListQuery(params, communities), {
      community: "north",
      status: "resolved",
      updatedAt: "asc",
      cursor: "Ib_wAAAAAAAA",
    });
  });

  await t.step("rejects invalid filters and cursors", () => {
    const invalidQueries: Record<string, string>[] = [
      { community: "missing" },
      { status: "unknown" },
      { updatedAt: "sideways" },
      { cursor: "not a cursor" },
      { cursor: "a".repeat(1_025) },
    ];

    for (const query of invalidQueries) {
      assertThrows(
        () => parseIssueListQuery(new URLSearchParams(query), communities),
        InvalidIssueListQueryError,
      );
    }
  });
});
