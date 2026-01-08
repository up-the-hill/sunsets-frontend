import { css } from '@linaria/core';
import { useEffect, useRef, useState } from 'react';
import UploadModal from './UploadModal';
import SunsetPopup from './SunsetPopup';
import { createRoot } from 'react-dom/client';
import Debug from './Debug';

// maplibregl-js
import maplibregl, { Popup, GeoJSONSource } from 'maplibre-gl';
import { Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// stadia maps search
import { MapLibreSearchControl } from "@stadiamaps/maplibre-search-box";
import "./maplibre-search-box.css";

const IS_DEV = import.meta.env.DEV;

async function loadPoints(map: maplibregl.Map) {
  try {
    const res = await fetch(`/api/sunsets`);
    const data = await res.json();

    const source = map.getSource('sunsets') as GeoJSONSource;
    if (source) {
      source.setData(data);
    }
  } catch (error) {
    console.error("Failed to load points", error);
  }
}

export default function Map() {
  const [mapInstance, setMapInstance] = useState<null | maplibregl.Map>(null);
  const clickMarkerRef = useRef<null | maplibregl.Marker>(null);
  const [clickMarker, setClickMarker] = useState<null | maplibregl.Marker>(null);
  const [displayUploadModal, setDisplayUploadModal] = useState(false);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: 'map', // container id
      style: '/styles/sunset',
      center: [151.2057, -33.8727],
      zoom: 12
    });
    setMapInstance(map);

    const control = new MapLibreSearchControl({
      onResultSelected: feature => {
        // You can add code here to take some action when a result is selected.
        console.log(feature!.geometry!.coordinates);
      },
      // You can also use our EU endpoint to keep traffic within the EU using the basePath option:
      // baseUrl: "https://api-eu.stadiamaps.com",
    });

    map.on('load', async () => {
      map.addControl(control, "top-left");
      map.addSource('sunsets', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 20
      });

      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'sunsets',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#FA9B6B',
            100,
            '#FBBC9D',
            750,
            '#FDDECE'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            100,
            30,
            750,
            40
          ]
        }
      });

      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'sunsets',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-size': 12
        }
      });

      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'sunsets',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#F76218',
          'circle-radius': 8,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#1f271b'
        }
      });

      // inspect a cluster on click
      map.on('click', 'clusters', async (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        });
        const clusterId = features[0].properties.cluster_id;
        const source = map.getSource('sunsets') as GeoJSONSource;

        const zoom = await source.getClusterExpansionZoom(clusterId);
        map.easeTo({
          center: (features[0].geometry as any).coordinates,
          zoom
        });
      });

      map.on('click', 'unclustered-point', (e) => {
        // Prevent map click handler from triggering
        e.originalEvent.stopPropagation();

        const coordinates = (e.features![0].geometry as any).coordinates.slice();
        const id = e.features![0].properties.id;

        // Ensure that if the map is zoomed out such that
        // multiple copies of the feature are visible, the
        // popup appears over the copy being pointed to.
        // while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        //   coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        // }

        const popupNode = document.createElement('div');
        const root = createRoot(popupNode);

        new Popup()
          .setLngLat(coordinates)
          .setDOMContent(popupNode)
          .addTo(map);

        root.render(<SunsetPopup id={id} />);
      });

      map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
      });
      map.on('mouseenter', 'unclustered-point', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'unclustered-point', () => {
        map.getCanvas().style.cursor = '';
      });

      // Load initial points
      loadPoints(map);

      // EVENT HANDLERS
      // adds event handler to create a marker on click (for uploading)
      map.on('click', (e) => {
        const target = e.originalEvent.target as Element;
        // Check if we clicked on a map control, existing popup, or our clustered layers
        if (target.closest('.maplibregl-popup') || target.closest('.maplibregl-marker')) {
          return;
        }

        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters', 'unclustered-point'] });
        if (features.length > 0) return;

        if (clickMarkerRef.current) {
          clickMarkerRef.current.remove();
        }

        const newMarker = new Marker()
          .setLngLat(e.lngLat)
          .addTo(map);

        clickMarkerRef.current = newMarker;
        setClickMarker(newMarker);
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
            padding-inline: 0.6rem;
            padding-block: 0.2rem;
            // padding: 0.2rem;
            margin: 1rem;
          `}>+</button>
        )
      }
      {
        displayUploadModal && (
          <UploadModal handleCloseModal={handleCloseModal} clickMarker={clickMarker} />
        )
      }
      <div id="map" className={css`
        height: 100dvh;
      `}>
      </div>
    </div>
  )
}
