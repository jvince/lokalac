import {
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { assertEquals } from "@std/assert";
import {
  FileSystemImageStorage,
  S3ImageStorage,
} from "@/services/imageStorage.ts";

Deno.test("filesystem image storage contract", async () => {
  const root = await Deno.makeTempDir();
  const storage = new FileSystemImageStorage(root);
  const bytes = new Uint8Array([1, 2, 3]);

  try {
    await storage.put("issue-one", "image.webp", bytes);
    await storage.put("issue-two", "image.webp", bytes);

    assertEquals(await storage.listIssueIds(), ["issue-one", "issue-two"]);
    const stored = await storage.get("issue-one", "image.webp");
    assertEquals(stored?.contentType, "image/webp");
    assertEquals(
      new Uint8Array(await new Response(stored?.body).arrayBuffer()),
      bytes,
    );

    await storage.deleteIssue("issue-one");
    assertEquals(await storage.get("issue-one", "image.webp"), null);
    assertEquals(await storage.listIssueIds(), ["issue-two"]);
  } finally {
    await Deno.remove(root, { recursive: true });
  }
});

class FakeS3Client {
  readonly objects = new Map<string, Uint8Array>();

  async send(command: unknown): Promise<unknown> {
    await Promise.resolve();
    if (command instanceof PutObjectCommand) {
      this.objects.set(
        command.input.Key!,
        command.input.Body as Uint8Array,
      );
      return {};
    }
    if (command instanceof GetObjectCommand) {
      const bytes = this.objects.get(command.input.Key!);
      if (!bytes) {
        throw Object.assign(new Error("missing"), { name: "NoSuchKey" });
      }
      return {
        Body: {
          transformToWebStream: () => new Blob([bytes.slice().buffer]).stream(),
        },
        ContentLength: bytes.length,
        ContentType: "image/webp",
      };
    }
    if (command instanceof ListObjectsV2Command) {
      const prefix = command.input.Prefix || "";
      const keys = [...this.objects.keys()].filter((key) =>
        key.startsWith(prefix)
      );
      if (command.input.Delimiter) {
        return {
          CommonPrefixes: [
            ...new Set(keys.map((key) => {
              const remainder = key.slice(prefix.length);
              return `${prefix}${remainder.split("/")[0]}/`;
            })),
          ].map((Prefix) => ({ Prefix })),
          IsTruncated: false,
        };
      }
      return {
        Contents: keys.map((Key) => ({ Key })),
        IsTruncated: false,
      };
    }
    if (command instanceof DeleteObjectsCommand) {
      for (const object of command.input.Delete?.Objects || []) {
        if (object.Key) this.objects.delete(object.Key);
      }
      return {};
    }
    throw new Error("Unexpected S3 command");
  }
}

Deno.test("S3 image storage scopes objects to its timeline prefix", async () => {
  const client = new FakeS3Client();
  const storage = new S3ImageStorage(
    "bucket",
    "eu-central-1",
    "git-branch/feature",
    client as unknown as S3Client,
  );
  const bytes = new Uint8Array([4, 5, 6]);

  await storage.put("issue-one", "image.webp", bytes);
  await storage.put("issue-two", "image.webp", bytes);

  assertEquals([...client.objects.keys()].sort(), [
    "git-branch/feature/issue-one/image.webp",
    "git-branch/feature/issue-two/image.webp",
  ]);
  assertEquals(await storage.listIssueIds(), ["issue-one", "issue-two"]);
  const stored = await storage.get("issue-one", "image.webp");
  assertEquals(
    new Uint8Array(await new Response(stored?.body).arrayBuffer()),
    bytes,
  );

  await storage.deleteIssue("issue-one");
  assertEquals(await storage.get("issue-one", "image.webp"), null);
  assertEquals(await storage.listIssueIds(), ["issue-two"]);
});
