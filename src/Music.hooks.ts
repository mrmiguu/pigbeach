import { useContext, useEffect } from 'react'
import { MusicContext } from './Music.context'

export const usePlayMusic = (music: Howl) => {
  const { play } = useContext(MusicContext)

  useEffect(() => {
    play(music)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [music])
}
