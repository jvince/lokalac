import { latLng, latLngBounds, type LatLngTuple } from "leaflet";

export function getPolygonCentroid(
  polygon: LatLngTuple[] | undefined | null,
): LatLngTuple {
  if (!polygon || polygon.length === 0) {
    return [0, 0];
  }

  let minLat = Infinity,
    maxLat = -Infinity,
    minLng = Infinity,
    maxLng = -Infinity;

  for (const [lat, lng] of polygon) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  return [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
}

export function getBounds(
  polygon: LatLngTuple[] | undefined | null,
) {
  if (!polygon?.length) {
    return latLngBounds([]);
  }

  let minLat = Infinity,
    maxLat = -Infinity,
    minLng = Infinity,
    maxLng = -Infinity;

  for (const [lat, lng] of polygon) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  return latLngBounds(
    latLng(minLat, minLng),
    latLng(maxLat, maxLng),
  );
}
