import { Howl } from 'howler'

import diceRollSoundAudio from './assets/dice-roll.wav'
import dieRollSoundAudio from './assets/die-roll.wav'
import buySoundAudio from './assets/maple-buy.mp3'
import clickSoundAudio from './assets/maple-click.mp3'
import downSoundAudio from './assets/maple-down.mp3'
import hoverSoundAudio from './assets/maple-hover.mp3'
import upSoundAudio from './assets/maple-up.mp3'

export const buySound = new Howl({ src: buySoundAudio })
export const clickSound = new Howl({ src: clickSoundAudio })
export const diceRollSound = new Howl({ src: diceRollSoundAudio })
export const dieRollSound = new Howl({ src: dieRollSoundAudio })
export const hoverSound = new Howl({ src: hoverSoundAudio })
export const downSound = new Howl({ src: downSoundAudio })
export const upSound = new Howl({ src: upSoundAudio })
