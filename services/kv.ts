import { resolve } from "@std/path";
import { appConfig } from "@/config.ts";

const path = resolve(
  // import.meta.dirname as string,
  `./${appConfig.kvStorageDir}`,
);

try {
  await Deno.mkdir(path);
} catch {
  console.log(`KV storage directory already exists, continuing... (${path})`);
}

export const kv = await Deno.openKv(`${path}/kv.sqlite`);
