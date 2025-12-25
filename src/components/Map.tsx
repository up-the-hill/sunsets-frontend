import { css } from '@linaria/core';
import maplibregl, { Popup } from 'maplibre-gl';
import { Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef, useState } from 'react';
import UploadModal from './UploadModal';
import SunsetPopup from './SunsetPopup';
import { createRoot } from 'react-dom/client';

export default function Map() {
  const mapRef = useRef<null | maplibregl.Map>(null);
  const clickMarkerRef = useRef<null | maplibregl.Marker>(null);
  const [clickMarker, setClickMarker] = useState<null | maplibregl.Marker>(null);
  const [displayUploadModal, setDisplayUploadModal] = useState(false);
  useEffect(() => {
    const map = new maplibregl.Map({
      container: 'map', // container id
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [151.2057, -33.8727],
      zoom: 12
    });
    mapRef.current = map;


    // load initial points
    map.on('load', async () => {
      // TODO
      const res = await fetch('/api/sunsets')
      const data = await res.json();

      // // Add an image to use as a custom marker
      data.features.forEach((marker: any) => {
        // popup for marker
        const popupNode = document.createElement('div');
        const root = createRoot(popupNode);
        root.render(<SunsetPopup id={marker.properties.id} />);

        const p = new Popup().setDOMContent(popupNode);
        // add marker to map
        new maplibregl.Marker()
          .setLngLat(marker.geometry.coordinates)
          .addTo(map)
          .setPopup(p)
      });

      // EVENT HANDLERS
      // adds event handler to create a popup on click

      map.on('click', (e) => {
        const target = e.originalEvent.target as Element;
        if (target.closest('.maplibregl-popup') || target.closest('.maplibregl-marker')) {
          return;
        }
        if (clickMarkerRef.current) {
          clickMarkerRef.current.remove();
        }

        const newMarker = new Marker()
          .setLngLat(e.lngLat)
          .addTo(map);

        clickMarkerRef.current = newMarker;
        setClickMarker(newMarker);
      })

      // // Change the cursor to a pointer when the it enters a feature in the 'markers' layer.
      // map.on('mouseenter', 'markers', () => {
      //   map.getCanvas().style.cursor = 'pointer';
      // });
      //
      // // Change it back to a pointer when it leaves.
      // map.on('mouseleave', 'markers', () => {
      //   map.getCanvas().style.cursor = '';
      // });
    })


    return () => {
      if (clickMarkerRef.current) clickMarkerRef.current.remove();
      if (mapRef.current) mapRef.current.remove();
      mapRef.current = null;
    }
  }, [])

  function handleShowModal() {
    setDisplayUploadModal(true);
  }

  function handleCloseModal() {
    setDisplayUploadModal(false);
  }

  return (

    <div>
      {
        clickMarker && (
          <button onClick={handleShowModal} className={css`
            position: absolute;
            z-index: 999;
            right: 0;
          `}>Add Sunset Image Here</button>
        )
      }
      {
        displayUploadModal && (
          <UploadModal handleCloseModal={handleCloseModal} clickMarker={clickMarker} />
        )
      }
      <div id="map" className={css`
        height: 100%;
      `}>
      </div>
    </div>
  )
}
