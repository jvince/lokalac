import { assertEquals, assertRejects } from "@std/assert";
import { ensureKvDirectory } from "@/services/kv-directory.ts";

Deno.test("KV directory creation is repeatable", async () => {
  const directory = await Deno.makeTempDir();
  try {
    await ensureKvDirectory(directory);
    await ensureKvDirectory(directory);
  } finally {
    await Deno.remove(directory, { recursive: true });
  }
});

Deno.test("KV directory creation preserves unexpected errors", async () => {
  const expected = new Deno.errors.PermissionDenied("denied");
  const error = await assertRejects(() =>
    ensureKvDirectory("ignored", () => Promise.reject(expected))
  );

  assertEquals(error, expected);
});
