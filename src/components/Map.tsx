import { css } from '@linaria/core';
import maplibregl, { Popup } from 'maplibre-gl';
import { Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef, useState } from 'react';
import UploadModal from './UploadModal';
import SunsetPopup from './SunsetPopup';
import { createRoot } from 'react-dom/client';
import Debug from './Debug';
import debounce from 'lodash.debounce';

const IS_DEV = import.meta.env.DEV; // replaced at build-time

async function loadPoints(map: maplibregl.Map) {
  const res = await fetch(`/api/sunsets?centre=${map.getCenter().lng},${map.getCenter().lat}&zoom=${map.getZoom()}`)
  const data = await res.json();

  // Add an image to use as a custom marker
  data.features.forEach((marker: any) => {
    // popup for marker
    const popupNode = document.createElement('div');
    const root = createRoot(popupNode);

    const p = new Popup().setDOMContent(popupNode);

    p.on('open', () => {
      root.render(<SunsetPopup id={marker.properties.id} />);
    });

    // add marker to map
    new maplibregl.Marker()
      .setLngLat(marker.geometry.coordinates)
      .addTo(map)
      .setPopup(p)
  });
}

export default function Map() {
  const [mapInstance, setMapInstance] = useState<null | maplibregl.Map>(null);
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
    setMapInstance(map);


    map.on('load', async () => {
      loadPoints(map);

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

      map.on('moveend', () => {
        const debouncedLoadPoints = debounce(loadPoints, 1000);
        debouncedLoadPoints(map);
      })

    })

    return () => {
      if (clickMarkerRef.current) clickMarkerRef.current.remove();
      map.remove();
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
      {IS_DEV && (
        <Debug map={mapInstance}></Debug>
      )}
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
