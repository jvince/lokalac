import { lazy } from "react-dom";

export const MarkerSSR = lazy(() => (
  import("react-leaflet").then((mod) => mod.Marker)
));
