import { useContext, useEffect, useState } from 'react'

import { aboveTheTreetopsSound, clickSound, levelUpSound, loseSound, winSound } from './audio.ts'
import { useDiceRollModal } from './DiceRollModal.tsx'
import { GameStateContext } from './GameState.context.tsx'
import * as Logic from './logic.ts'
import { usePlayMusic } from './Music.hooks.ts'

import toast from 'react-hot-toast'
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

  const infoTexts = [
    'The first to roll their die goes first.',
    'If you roll a 1, you lose all of your accumulated points and your turn ends.',
    'If you roll anything else, you can continue to roll or hold and end your turn.',
    'Holding and ending your turn adds your accumulated points to your level.',
    `The first player to reach level ${Logic.WIN_LEVEL} wins!`,
  ]
  const [infoTextIndex, setInfoTextIndex] = useState(0)

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

        <div className="absolute w-full h-full left-0 top-0 flex justify-end items-end px-4 pointer-events-none">
          <button
            className="w-8 h-8 font-mono flex justify-center items-center text-white bg-white/20 backdrop-blur rounded-full pointer-events-auto"
            onClick={() => {
              clickSound.play()
              toast(infoTexts[infoTextIndex]!)
              setInfoTextIndex((infoTextIndex + 1) % infoTexts.length)
            }}
          >
            ?
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
