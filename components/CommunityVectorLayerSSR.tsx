import { lazy } from "preact/compat";

export const CommunityVectorLayerSSR = lazy(() =>
  import("@/components/CommunityVectorLayer.tsx").then(
    (mod) => mod.CommunityVectorLayer,
  )
);
