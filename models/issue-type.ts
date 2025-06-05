import { kv } from "$services/kv.ts";

export const PrimaryKey = "issue_type";

export interface IssueType {
  id: string;
  name: string;
  description: string;
}

export async function* getIssueTypes(options?: Deno.KvListOptions) {
  const result = kv.list<IssueType>({ prefix: [PrimaryKey] }, options);

  for await (const item of result) {
    yield item.value;
  }
}
