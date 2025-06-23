import { lazy } from "react-dom";

export const CommunityVectorLayerSSR = lazy(() =>
  import("$components/CommunityVectorLayer.tsx").then(
    (mod) => mod.CommunityVectorLayer,
  )
);
