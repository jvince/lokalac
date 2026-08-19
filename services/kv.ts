import { resolve } from "@std/path";
import { appConfig } from "@/config.ts";
import { ensureKvDirectory } from "@/services/kv-directory.ts";

export async function openAppKv(
  config: Pick<typeof appConfig, "isDenoDeploy" | "kvStorageDir"> = appConfig,
  openKv: typeof Deno.openKv = Deno.openKv,
  ensureDirectory: typeof ensureKvDirectory = ensureKvDirectory,
): Promise<Deno.Kv> {
  if (config.isDenoDeploy) {
    return await openKv();
  }

  const localPath = resolve(`./${config.kvStorageDir}`);
  await ensureDirectory(localPath);
  return await openKv(`${localPath}/kv.sqlite`);
}

export const kv = await openAppKv();
