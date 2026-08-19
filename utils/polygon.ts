import { booleanPointInPolygon } from "@turf/boolean-point-in-polygon";
import * as turfHelpers from "@turf/helpers";
import type { LatLngTuple } from "leaflet";

export function isPointInPolygon(
  latLng: LatLngTuple,
  polygon: LatLngTuple[] | undefined | null,
): boolean {
  if (!latLng || !polygon || polygon.length === 0) {
    return false;
  }

  const pointFeature = turfHelpers.point([latLng[1], latLng[0]]);
  const polygonFeature = turfHelpers.polygon([
    polygon.map(([lat, lng]) => [lng, lat]),
  ]);
  return booleanPointInPolygon(pointFeature, polygonFeature);
}
