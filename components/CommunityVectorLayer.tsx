import { getBounds } from "$utils/geometry.ts";
import type {
  LatLng,
  LatLngTuple,
  LeafletMouseEvent,
  LeafletMouseEventHandlerFn,
} from "leaflet";
import { useCallback, useLayoutEffect } from "preact/hooks";
import { Polygon, type PolygonProps, useMap } from "react-leaflet";

interface CommunityVectorLayerProps extends PolygonProps {
  onClick?: (e: LeafletMouseEvent, data: LatLng) => void;
}

export function CommunityVectorLayer(props: CommunityVectorLayerProps) {
  const {
    onClick,
    ...restProps
  } = props;

  const map = useMap();
  const onClickHandler: LeafletMouseEventHandlerFn = useCallback((e) => {
    onClick?.(e, e.latlng);
  }, [onClick]);

  useLayoutEffect(() => {
    const bounds = getBounds(props.positions as LatLngTuple[]);

    if (bounds.isValid()) {
      const southWest = bounds.getSouthWest();
      const northEast = bounds.getNorthEast();

      map.fitBounds([
        [southWest.lat, southWest.lng],
        [northEast.lat, northEast.lng],
      ], { animate: false });
    }
  }, [props.positions]);

  return (
    <Polygon
      {...restProps}
      eventHandlers={{
        click: onClickHandler,
      }}
    />
  );
}
