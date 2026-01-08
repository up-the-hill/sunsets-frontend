import { LngLat, LngLatBounds, Map } from 'maplibre-gl';
import { css } from '@linaria/core';
import { useEffect, useState } from 'react';

interface DebugProps {
  map: Map | null;
}

function getDistanceFromLatLonInKm(pos1: LngLat, pos2: LngLat) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(pos2.lat - pos1.lat);  // deg2rad below
  const dLon = deg2rad(pos2.lng - pos1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(pos1.lat)) * Math.cos(deg2rad(pos2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180)
}

export default function Debug({ map }: DebugProps) {
  const [center, setCenter] = useState<LngLat | null>(null);
  const [bounds, setBounds] = useState<LngLatBounds | null>(null);
  const [zoom, setZoom] = useState(0);

  useEffect(() => {
    if (!map) return;

    setCenter(map.getCenter());
    setBounds(map.getBounds());
    setZoom(map.getZoom())

    const onMove = () => {
      setCenter(map.getCenter());
      setBounds(map.getBounds());
      setZoom(map.getZoom())
    };

    map.on('move', onMove);

    return () => {
      map.off('move', onMove);
    };
  }, [map]);

  if (!map || !center) return <div>Loading map...</div>;

  return (
    <div className={css`
      position: absolute;
      z-index: 999;
      bottom: 0;
      background-color: white;
      border: 4px double black;
      margin: 1rem;
      padding: 0.5em;
    `}>
      <p>Center: {center.lng.toFixed(6)}, {center.lat.toFixed(6)}</p>
      <p>Zoom: {zoom}</p>
      <details>
        <summary>Bounds</summary>
        <p>sw: {bounds?._sw.toString() ?? 'loading'}</p>
        <p>ne: {bounds?._ne.toString() ?? 'loading'}</p>
        <p>distance: {getDistanceFromLatLonInKm(bounds!._ne, bounds!._sw)} km</p>
      </details>
    </div>
  )
}
