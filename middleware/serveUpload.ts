import { define } from "@/types/app.ts";
import { textResponse } from "@/utils/http.ts";

interface UploadServingOptions {
  uploadDir: string;
  uploadRoot?: string;
}

export const serveUpload = (options: UploadServingOptions) =>
  define.middleware(async (ctx) => {
    const { uploadDir, uploadRoot = uploadDir } = options;
    const pathname = ctx.url.pathname;
    const uploadPrefix = `/${uploadDir}/`;

    if (!pathname.startsWith(uploadPrefix)) {
      return ctx.next();
    }

    const relativePath = pathname.slice(uploadPrefix.length);

    if (
      relativePath.includes("..") ||
      relativePath.includes("\\") ||
      !relativePath.endsWith(".webp")
    ) {
      return textResponse("Forbidden", 403);
    }

    try {
      const filePath = `${uploadRoot}/${relativePath}`;
      const fileInfo = await Deno.stat(filePath);

      if (!fileInfo.isFile) {
        return textResponse("Not Found", 404);
      }

      const headers = new Headers({
        "Content-Type": "image/webp",
        "Content-Length": String(fileInfo.size),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      });

      const file = await Deno.open(filePath);

      return new Response(file.readable, { headers });
    } catch (error) {
      if (
        error instanceof Deno.errors.NotFound ||
        error instanceof Deno.errors.NotADirectory
      ) {
        return textResponse("Not Found", 404);
      }

      throw error;
    }
  });
