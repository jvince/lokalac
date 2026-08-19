import { retryIssueImageCleanup } from "@/models/issue.ts";
import { imageStorage } from "@/services/imageStorage.ts";
import { kv } from "@/services/kv.ts";

try {
  const result = await retryIssueImageCleanup({
    storage: imageStorage,
    store: kv,
  });
  console.log(
    `Image cleanup complete: ${result.cleaned.length} cleaned, ${result.failed.length} failed.`,
  );
  if (result.failed.length) Deno.exitCode = 1;
} finally {
  kv.close();
}
