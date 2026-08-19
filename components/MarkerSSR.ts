import { lazy } from "preact/compat";

export const MarkerSSR = lazy(() => (
  import("react-leaflet").then((mod) => mod.Marker)
));
