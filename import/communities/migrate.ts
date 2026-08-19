import {
  LocalCommunityIndex,
  LocalCommunityPolygonIndex,
} from "@/models/local-community.ts";
import { has } from "@es-toolkit/es-toolkit/compat";

interface Feature {
  type: string;
  properties: {
    mz_maticni_broj: number;
    name: string;
    name_sr_Cyrl_RS: string;
    name_hu: string;
    phone?: string[];
    link?: string;
  };
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}

interface JSONData {
  features: Feature[];
}

function toLatLngPolygon(
  polygon: number[][][],
) {
  if (!polygon || polygon.length === 0) {
    return [];
  }

  return polygon[0].map((point) => [point[1], point[0]]);
}

async function loadJSONData() {
  const result = new Map<string, Feature>();

  if (typeof import.meta.dirname !== "string") {
    throw new Error("import.meta.dirname is not supported in this environment");
  }

  for await (const dirEntry of Deno.readDir(import.meta.dirname)) {
    if (dirEntry.isFile && dirEntry.name.endsWith(".json")) {
      const filePath = `${import.meta.dirname}/${dirEntry.name}`;
      const data = await Deno.readTextFile(filePath);
      const jsonData = JSON.parse(data) as JSONData;

      if (!has(jsonData, "features[0].properties.mz_maticni_broj")) {
        throw new Error(
          `Missing mz_maticni_broj in ${dirEntry.name}`,
        );
      }

      if (!has(jsonData, "features[0].properties.name")) {
        throw new Error(
          `Missing name in ${dirEntry.name}`,
        );
      }

      if (!has(jsonData, "features[0].properties.name_sr_Cyrl_RS")) {
        throw new Error(
          `Missing name_sr_Cyrl_RS in ${dirEntry.name}`,
        );
      }

      if (!has(jsonData, "features[0].properties.name_hu")) {
        throw new Error(
          `Missing name_hu in ${dirEntry.name}`,
        );
      }

      if (!has(jsonData, "features[0].geometry.coordinates")) {
        throw new Error(
          `Missing coordinates in ${dirEntry.name}`,
        );
      }

      if (!Array.isArray(jsonData.features[0].geometry.coordinates)) {
        throw new Error(
          `Invalid coordinates format in ${dirEntry.name}`,
        );
      }

      result.set(
        String(jsonData.features[0].properties.mz_maticni_broj),
        jsonData.features[0],
      );
    }
  }

  return result;
}

export async function createCommunityMigration(): Promise<Deno.KvMutation[]> {
  const data = await loadJSONData();
  const mutations: Deno.KvMutation[] = [];

  for (const [key, value] of data.entries()) {
    mutations.push({
      key: [LocalCommunityIndex, key],
      type: "set",
      value: {
        id: key,
        name: value.properties.name,
        name_sr_Cyrl_RS: value.properties.name_sr_Cyrl_RS,
        name_hu: value.properties.name_hu,
        phone: value.properties.phone ?? [],
        link: value.properties.link,
      },
    });

    mutations.push({
      key: [LocalCommunityPolygonIndex, key],
      type: "set",
      value: toLatLngPolygon(value.geometry.coordinates),
    });
  }

  return mutations;
}
