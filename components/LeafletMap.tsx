import { type MapOptions } from "leaflet";
import type { ComponentChildren } from "preact";
import { MapContainer, TileLayer } from "react-leaflet";

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
}

export function LeafletMap(props: LeafletMapProps) {
  const {
    tileLayerStyle = "rastertiles/voyager",
  } = props;

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
      {props.children}
    </MapContainer>
  );
}
