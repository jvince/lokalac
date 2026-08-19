import { resolve } from "@std/path";
import { appConfig } from "@/config.ts";
import { ensureKvDirectory } from "@/services/kv-directory.ts";

const path = resolve(
  // import.meta.dirname as string,
  `./${appConfig.kvStorageDir}`,
);

await ensureKvDirectory(path);

export const kv = await Deno.openKv(`${path}/kv.sqlite`);
