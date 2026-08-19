import { repairIssueIndexes } from "@/models/issue.ts";
import { kv } from "@/services/kv.ts";

try {
  const problems = await repairIssueIndexes(kv);
  console.log(`Repaired ${problems.length} issue index problem(s).`);
} finally {
  kv.close();
}
