import type { AppState } from "@/types/app.ts";
import { assertEquals } from "@std/assert";
import { App } from "fresh";
import { serveUpload } from "./serveUpload.ts";

Deno.test("serveUpload middleware", async (t) => {
  const uploadRoot = await Deno.makeTempDir({
    prefix: "lokalac-upload-serving-test-",
  });
  const issueDirectory = `${uploadRoot}/issue-id`;
  const imageBytes = new Uint8Array([0x52, 0x49, 0x46, 0x46]);

  await Deno.mkdir(issueDirectory);
  await Deno.writeFile(`${issueDirectory}/image.webp`, imageBytes);
  await Deno.mkdir(`${issueDirectory}/directory.webp`);
  await Deno.writeTextFile(`${uploadRoot}/not-a-directory`, "file");

  const handler = new App<AppState>()
    .use(serveUpload({ uploadDir: "upload", uploadRoot }))
    .use(() => new Response("Next middleware"))
    .handler();
  const request = (pathname: string) =>
    handler(new Request(`http://localhost${pathname}`));

  try {
    await t.step(
      "serves WebP files with cache and security headers",
      async () => {
        const response = await request("/upload/issue-id/image.webp");

        assertEquals(response.status, 200);
        assertEquals(response.headers.get("Content-Type"), "image/webp");
        assertEquals(
          response.headers.get("Cache-Control"),
          "public, max-age=31536000, immutable",
        );
        assertEquals(
          response.headers.get("X-Content-Type-Options"),
          "nosniff",
        );
        assertEquals(
          response.headers.get("Content-Length"),
          String(imageBytes.length),
        );
        assertEquals(
          new Uint8Array(await response.arrayBuffer()),
          imageBytes,
        );
      },
    );

    await t.step("continues outside the upload prefix", async () => {
      const response = await request("/static/image.webp");

      assertEquals(response.status, 200);
      assertEquals(await response.text(), "Next middleware");
    });

    await t.step("rejects suspicious and non-WebP paths", async () => {
      const unsafePaths = [
        "/upload/issue..id/image.webp",
        "/upload/issue-id/image.png",
      ];

      for (const pathname of unsafePaths) {
        const response = await request(pathname);

        assertEquals(response.status, 403, pathname);
        assertEquals(
          response.headers.get("X-Content-Type-Options"),
          "nosniff",
        );
      }
    });

    await t.step("does not serve normalized traversal paths", async () => {
      const response = await request("/upload/%2e%2e/outside.webp");

      assertEquals(response.status, 200);
      assertEquals(await response.text(), "Next middleware");
    });

    await t.step("returns 404 for missing files", async () => {
      const response = await request("/upload/issue-id/missing.webp");

      assertEquals(response.status, 404);
      assertEquals(await response.text(), "Not Found");
    });

    await t.step("returns 404 for directories", async () => {
      const response = await request("/upload/issue-id/directory.webp");

      assertEquals(response.status, 404);
    });

    await t.step("returns 404 for invalid intermediate paths", async () => {
      const response = await request("/upload/not-a-directory/image.webp");

      assertEquals(response.status, 404);
    });
  } finally {
    await Deno.remove(uploadRoot, { recursive: true });
  }
});
