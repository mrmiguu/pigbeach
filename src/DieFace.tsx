import Currency from './Currency.tsx'
import * as Logic from './logic.ts'

type DieFaceProps = Logic.DieFace & {
  textScale: number
}

export default function DieFace({ textScale, ...face }: DieFaceProps) {
  if ('op' in face) {
    return null
    // return <Currency type={face.gain} amount={gain[1]} textScale={textScale} />
  }
  const [gainType, amount] = face.gain
  return <Currency type={gainType} amount={amount} textScale={textScale} />
}
