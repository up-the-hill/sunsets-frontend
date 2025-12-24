import { css } from '@linaria/core';
import maplibregl from 'maplibre-gl';
import { Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef, useState } from 'react';

export default function Map() {
  const mapRef = useRef<null | maplibregl.Map>(null);
  const [clickMarker, setClickMarker] = useState<null | maplibregl.Marker>(null);
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
      // const res = await fetch('/sunsets')
      // const data = await res.json();

      // // Add an image to use as a custom marker
      // const image = await map.loadImage('https://maplibre.org/maplibre-gl-js/docs/assets/custom_marker.png');
      // map.addImage('custom-marker', image.data);
      // map.addSource('sunsets', {
      //   'type': 'geojson',
      //   'data': {
      //     'type': 'FeatureCollection',
      //     'features': [
      //       {
      //         'type': 'Feature',
      //         'properties': {},
      //         'geometry': {
      //           'type': 'Point',
      //           'coordinates': [151.2057, -33.8727]
      //         }
      //       }
      //     ]
      //   }
      // });
      //
      // // make new layer for markers 
      // map.addLayer({
      //   id: 'markers',
      //   type: 'symbol',
      //   source: 'sunsets',
      //   layout: {
      //     'icon-image': 'custom-marker'
      //   }
      // })

      // EVENT HANDLERS
      // adds event handler to create a popup on click

      map.on('click', (e) => {
        if (clickMarker) {
          clickMarker.remove();
        }

        setClickMarker(new Marker()
          .setLngLat(e.lngLat)
          .addTo(map))
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
      if (clickMarker) clickMarker.remove();
      if (mapRef.current) mapRef.current.remove();
      mapRef.current = null;
    }
  }, [])

  function handleAddSunset() {
    console.log('handled')
  }

  return (

    <div>
      {
        clickMarker && (
          <button onClick={handleAddSunset} className={css`
            position: absolute;
            z-index: 999;
            right: 0;
          `}>test</button>
        )
      }
      <div id="map" className={css`
        height: 100%;
      `}>
      </div>
    </div>
  )
}
