import { lazy } from "preact/compat";

export const LeafletMapSSR = lazy(() =>
  import("@/components/LeafletMap.tsx").then((mod) => mod.LeafletMap)
);
