import { PolygonPrimaryKey } from "$models/local-community.ts";
import { toLatLngPolygon } from "$utils/toLatLngPolygon.ts";
import { has } from "@es-toolkit/es-toolkit/compat";

interface Feature {
  type: string;
  properties: {
    mz_maticni_broj: number;
  };
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}

interface JSONData {
  features: Feature[];
}

async function loadJSONData() {
  const result = new Map<string, number[][]>();

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
        toLatLngPolygon(jsonData.features[0].geometry.coordinates),
      );
    }
  }

  return result;
}

export async function createPolygonMigration(): Promise<Deno.KvMutation[]> {
  const data = await loadJSONData();
  const mutations: Deno.KvMutation[] = [];

  for (const [key, value] of data.entries()) {
    mutations.push({
      key: [PolygonPrimaryKey, key],
      type: "set",
      value,
    });
  }

  return mutations;
}
