import { CSSProperties, useContext, useMemo, useState } from 'react'

import { DIE_ROLL_DURATION_MS } from './animations.consts.ts'
import { diceRollSound, dieRollSound } from './audio.ts'
import DieFace from './DieFace.tsx'
import { GameStateContext } from './GameState.context.tsx'
import * as Logic from './logic.ts'

const randomMultiRotationWithTilt = (offset: number, onlyTilt?: boolean) => {
  const multiRotation = onlyTilt ? 0 : 4 * ((Math.floor(3 * Math.random()) + 3) * (offset + 1))
  const randomTilt = multiRotation + (Math.random() - 0.5) * 0.5
  return randomTilt
}

const dieRotationByFaceNum: { [faceNum in Logic.DieFaceNum]: [number, number, number] } = {
  1: [0, 0, 0],
  2: [2, 3, 2],
  3: [1, 1, 1],
  4: [3, 3, 1],
  5: [2, 1, 2],
  6: [0, 2, 0],
} as const

const translateFace = (faceNum: Logic.DieFaceNum, radiusPx: number) => {
  const faceTranslations: { [faceNum in Logic.DieFaceNum]: CSSProperties } = {
    1: { transform: `translateZ(${radiusPx}px)` },
    2: { transform: `translateX(-${radiusPx}px) rotateY(-90deg) rotateX(0)` },
    3: { transform: `translateY(${radiusPx}px) rotateX(90deg) rotateX(180deg)` },
    4: { transform: `translateY(-${radiusPx}px) rotateX(90deg)` },
    5: { transform: `translateX(${radiusPx}px) rotateY(90deg)` },
    6: { transform: `translateZ(-${radiusPx}px) rotateY(180deg)` },
  }
  return faceTranslations[faceNum]
}

type DieFaceProps = {
  faceNum: Logic.DieFaceNum
  face: Logic.DieFace
  radiusPx: number
  rollDone: boolean
  rolledNum?: Logic.DieFaceNum
}

function DieFaceTranslated({ faceNum, face, radiusPx, rollDone, rolledNum }: DieFaceProps) {
  const textScale = 4.5

  return (
    <div
      className="bg-red-700 absolute w-full h-full flex justify-center items-center"
      style={translateFace(faceNum, radiusPx)}
    >
      <div
        className={`h-full aspect-square bg-gradient-to-br from-red-500 to-red-700 rounded-3xl p-3 border border-black transition-all ${
          rollDone && rolledNum !== faceNum && 'duration-700 brightness-50'
        }`}
      >
        <DieFace {...face} textScale={textScale} />
      </div>
    </div>
  )
}

const useMultiRotateWithTilt = (rotate: number, tiltOffset: number, onlyTilt: boolean) => {
  return useMemo(() => rotate + randomMultiRotationWithTilt(tiltOffset, onlyTilt), [rotate, tiltOffset, onlyTilt])
}

type DieProps = {
  which: Logic.WhichDie
  faces: [Logic.DieFace, Logic.DieFace, Logic.DieFace, Logic.DieFace, Logic.DieFace, Logic.DieFace]
  onRollEnd: (rolledNum: Logic.DieFaceNum) => void
}

const generateDie = () => {
  function Die({ which, faces, onRollEnd }: DieProps) {
    const {
      game: { playerStateById },
      yourPlayerId,
    } = useContext(GameStateContext)
    const { rolledNums } = playerStateById[yourPlayerId]!
    const rolledNum = rolledNums[which - 1]

    const [face1, face2, face3, face4, face5, face6] = faces
    const dieSizePx = 150
    const radiusPx = dieSizePx / 2

    const [dieResting, setDieResting] = useState(true)

    const [tiltOffset, setTiltOffset] = useState(0)
    const [minRotateX, minRotateY, minRotateZ] = rolledNum ? dieRotationByFaceNum[rolledNum] : [0, 0, 0]
    const rotateX = useMultiRotateWithTilt(minRotateX, tiltOffset, !rolledNum)
    const rotateY = useMultiRotateWithTilt(minRotateY, tiltOffset, !rolledNum)
    const rotateZ = useMultiRotateWithTilt(minRotateZ, tiltOffset, !rolledNum)
    const rotateXDeg = rotateX * 90
    const rotateYDeg = rotateY * 90
    const rotateZDeg = rotateZ * 90

    const dieFace = rolledNum ? faces[Number(rolledNum) - 1] : undefined
    const rollDone = !!(dieResting && rolledNum)
    const animationPlayState = rollDone ? 'paused' : 'running'

    Die.roll = (...otherDice: (typeof Die)[]) => {
      if (dieResting) {
        if (otherDice.length > 0) {
          diceRollSound.play()
        } else {
          dieRollSound.play()
        }

        setDieResting(false)
        setTiltOffset(off => off + 1)

        Logic.actions.rollDie({ which })
      }

      for (const die of otherDice) {
        die.roll()
      }
    }

    return (
      <div className="relative animate-bounce cursor-pointer" style={{ animationPlayState }}>
        <div
          className="relative z-20 transition-transform ease-out"
          style={{
            width: `${dieSizePx}px`,
            height: `${dieSizePx}px`,
            transformStyle: 'preserve-3d',
            transform: `rotateY(${rotateYDeg}deg) rotateX(${rotateXDeg}deg) rotateZ(${rotateZDeg}deg)`,
            transitionDuration: `${DIE_ROLL_DURATION_MS}ms`,
          }}
          onTransitionEnd={e => {
            if (!dieFace) {
              throw new Error('Die not rolled')
            }

            if (e.propertyName === 'transform') {
              setDieResting(true)
              onRollEnd(rolledNum!)
            }
          }}
        >
          <DieFaceTranslated faceNum={1} face={face1} radiusPx={radiusPx} rollDone={rollDone} rolledNum={rolledNum} />
          <DieFaceTranslated faceNum={2} face={face2} radiusPx={radiusPx} rollDone={rollDone} rolledNum={rolledNum} />
          <DieFaceTranslated faceNum={3} face={face3} radiusPx={radiusPx} rollDone={rollDone} rolledNum={rolledNum} />
          <DieFaceTranslated faceNum={4} face={face4} radiusPx={radiusPx} rollDone={rollDone} rolledNum={rolledNum} />
          <DieFaceTranslated faceNum={5} face={face5} radiusPx={radiusPx} rollDone={rollDone} rolledNum={rolledNum} />
          <DieFaceTranslated faceNum={6} face={face6} radiusPx={radiusPx} rollDone={rollDone} rolledNum={rolledNum} />
        </div>
      </div>
    )
  }

  Die.roll = undefined as unknown as (...dice: (typeof Die)[]) => void

  return Die
}

export const useDie = () => useMemo(generateDie, [])
