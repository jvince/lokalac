import { resolve } from "node:path";

const storageDir = Deno.env.get("KV_STORAGE_DIR") || "data";
const path = resolve(import.meta.dirname as string, `../${storageDir}`);

try {
  await Deno.mkdir(path);
} catch {
  console.log(`KV storage directory already exists, continuing... (${path})`);
}

export const kv = await Deno.openKv(`${path}/kv.sqlite`);
