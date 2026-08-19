import { define } from "@/types/app.ts";
import { textResponse } from "@/utils/http.ts";
import {
  FileSystemImageStorage,
  type ImageStorage,
  imageStorage,
  UPLOAD_ROUTE,
} from "@/services/imageStorage.ts";

interface UploadServingOptions {
  storage?: ImageStorage;
  uploadDir?: string;
  uploadRoot?: string;
}

export const serveUpload = (options: UploadServingOptions) =>
  define.middleware(async (ctx) => {
    const storage = options.storage ||
      (options.uploadRoot || options.uploadDir
        ? new FileSystemImageStorage(options.uploadRoot || options.uploadDir!)
        : imageStorage);
    const pathname = ctx.url.pathname;
    const uploadPrefix = `/${UPLOAD_ROUTE}/`;

    if (!pathname.startsWith(uploadPrefix)) {
      return ctx.next();
    }

    const relativePath = pathname.slice(uploadPrefix.length);

    const parts = relativePath.split("/");
    if (
      parts.length !== 2 ||
      parts.some((part) => !part || part === "." || part === "..") ||
      relativePath.includes("..") ||
      relativePath.includes("\\") ||
      !parts[1].endsWith(".webp")
    ) {
      return textResponse("Forbidden", 403);
    }

    const stored = await storage.get(parts[0], parts[1]);
    if (!stored) return textResponse("Not Found", 404);

    const headers = new Headers({
      "Content-Type": stored.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    });
    if (stored.contentLength !== undefined) {
      headers.set("Content-Length", String(stored.contentLength));
    }

    return new Response(stored.body, { headers });
  });
