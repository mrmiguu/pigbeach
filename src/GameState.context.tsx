import { createContext, PropsWithChildren, useEffect, useState } from 'react'

import * as Logic from './logic.ts'

export type GameStateContextType = {
  game: Logic.GameState
  yourPlayerId: Logic.PlayerId
}

export const GameStateContext = createContext<GameStateContextType>(undefined as unknown as GameStateContextType)

export function GameStateContextProvider({ children }: PropsWithChildren) {
  const [game, setGame] = useState<Logic.GameState>()
  const [yourPlayerId, setYourPlayerId] = useState<Logic.PlayerId | undefined>()

  useEffect(() => {
    Dusk.initClient({
      onChange: ({ game, yourPlayerId }) => {
        // We use elect values, so we rely on time delays for those to eventually become seen.
        setGame({ ...game })

        setYourPlayerId(yourPlayerId)
      },
    })
  }, [])

  if (!game || !yourPlayerId) {
    // Dusk only shows your game after an onChange() so no need for loading screen
    return
  }

  return <GameStateContext.Provider value={{ game, yourPlayerId }}>{children}</GameStateContext.Provider>
}
