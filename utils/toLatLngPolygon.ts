export function toLatLngPolygon(
  polygon: number[][][],
) {
  if (!polygon || polygon.length === 0) {
    return [];
  }

  return polygon[0].map((point) => [point[1], point[0]]);
}
