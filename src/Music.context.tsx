import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react'
import { GameStateContext } from './GameState.context'
import { gameTimeSinceOfficialStart } from './logic'

export type MusicContextType = {
  playing: Howl | null
  play: (music: Howl) => void
}

export const MusicContext = createContext<MusicContextType>(undefined as unknown as MusicContextType)

export function MusicContextProvider({ children }: PropsWithChildren) {
  const { game, yourPlayerId } = useContext(GameStateContext)
  const { whoseTurn } = game

  const [playing, setPlaying] = useState<Howl | null>(null)

  const play = (music: Howl) => {
    setPlaying(music)
  }

  useEffect(() => {
    if (!playing) {
      return
    }
    if (whoseTurn !== yourPlayerId) {
      return
    }

    const currentSeconds = gameTimeSinceOfficialStart(game) / 1000
    const duration = ~~(playing.duration() * 1000) / 1000 // keep accuracy only up to ms
    const startTime = currentSeconds % duration

    playing.seek(startTime)
    playing.loop(true)
    playing.play()

    return () => {
      playing.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, whoseTurn, yourPlayerId])

  return <MusicContext.Provider value={{ playing, play }}>{children}</MusicContext.Provider>
}
