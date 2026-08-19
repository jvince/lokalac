import { assertEquals, assertRejects } from "@std/assert";
import {
  insertIssue,
  type Issue,
  IssueIndex,
  IssueSecondaryIndex,
  IssueStatus,
} from "./issue.ts";

Deno.test("issue persistence", async () => {
  const directory = await Deno.makeTempDir({
    prefix: "lokalac-issue-persistence-test-",
  });
  const store = await Deno.openKv(`${directory}/kv.sqlite`);
  const issue: Issue = {
    id: "01J00000000000000000000000",
    communityId: "community-1",
    categoryId: "roads",
    typeId: "pothole",
    status: IssueStatus.Open,
    note: "Broken pavement",
    location: { lat: 46.1, lng: 19.6 },
    images: ["/upload/image.webp"],
    createdAt: "2026-08-19T10:00:00Z",
    updatedAt: "2026-08-19T10:00:00Z",
  };

  try {
    await insertIssue(issue, store);

    const entries = await store.getMany<Issue[]>([
      [IssueIndex, issue.id],
      [IssueSecondaryIndex.ByCommunity, issue.communityId, issue.id],
      [IssueSecondaryIndex.ByIssueStatus, issue.status, issue.id],
      [
        IssueSecondaryIndex.ByCommunityAndStatus,
        issue.communityId,
        issue.status,
        issue.id,
      ],
    ]);

    for (const entry of entries) {
      assertEquals(entry.value, issue);
    }

    await assertRejects(
      () => insertIssue(issue, store),
      Error,
      `Failed to insert issue with ID ${issue.id}`,
    );
  } finally {
    store.close();
    await Deno.remove(directory, { recursive: true });
  }
});
