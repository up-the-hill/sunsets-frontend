import { LngLat, LngLatBounds, Map } from 'maplibre-gl';
import { css } from '@linaria/core';
import { useEffect, useState } from 'react';

interface DebugProps {
  map: Map | null;
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);  // deg2rad below
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
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
      background-color: white;
      border: 4px double black;
      padding: 0.5em;
    `}>
      <p>Center: {center.lng.toFixed(6)}, {center.lat.toFixed(6)}</p>
      <p>Zoom: {zoom}</p>
      <details>
        <summary>Bounds</summary>
        <p>sw: {bounds?._sw.toString() ?? 'loading'}</p>
        <p>ne: {bounds?._ne.toString() ?? 'loading'}</p>
        <p>distance: {getDistanceFromLatLonInKm(bounds?._sw.lat, bounds?._sw.lng, bounds?._ne.lat, bounds?._ne.lng)}</p>
      </details>
    </div>
  )
}
