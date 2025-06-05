import { kv } from "$services/kv.ts";

export const PrimaryKey = "issue_category";

export interface IssueCategory {
  id: string;
  name: string;
  description: string;
}

export async function* getIssueCategories(options?: Deno.KvListOptions) {
  const result = kv.list<IssueCategory>({ prefix: [PrimaryKey] }, options);

  for await (const item of result) {
    yield item.value;
  }
}
