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

  useEffect(() => {}, [countdown])

  return (
    <div
      className="absolute w-full h-full flex flex-col gap-4 justify-start items-center bg-cover bg-center p-3"
      style={{ backgroundImage: `url('${pigBeachBgImage}')` }}
    >
      <div className="relative flex flex-col gap-2 justify-end items-center h-1/2">
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

        <div className="grow h-full flex items-end">
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

      <div className="absolute w-full h-full left-0 top-0 flex justify-end items-end p-4 pointer-events-none">
        <div className="px-3 rounded bg-white/20 backdrop-blur flex items-center gap-2 text-white">
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
