import type { MapOptions } from "leaflet";
import type { ComponentChildren } from "preact";
import { MapContainer, TileLayer } from "react-leaflet";

interface LeafletMapProps extends MapOptions {
  children?: ComponentChildren;
}

export function LeafletMap(props: LeafletMapProps) {
  return (
    <MapContainer
      style={{ height: 240 }}
      center={[51.505, -0.09]}
      zoom={13}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      {props.children}
    </MapContainer>
  );
}
