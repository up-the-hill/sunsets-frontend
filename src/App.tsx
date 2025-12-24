import { css } from '@linaria/core';
import Map from './Map.tsx'

function App() {
  return (
    <main className={css`
      display: grid;
      height: 100dvh;
      grid-template-rows: 5fr 95fr;
    `}>
      <h1>sunsets</h1>

      <Map></Map>
    </main>
  )
}

export default App
