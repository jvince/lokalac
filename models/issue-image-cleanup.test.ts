import { assertEquals } from "@std/assert";
import { ulid } from "@std/ulid";
import type { ImageStorage, StoredImage } from "@/services/imageStorage.ts";
import {
  deleteIssue,
  insertIssue,
  IssueImageCleanupIndex,
  IssueStatus,
  retryIssueImageCleanup,
} from "@/models/issue.ts";

class FailingImageStorage implements ImageStorage {
  attempts = 0;

  put(): Promise<void> {
    return Promise.resolve();
  }

  get(): Promise<StoredImage | null> {
    return Promise.resolve(null);
  }

  deleteIssue(): Promise<void> {
    this.attempts += 1;
    if (this.attempts === 1) return Promise.reject(new Error("S3 unavailable"));
    return Promise.resolve();
  }

  listIssueIds(): Promise<string[]> {
    return Promise.resolve([]);
  }
}

Deno.test("failed image deletion is recorded and can be retried", async () => {
  const store = await Deno.openKv(":memory:");
  const storage = new FailingImageStorage();
  const id = ulid();

  try {
    await insertIssue({
      id,
      communityId: "community",
      categoryId: "category",
      typeId: "type",
      status: IssueStatus.Open,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images: [`/upload/${id}/image.webp`],
    }, store);

    assertEquals(await deleteIssue(id, { store, storage }), {
      status: "deleted",
    });
    assertEquals(
      (await store.get([IssueImageCleanupIndex, id])).value !== null,
      true,
    );

    assertEquals(await retryIssueImageCleanup({ store, storage }), {
      cleaned: [id],
      failed: [],
    });
    assertEquals(
      (await store.get([IssueImageCleanupIndex, id])).value,
      null,
    );
  } finally {
    store.close();
  }
});
