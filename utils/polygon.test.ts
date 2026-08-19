import { assertEquals } from "@std/assert";
import type { LatLngTuple } from "leaflet";
import { isPointInPolygon } from "./polygon.ts";

const concavePolygon: LatLngTuple[] = [
  [0, 0],
  [0, 4],
  [2, 4],
  [2, 2],
  [4, 2],
  [4, 0],
  [0, 0],
];

Deno.test("isPointInPolygon handles concave polygons", async (t) => {
  await t.step("accepts a point inside the polygon", () => {
    assertEquals(isPointInPolygon([1, 3], concavePolygon), true);
  });

  await t.step(
    "rejects a point inside the bounding box but outside the polygon",
    () => {
      assertEquals(isPointInPolygon([3, 3], concavePolygon), false);
    },
  );

  await t.step("accepts a point on an edge", () => {
    assertEquals(isPointInPolygon([2, 3], concavePolygon), true);
  });

  await t.step("accepts a point on a vertex", () => {
    assertEquals(isPointInPolygon([2, 2], concavePolygon), true);
  });

  await t.step("rejects a point outside the polygon", () => {
    assertEquals(isPointInPolygon([5, 1], concavePolygon), false);
  });
});

Deno.test("isPointInPolygon rejects missing polygons", () => {
  assertEquals(isPointInPolygon([1, 1], null), false);
  assertEquals(isPointInPolygon([1, 1], undefined), false);
  assertEquals(isPointInPolygon([1, 1], []), false);
});
