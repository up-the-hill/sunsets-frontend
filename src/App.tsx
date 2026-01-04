import { css } from '@linaria/core';
import Map from './components/Map';

function App() {
  return (
    <main>
      <h1 className={css`
        display:none;
        @media (min-width: 720px) {
          display: block;
          position: fixed;
          left: 40dvw;
          z-index: 999;
          margin: 1rem;
          line-height: 1em;
          // backdrop-filter: invert();
          // -webkit-text-stroke: 1px white;
        }
      `}>sunsets on a map</h1>
      <Map />
    </main>
  )
}

export default App
