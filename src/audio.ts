import { Howl } from 'howler'

import diceRollSoundAudio from './assets/dice-roll.wav'
import dieRollSoundAudio from './assets/die-roll.wav'
import aboveTheTreetopsSoundAudio from './assets/maple-above-the-treetops.mp3'
import buySoundAudio from './assets/maple-buy.mp3'
import clickSoundAudio from './assets/maple-click.mp3'
import downSoundAudio from './assets/maple-down.mp3'
import hoverSoundAudio from './assets/maple-hover.mp3'
import levelUpSoundAudio from './assets/maple-level-up.mp3'
import loseSoundAudio from './assets/maple-lose.mp3'
import scrollFailureSoundAudio from './assets/maple-scroll-failure.mp3'
import scrollSuccessSoundAudio from './assets/maple-scroll-success.mp3'
import upSoundAudio from './assets/maple-up.mp3'
import winSoundAudio from './assets/maple-win.mp3'

export const buySound = new Howl({ src: buySoundAudio })
export const clickSound = new Howl({ src: clickSoundAudio })
export const diceRollSound = new Howl({ src: diceRollSoundAudio })
export const dieRollSound = new Howl({ src: dieRollSoundAudio })
export const hoverSound = new Howl({ src: hoverSoundAudio })
export const downSound = new Howl({ src: downSoundAudio })
export const upSound = new Howl({ src: upSoundAudio })
export const scrollSuccessSound = new Howl({ src: scrollSuccessSoundAudio })
export const scrollFailureSound = new Howl({ src: scrollFailureSoundAudio })
export const levelUpSound = new Howl({ src: levelUpSoundAudio })
export const winSound = new Howl({ src: winSoundAudio })
export const loseSound = new Howl({ src: loseSoundAudio })
export const aboveTheTreetopsSound = new Howl({ src: aboveTheTreetopsSoundAudio })
