import { lazy } from "react-dom";

export const LeafletMapSSR = lazy(() =>
  import("$components/LeafletMap.tsx").then((mod) => mod.LeafletMap)
);
