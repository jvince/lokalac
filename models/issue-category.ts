import { kv } from "$services/kv.ts";

export const IssueCategoryIndex = "issue_category";

export interface IssueCategory {
  id: string;
  name: string;
  description: string;
}

export async function* getIssueCategories(options?: Deno.KvListOptions) {
  const result = kv.list<IssueCategory>(
    { prefix: [IssueCategoryIndex] },
    options,
  );

  for await (const item of result) {
    yield item.value;
  }
}
