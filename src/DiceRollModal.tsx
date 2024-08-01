import { useEffect, useMemo, useState } from 'react'

import toast from 'react-hot-toast'
import { useDie } from './Die.tsx'
import { clickSound, scrollFailureSound, scrollSuccessSound } from './audio.ts'
import * as Logic from './logic.ts'

const generateDiceRollModal = (dice: [Logic.Die]) => {
  function DiceRollModal() {
    const [hidden, hide] = useState(true)
    const [rolledNums, setRolledNums] = useState<Logic.DieFaceNum[]>()
    const Die1 = useDie()

    const [rollPromiseId, setRollPromiseId] = useState(Math.random())
    const {
      promise: rollsPromise,
      resolve: resolveRolls,
      // eslint-disable-next-line react-hooks/exhaustive-deps
    } = useMemo(() => Promise.withResolvers<Logic.DieFaceNum[]>(), [rollPromiseId])

    const appendRolledNum = (r: Logic.DieFaceNum) => {
      if (r === 1) {
        setRolledNums([])
      } else {
        setRolledNums(rs => [...(rs ?? []), r])
      }
    }

    DiceRollModal.waitForRoll = async () => {
      try {
        hide(false)
        return await rollsPromise
      } finally {
        setRolledNums(undefined)
        toast.dismiss('roll-sum')
        setRollPromiseId(Math.random())
      }
    }

    useEffect(() => {
      if (!rolledNums) {
        return
      }

      if (rolledNums.length === 0) {
        scrollFailureSound.play()
      } else {
        scrollSuccessSound.play()
      }

      const score = rolledNums.reduce((a, b) => a + b, 0)

      if (score) {
        toast.success(<span className="font-damage text-5xl">+{score}</span>, {
          id: 'roll-sum',
          style: { background: '#62D345', color: '#fff' },
        })
      } else {
        toast.error(<span className="font-damage text-5xl">0</span>, {
          id: 'roll-sum',
          style: { background: '#FF4C4B', color: '#fff' },
        })
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rolledNums])

    return (
      <div
        className={`fixed left-0 top-0 z-50 w-full h-full flex flex-col gap-20 justify-center items-center transition-all cursor-pointer ${
          hidden && 'opacity-0 pointer-events-none'
        }`}
        onClick={() => {
          clickSound.play()

          if (rolledNums) {
            hide(true)
            resolveRolls(rolledNums)
          } else {
            const id = 'roll-once'
            toast.dismiss(id)
            toast('Roll the die at least once!', { icon: '🎲', id })
          }
        }}
      >
        <div className="absolute w-full h-full bg-black/50 pointer-events-none" />

        <div
          className={`${rolledNums?.length === 0 && 'brightness-50'}`}
          onClick={e => {
            e.stopPropagation()

            clickSound.play()

            if (rolledNums?.length !== 0) {
              Die1.roll()
            }
          }}
        >
          <Die1 key={String(hidden)} faces={dice[0]} onRollEnd={appendRolledNum} />
        </div>
      </div>
    )
  }

  DiceRollModal.waitForRoll = undefined as unknown as () => Promise<Logic.DieFaceNum[]>

  return DiceRollModal
}

export const useDiceRollModal = (dice: [Logic.Die]) => useMemo(() => generateDiceRollModal(dice), [dice])
