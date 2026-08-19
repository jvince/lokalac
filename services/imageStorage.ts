import { appConfig } from "@/config.ts";
import { ensureDir } from "@std/fs";
import { join } from "@std/path";
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

export const UPLOAD_ROUTE = "upload";

export interface StoredImage {
  body: ReadableStream<Uint8Array>;
  contentLength?: number;
  contentType: string;
}

export interface ImageStorage {
  put(issueId: string, fileName: string, data: Uint8Array): Promise<void>;
  get(issueId: string, fileName: string): Promise<StoredImage | null>;
  deleteIssue(issueId: string): Promise<void>;
  listIssueIds(): Promise<string[]>;
}

export function imageUrl(issueId: string, fileName: string): string {
  return `/${UPLOAD_ROUTE}/${issueId}/${fileName}`;
}

export class FileSystemImageStorage implements ImageStorage {
  constructor(private readonly root: string) {}

  async put(
    issueId: string,
    fileName: string,
    data: Uint8Array,
  ): Promise<void> {
    const directory = join(this.root, issueId);
    await ensureDir(directory);
    await Deno.writeFile(join(directory, fileName), data);
  }

  async get(issueId: string, fileName: string): Promise<StoredImage | null> {
    try {
      const path = join(this.root, issueId, fileName);
      const info = await Deno.stat(path);
      if (!info.isFile) return null;

      const file = await Deno.open(path);
      return {
        body: file.readable,
        contentLength: info.size,
        contentType: "image/webp",
      };
    } catch (error) {
      if (
        error instanceof Deno.errors.NotFound ||
        error instanceof Deno.errors.NotADirectory
      ) {
        return null;
      }
      throw error;
    }
  }

  async deleteIssue(issueId: string): Promise<void> {
    try {
      await Deno.remove(join(this.root, issueId), { recursive: true });
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) throw error;
    }
  }

  async listIssueIds(): Promise<string[]> {
    const ids: string[] = [];
    try {
      for await (const entry of Deno.readDir(this.root)) {
        if (entry.isDirectory) ids.push(entry.name);
      }
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) throw error;
    }
    return ids.sort();
  }
}

export class S3ImageStorage implements ImageStorage {
  private readonly rootPrefix: string;

  constructor(
    private readonly bucket: string,
    region: string,
    prefix: string,
    private readonly client = new S3Client({ region }),
  ) {
    this.rootPrefix = prefix.replace(/^\/+|\/+$/g, "");
  }

  async put(
    issueId: string,
    fileName: string,
    data: Uint8Array,
  ): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: this.key(issueId, fileName),
        Body: data,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
  }

  async get(issueId: string, fileName: string): Promise<StoredImage | null> {
    try {
      const output = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: this.key(issueId, fileName),
        }),
      );
      if (!output.Body) return null;

      return {
        body: output.Body.transformToWebStream(),
        contentLength: output.ContentLength,
        contentType: output.ContentType || "image/webp",
      };
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === "NoSuchKey" || error.name === "NotFound")
      ) {
        return null;
      }
      throw error;
    }
  }

  async deleteIssue(issueId: string): Promise<void> {
    const prefix = this.key(issueId, "");
    let continuationToken: string | undefined;

    do {
      const page = await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        }),
      );
      const objects = (page.Contents || []).flatMap((object) =>
        object.Key ? [{ Key: object.Key }] : []
      );
      if (objects.length > 0) {
        const deleted = await this.client.send(
          new DeleteObjectsCommand({
            Bucket: this.bucket,
            Delete: { Objects: objects, Quiet: true },
          }),
        );
        if (deleted.Errors?.length) {
          throw new Error(
            `S3 failed to delete ${deleted.Errors.length} image object(s).`,
          );
        }
      }
      continuationToken = page.IsTruncated
        ? page.NextContinuationToken
        : undefined;
    } while (continuationToken);
  }

  async listIssueIds(): Promise<string[]> {
    const prefix = `${this.rootPrefix}/`;
    const ids = new Set<string>();
    let continuationToken: string | undefined;

    do {
      const page = await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: prefix,
          Delimiter: "/",
          ContinuationToken: continuationToken,
        }),
      );
      for (const item of page.CommonPrefixes || []) {
        if (!item.Prefix) continue;
        const id = item.Prefix.slice(prefix.length).replace(/\/$/, "");
        if (id) ids.add(id);
      }
      continuationToken = page.IsTruncated
        ? page.NextContinuationToken
        : undefined;
    } while (continuationToken);

    return [...ids].sort();
  }

  private key(issueId: string, fileName: string): string {
    return `${this.rootPrefix}/${issueId}/${fileName}`;
  }
}

export function createImageStorage(
  config: Pick<
    typeof appConfig,
    | "imageStorage"
    | "uploadDir"
    | "uploadBucket"
    | "awsRegion"
    | "uploadPrefix"
  > = appConfig,
): ImageStorage {
  if (config.imageStorage === "filesystem") {
    return new FileSystemImageStorage(config.uploadDir);
  }

  if (!config.uploadBucket || !config.awsRegion) {
    throw new Error(
      "UPLOAD_BUCKET and AWS_REGION must be set when IMAGE_STORAGE=s3.",
    );
  }

  return new S3ImageStorage(
    config.uploadBucket,
    config.awsRegion,
    config.uploadPrefix,
  );
}

export const imageStorage = createImageStorage();
