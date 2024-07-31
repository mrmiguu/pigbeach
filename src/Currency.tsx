import scrollImage from './assets/scroll-icon.png'

import * as Logic from './logic.ts'

type CurrencyProps = {
  type: Logic.GainType
  amount: number
  textScale: number
}

export default function Currency({ amount, textScale }: CurrencyProps) {
  return (
    <div className="relative aspect-square">
      <img src={scrollImage} className="relative w-full h-full" style={{ imageRendering: 'pixelated' }} />

      <div className="absolute z-10 left-0 top-0 w-full h-full flex justify-start items-end">
        <div
          className='origin-bottom-left'
          style={{
            transform: `scale(${textScale / 2})`,
          }}
        >
          <div
            className="relative text-4xl text-white font-damage leading-[0.6em]"
            style={{
              textShadow: '-1px -1px 1px #000, 1px -1px 1px #000, -1px 1px 1px #000, 1px 1px 1px #000',
            }}
          >
            {amount}
          </div>
        </div>
      </div>
    </div>
  )
}
