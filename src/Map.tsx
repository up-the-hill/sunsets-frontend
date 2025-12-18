import maplibregl from 'maplibre-gl';
import { Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect } from 'react';

export default function Map() {
  useEffect(() => {
    const map = new maplibregl.Map({
      container: 'map', // container id
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [151.2057, -33.8727],
      zoom: 12
    });

    const marker = new Marker()
      .setLngLat([151.2057, -33.8727])
      .setPopup(
        new maplibregl.Popup({ offset: 25 }).setText(
          'Sydney'
        )
      )
      .addTo(map);
  }, [])

  return (
    <div id="map"></div>
  )
}
