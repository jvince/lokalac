import { type LatLngTuple } from "leaflet";
import type { ComponentChildren } from "preact";
import { MapContainer, type MapContainerProps, TileLayer } from "react-leaflet";

export type TileLayerStyle =
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

interface LeafletMapProps extends MapContainerProps {
  children?: ComponentChildren;
  tileLayerStyle?: TileLayerStyle;
}
const defaultZoom = 13;
const maxZoom = 18;

export function LeafletMap(props: LeafletMapProps) {
  const {
    children,
    center,
    tileLayerStyle = "rastertiles/voyager",
    zoom = defaultZoom,
    ...restProps
  } = props;

  return (
    <MapContainer
      center={center}
      maxZoom={maxZoom}
      zoom={zoom}
      {...restProps}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        crossOrigin="anonymous"
        url={`https://{s}.basemaps.cartocdn.com/${tileLayerStyle}/{z}/{x}/{y}{r}.png`}
      />
      {children}
    </MapContainer>
  );
}
