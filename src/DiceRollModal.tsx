import { useEffect, useMemo, useState } from 'react'

import { useDie } from './Die.tsx'
import { clickSound } from './audio.ts'
import * as Logic from './logic.ts'

const generateDiceRollModal = (dice: [Logic.Die]) => {
  function DiceRollModal() {
    const [hidden, hide] = useState(true)
    const [rolled1, setRolled1] = useState(false)
    const Die1 = useDie()

    const [rollPromiseId, setRollPromiseId] = useState(Math.random())
    const {
      promise: rollPromise,
      resolve: resolveRoll,
      // eslint-disable-next-line react-hooks/exhaustive-deps
    } = useMemo(() => Promise.withResolvers<void>(), [rollPromiseId])

    DiceRollModal.waitForRoll = async () => {
      try {
        hide(false)
        await rollPromise
      } finally {
        setRollPromiseId(Math.random())
      }
    }

    useEffect(() => {
      if (rolled1) {
        resolveRoll()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rolled1])

    return (
      <div
        className={`fixed left-0 top-0 z-50 w-full h-full flex flex-col gap-20 justify-center items-center transition-all cursor-pointer ${
          hidden && 'opacity-0 pointer-events-none'
        }`}
        onClick={() => {
          clickSound.play()
          hide(true)
        }}
      >
        <div className="absolute w-full h-full bg-black/50 pointer-events-none" />

        <div
          onClick={e => {
            e.stopPropagation()
            clickSound.play()
            Die1.roll()
          }}
        >
          <Die1 which={1} faces={dice[0]} onRollEnd={() => setRolled1(true)} />
        </div>
      </div>
    )
  }

  DiceRollModal.waitForRoll = undefined as unknown as () => Promise<void>

  return DiceRollModal
}

export const useDiceRollModal = (dice: [Logic.Die]) => useMemo(() => generateDiceRollModal(dice), [dice])
