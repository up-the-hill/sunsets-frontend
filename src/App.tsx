import { css } from '@linaria/core';
import Map from './components/Map';

function App() {
  return (
    <main>
      <h1 className={css`
        position: fixed;
        z-index: 999;
        margin: 1rem;
        line-height: 1em;
        // -webkit-text-stroke: 1px white;
      `}>sunsets on a map</h1>
      <Map />
    </main>
  )
}

export default App
