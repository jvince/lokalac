import { kv } from "$services/kv.ts";
import type { LatLngTuple } from "leaflet";

export const LocalCommunityIndex = "local_community";

export const LocalCommunityPolygonIndex = "local_community_polygon";

export interface LocalCommunity {
  id: string;
  name: string;
  phone: string[];
  link: string;
}

export type LocalCommunityPolygon = LatLngTuple[];

export async function getLocalCommunityById(id: string) {
  const key = [LocalCommunityIndex, id];
  const result = await kv.get<LocalCommunity>(key);

  if (!result.value || typeof result.value !== "object") {
    return null;
  }

  return result.value;
}

export async function* getLocalCommunities(options?: Deno.KvListOptions) {
  const communities = await Array.fromAsync(
    kv.list<LocalCommunity>({ prefix: [LocalCommunityIndex] }, options),
  );

  for await (const item of communities) {
    yield item.value;
  }
}

export async function getLocalCommunityPolygonById(id: string) {
  const key = [LocalCommunityPolygonIndex, id];
  const result = await kv.get<LocalCommunityPolygon>(key);

  if (!result.value || !Array.isArray(result.value)) {
    return null;
  }

  return result.value;
}
