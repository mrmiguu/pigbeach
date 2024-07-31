import type { DieFace, DieFaceAnd, DieFaceOr } from './logic'

// Uniquely default
export const M1: DieFace = { gain: ['meso', 1] }
export const M2: DieFace = { gain: ['meso', 2] }
export const L1: DieFace = { gain: ['level', 1] }
// Only for the starting dice
export const M5: DieFace = { gain: ['meso', 5] }
// Cash Shop only
export const M3: DieFace = { gain: ['meso', 3] }
export const M4: DieFace = { gain: ['meso', 4] }
export const M6: DieFace = { gain: ['meso', 6] }
export const W1: DieFace = { gain: ['wisdom', 1] }
export const W2: DieFace = { gain: ['wisdom', 2] }
export const P1: DieFace = { gain: ['power', 1] }
export const P2: DieFace = { gain: ['power', 2] }
export const L3: DieFace = { gain: ['level', 3] }
export const L4: DieFace = { gain: ['level', 4] }
export const MWoP1: DieFaceOr = {
  gain: [
    ['meso', 1],
    ['wisdom', 1],
    ['power', 1],
  ],
  op: '?',
}
export const M3oL2: DieFaceOr = {
  gain: [
    ['meso', 3],
    ['level', 2],
  ],
  op: '?',
}
export const MWoP2: DieFaceOr = {
  gain: [
    ['meso', 2],
    ['wisdom', 1],
    ['power', 1],
  ],
  op: '?',
}
export const M2aW1: DieFaceAnd = {
  gain: [
    ['meso', 2],
    ['wisdom', 1],
  ],
  op: '+',
}
export const PaL1: DieFaceAnd = {
  gain: [
    ['power', 1],
    ['level', 1],
  ],
  op: '+',
}
export const MWPaL1: DieFaceAnd = {
  gain: [
    ['meso', 1],
    ['wisdom', 1],
    ['power', 1],
    ['level', 1],
  ],
  op: '+',
}
export const WaL2: DieFaceAnd = {
  gain: [
    ['wisdom', 2],
    ['level', 2],
  ],
  op: '+',
}
