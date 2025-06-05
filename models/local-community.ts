import { kv } from "$services/kv.ts";

export interface LocalCommunity {
  id: string;
  name: string;
  phone: string[];
  link: string;
}

export const PrimaryKey = "local_community";

export async function getLocalCommunityById(id: string) {
  const key = [PrimaryKey, id];
  const result = await kv.get<LocalCommunity>(key);

  if (!result.value || typeof result.value !== "object") {
    return null;
  }

  return result.value;
}

export async function* getLocalCommunities(options?: Deno.KvListOptions) {
  const communities = await Array.fromAsync(
    kv.list<LocalCommunity>({ prefix: [PrimaryKey] }, options),
  );

  for await (const item of communities) {
    yield item.value;
  }
}
