import { useContext, useEffect } from 'react'

import { aboveTheTreetopsSound, clickSound, levelUpSound, loseSound, winSound } from './audio.ts'
import { useDiceRollModal } from './DiceRollModal.tsx'
import { GameStateContext } from './GameState.context.tsx'
import * as Logic from './logic.ts'
import { usePlayMusic } from './Music.hooks.ts'

import dieIconImage from './assets/die-icon.png'
import pigBeachBgImage from './assets/pig-beach-bg.jpg'

function RollToDecideWhoGoesFirstScreen() {
  const { game, yourPlayerId } = useContext(GameStateContext)
  const player = game.players[yourPlayerId]!

  const totalOnline = Logic.totalOnline(game)

  const MyDiceRollModal = useDiceRollModal(Logic.StartingDice)

  const decidingRoll = !game.whoseTurn
  const myTurn = game.whoseTurn === yourPlayerId

  const gameOver = Logic.isGameOver(game)
  useEffect(() => {
    if (gameOver) {
      const winners = Logic.getLeaderboard(game)

      const winner = winners[0]!
      if (winner.id === yourPlayerId) {
        winSound.play()
      } else {
        loseSound.play()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver])

  return (
    <div className="absolute w-full h-full flex flex-col">
      <div
        className="absolute w-full h-full bg-cover bg-center"
        style={{ backgroundImage: `url('${pigBeachBgImage}')` }}
      />

      <div className="relative w-full h-full flex flex-col justify-start items-center gap-4 p-4">
        <div className="p-8 bg-rose-500/20 backdrop-blur rounded flex flex-col justify-center items-center">
          <div className="text-amber-50 text-6xl font-bold text-center font-damage uppercase">
            {(decidingRoll || myTurn) && <>Roll!</>}
            {!decidingRoll && !myTurn && <>Wait</>}
          </div>
          <div className="text-amber-50 text-xs text-center">
            {decidingRoll && <>The first to roll goes first</>}
            {myTurn && <>It's your turn</>}
            {!decidingRoll && !myTurn && <>It's another player's turn</>}
          </div>
        </div>

        <div className="grow h-full flex items-center">
          <button
            className={`${!decidingRoll && !myTurn && 'pointer-events-none'}`}
            onClick={async () => {
              clickSound.play()
              const rolls = await MyDiceRollModal.waitForRoll()
              const score = rolls.reduce((a, b) => a + b, 0)
              if (score) {
                levelUpSound.play()
              }
              Logic.actions.endTurn()
            }}
          >
            <img
              src={dieIconImage}
              className={`w-20 ${!decidingRoll && !myTurn ? 'animate-spin' : 'animate-bounce'}`}
            />
          </button>
        </div>
      </div>

      <div
        // UI footer
        className="outline pointer-events-none flex justify-between p-4 h-20"
      >
        <div
          // Player level
          className="px-3 rounded bg-black/20 backdrop-blur flex items-center gap-2 text-white"
        >
          <div className="font-bold">LV.</div>
          <div className="rounded flex justify-start items-center gap-0.5">
            {player.level
              .toString()
              .split('')
              .map((char, i) => (
                <div key={i} className="font-mono font-bold text-white px-1 bg-orange-500 rounded">
                  {char}
                </div>
              ))}
          </div>
        </div>

        <div
          // Online count
          className="px-3 rounded bg-white/20 backdrop-blur flex items-center gap-2 text-white"
        >
          <span className="font-damage text-3xl uppercase">{totalOnline}</span> <span className="text-xs">Online</span>
        </div>
      </div>

      <MyDiceRollModal />
    </div>
  )
}

function App() {
  usePlayMusic(aboveTheTreetopsSound)
  return <RollToDecideWhoGoesFirstScreen />
}

export default App
