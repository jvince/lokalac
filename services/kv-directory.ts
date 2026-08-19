export async function ensureKvDirectory(
  directory: string,
  mkdir: typeof Deno.mkdir = Deno.mkdir,
) {
  await mkdir(directory, { recursive: true });
}
