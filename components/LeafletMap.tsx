import { useEffect } from "preact/hooks";
import {
  latLng,
  LatLngBounds,
  latLngBounds,
  type LatLngTuple,
  type MapOptions,
  polygon,
} from "leaflet";
import type { ComponentChildren } from "preact";
import { MapContainer, Polygon, TileLayer, useMap } from "react-leaflet";
import { LatLng } from "https://esm.sh/@types/leaflet@1.9.18/index.d.ts";

function getPolygonCentroid(
  polygon: LatLngTuple[] | undefined | null,
): LatLngTuple {
  if (!polygon || polygon.length === 0) {
    return [0, 0];
  }

  const latitudes = polygon.map((point) => point[0]);
  const longitudes = polygon.map((point) => point[1]);
  const centerLat = (Math.min(...latitudes) + Math.max(...latitudes)) / 2;
  const centerLng = (Math.min(...longitudes) + Math.max(...longitudes)) / 2;

  return [centerLat, centerLng];
}

function getBounds(
  polygon: LatLngTuple[] | undefined | null,
) {
  if (!polygon || polygon.length === 0) {
    return latLngBounds([]);
  }

  const latitudes = polygon.map((point) => point[0]);
  const longitudes = polygon.map((point) => point[1]);

  const southWest = latLng(
    Math.min(...latitudes),
    Math.min(...longitudes),
  );
  const northEast = latLng(
    Math.max(...latitudes),
    Math.max(...longitudes),
  );

  return latLngBounds(southWest, northEast);
}

type TileLayerStyle =
  | "light_all"
  | "dark_all"
  | "light_nolabels"
  | "light_only_labels"
  | "dark_nolabels"
  | "dark_only_labels"
  | "rastertiles/voyager"
  | "rastertiles/voyager_nolabels"
  | "rastertiles/voyager_only_labels"
  | "rastertiles/voyager_labels_under";

interface LeafletMapProps extends MapOptions {
  children?: ComponentChildren;
  tileLayerStyle?: TileLayerStyle;
  polygon?: LatLngTuple[];
}

function LocalCommunityPolygon(props) {
  const map = useMap();

  useEffect(() => {
    const bounds = getBounds(props.polygon);

    if (bounds.isValid()) {
      const soutWest = bounds.getSouthWest();
      const northEast = bounds.getNorthEast();

      map.fitBounds([
        [soutWest.lat, soutWest.lng],
        [northEast.lat, northEast.lng],
      ], { animate: false });
    }
  }, [props.polygon]);

  return (
    <Polygon
      positions={props?.polygon ?? []}
      eventHandlers={{
        click: (e) => {
          console.log(e);
        },
      }}
    />
  );
}

export function LeafletMap(props: LeafletMapProps) {
  const {
    tileLayerStyle = "rastertiles/voyager",
    polygon,
  } = props;

  const center = getPolygonCentroid(polygon);

  return (
    <MapContainer
      style={{ height: 600 }}
      center={[46.093847, 19.5089604]}
      zoom={13}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        crossOrigin="anonymous"
        url={`https://{s}.basemaps.cartocdn.com/${tileLayerStyle}/{z}/{x}/{y}{r}.png`}
      />
      <LocalCommunityPolygon polygon={polygon} />

      {props.children}
    </MapContainer>
  );
}
