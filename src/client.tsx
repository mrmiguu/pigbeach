import ReactDOM from 'react-dom/client'

import { Toaster } from 'react-hot-toast'
import App from './App.tsx'
import { GameStateContextProvider } from './GameState.context.tsx'
import { MusicContextProvider } from './Music.context.tsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <>
    {/* <StrictMode> */}
    <GameStateContextProvider>
      <MusicContextProvider>
        <App />
      </MusicContextProvider>
    </GameStateContextProvider>
    <Toaster containerClassName="toaster" />
    {/* </StrictMode> */}
  </>,
)
