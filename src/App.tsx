import { useContext, useEffect, useState } from 'react'

import { DIE_ROLL_DURATION_MS, WAIT_AFTER_FIRST_PLAYER_DECIDED } from './animations.consts.ts'
import { aboveTheTreetopsSound, clickSound, levelUpSound } from './audio.ts'
import { useDiceRollModal } from './DiceRollModal.tsx'
import { GameStateContext } from './GameState.context.tsx'
import { useElectState } from './hooks.ts'
import * as Logic from './logic.ts'
import { sleep } from './utils.ts'

import dieIconImage from './assets/die-icon.png'
import pigBeachBgImage from './assets/pig-beach-bg.png'
import { usePlayMusic } from './Music.hooks.ts'

function RollToDecideWhoGoesFirstScreen() {
  const { game, yourPlayerId } = useContext(GameStateContext)
  const player = game.playerStateById[yourPlayerId]!

  const totalOnline = Logic.totalOnline(game)

  const MyDiceRollModal = useDiceRollModal(Logic.StartingDice)

  const myDecidingRollElect = Logic.decidedRollSum(game, yourPlayerId)
  const myDecidingRoll = useElectState(myDecidingRollElect, DIE_ROLL_DURATION_MS)
  const firstPlayerElect = Logic.findFirstPlayer(game)
  const firstPlayer = useElectState(firstPlayerElect, DIE_ROLL_DURATION_MS)

  const [countdown, setCountdown] = useState<number>()
  useEffect(() => {
    if (!firstPlayer) {
      return
    }

    const go = async () => {
      for (let i = Math.floor(WAIT_AFTER_FIRST_PLAYER_DECIDED / 1000); i >= 1; i--) {
        setCountdown(i)
        await sleep(1000)
      }
    }
    go()
  }, [firstPlayer])

  return (
    <div className="absolute w-full h-full flex flex-col">
      <div
        className="absolute w-full h-full bg-cover bg-center"
        style={{ backgroundImage: `url('${pigBeachBgImage}')` }}
      />

      <div className="relative w-full h-full flex flex-col gap-4 justify-start items-center p-4">
        <div className="relative h-full flex flex-col gap-2 justify-end items-center">
          <div className="w-full h-full max-w-48 max-h-48 p-4 bg-rose-500/20 backdrop-blur rounded flex flex-col justify-center items-center">
            <div className="text-amber-50 text-6xl font-bold text-center font-damage uppercase">
              {!myDecidingRoll && <>Roll!</>}
              {myDecidingRoll && !firstPlayer && <>{myDecidingRoll}</>}
              {countdown && <>{countdown}</>}
            </div>
            <div className="text-amber-50 text-xs text-center">
              {!myDecidingRoll && <>Decide who goes first</>}
              {myDecidingRoll && !firstPlayer && <>Waiting for other players</>}
              {countdown && <>Starting game in...</>}
            </div>
          </div>

          <div className="h-full flex items-center">
            <button
              onClick={async () => {
                clickSound.play()
                const rolls = await MyDiceRollModal.waitForRoll()
                const score = rolls.reduce((a, b) => a + b, 0)
                if (score) {
                  levelUpSound.play()
                }
              }}
            >
              <img src={dieIconImage} className={`w-20 ${myDecidingRoll ? 'animate-spin' : 'animate-bounce'}`} />
            </button>
          </div>
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
  const { game, yourPlayerId } = useContext(GameStateContext)
  const { whoseTurn: whoseTurnElect } = game

  const whoseTurn = useElectState(whoseTurnElect, DIE_ROLL_DURATION_MS + WAIT_AFTER_FIRST_PLAYER_DECIDED)

  useEffect(() => {
    if (whoseTurnElect && whoseTurn === yourPlayerId) {
      Logic.actions.startGame()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [whoseTurnElect, whoseTurn])

  return <RollToDecideWhoGoesFirstScreen />
}

export default App
