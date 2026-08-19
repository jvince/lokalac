import { assertEquals, assertRejects } from "@std/assert";
import { ensureKvDirectory } from "@/services/kv-directory.ts";
import { openAppKv } from "@/services/kv.ts";

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

Deno.test("managed KV is opened without a filesystem path", async () => {
  const paths: Array<string | undefined> = [];
  const expected = {} as Deno.Kv;
  const openKv = ((path?: string | URL) => {
    paths.push(path?.toString());
    return Promise.resolve(expected);
  }) as typeof Deno.openKv;

  const actual = await openAppKv(
    { isDenoDeploy: true, kvStorageDir: "ignored" },
    openKv,
    () => Promise.reject(new Error("must not create a local directory")),
  );

  assertEquals(actual, expected);
  assertEquals(paths, [undefined]);
});

Deno.test("local KV uses the configured SQLite directory", async () => {
  let ensuredPath = "";
  let openedPath = "";
  const expected = {} as Deno.Kv;
  const openKv = ((path?: string | URL) => {
    openedPath = path?.toString() || "";
    return Promise.resolve(expected);
  }) as typeof Deno.openKv;

  const actual = await openAppKv(
    { isDenoDeploy: false, kvStorageDir: "test-kv" },
    openKv,
    (path) => {
      ensuredPath = path;
      return Promise.resolve();
    },
  );

  assertEquals(actual, expected);
  assertEquals(openedPath, `${ensuredPath}/kv.sqlite`);
});
