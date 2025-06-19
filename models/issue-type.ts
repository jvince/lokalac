import { kv } from "$services/kv.ts";

export const IssueTypeIndex = "issue_type";

export interface IssueType {
  id: string;
  name: string;
  description: string;
  category: string;
}

export async function* getIssueTypes(options?: Deno.KvListOptions) {
  const result = kv.list<IssueType>({ prefix: [IssueTypeIndex] }, options);

  for await (const item of result) {
    yield item.value;
  }
}
