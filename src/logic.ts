import type { DuskClient, PlayerId as DuskPlayerId } from 'dusk-games-sdk/multiplayer'
import { M1, M2, M3, M4, M5, M6, P1, W1 } from './logic.dice'

export type PlayerId = DuskPlayerId

export type View = 'worldMap' | 'cashShop'

export type Die = [DieFace, DieFace, DieFace, DieFace, DieFace, DieFace]

export type DieFaceNum = 1 | 2 | 3 | 4 | 5 | 6
export type WhichDie = 1 | 2

export type GainType = 'meso' | 'power' | 'wisdom' | 'level'

export type DieFaceGainOrOp = '?'
export type DieFaceGainAndOp = '+'
export type DieFaceGainOp = DieFaceGainOrOp | DieFaceGainAndOp

export type DieFaceSingle = {
  gain: [GainType, number]
}
export type DieFaceOr = {
  gain: [GainType, number][]
  op: DieFaceGainOrOp
}
export type DieFaceAnd = {
  gain: [GainType, number][]
  op: DieFaceGainAndOp
}
export type DieFace = DieFaceSingle | DieFaceOr | DieFaceAnd

export type PlayerState = {
  id: PlayerId
  afk?: boolean
  viewing: View | null
  showDiceRoll: boolean
  dice: [Die]
  rolledNums: [DieFaceNum | undefined]
  mesos: number
  powerCrystals: number
  wisdomCrystals: number
  level: number
  slotExpansions: number
}

export type GameState = {
  playerStateById: { [id in PlayerId]: PlayerState }
  decidedRollSumByPlayerId: { [id in PlayerId]: number }
  gameStartedAt?: number
  whoseTurn?: PlayerId
}

type GameActions = {
  rollDie: ({ which }: { which: WhichDie }) => void
  startGame: () => void
  switchView: ({ view }: { view: View }) => void
  showDiceRoll: ({ show }: { show: boolean }) => void
}

declare global {
  const Dusk: DuskClient<GameState, GameActions>
}

const StartingDie: Die = [M1, M2, M3, M4, M5, M6]
export const StartingDice: [Die] = [StartingDie]

export const gameTime = () => {
  return Dusk.gameTime()
}

export const gameTimeSinceOfficialStart = (game: GameState) => {
  return game.gameStartedAt ? gameTime() - game.gameStartedAt : 0
}

export const totalOnline = (game: GameState): number => {
  return Object.values(game.playerStateById).filter(p => !p.afk).length
}

export const playerOrder = (game: GameState): PlayerId[] => {
  const order = Object.entries(game.decidedRollSumByPlayerId)
    .sort(([, a], [, b]) => b - a)
    .map(([id]) => id)
  return order
}

export const findFirstPlayer = (game: GameState) => {
  const playersRegistered = new Set(Object.keys(game.playerStateById))
  const playersWhoRolled = new Set(Object.keys(game.decidedRollSumByPlayerId))

  if (playersRegistered.difference(playersWhoRolled).size > 0) {
    return
  }

  const firstPlayer = playerOrder(game)[0]
  return firstPlayer
}

export const decidingRollSum = (rolled: [DieFace, DieFace]): number => {
  if ('op' in rolled[0] || 'op' in rolled[1]) {
    throw new Error('Dice rolled when deciding who goes first must not contain any or/and faces')
    // throw Dusk.invalidAction()
  }

  const [, a] = rolled[0].gain
  const [, b] = rolled[1].gain

  return a + b
}

export const decidedRollSum = (game: GameState, playerId: PlayerId) => {
  return game.decidedRollSumByPlayerId[playerId]
}

const getDefaultPlayerState = (id: PlayerId): PlayerState => {
  return {
    id,
    dice: [[M1, M1, M1, M1, W1, P1]],
    rolledNums: [undefined],
    viewing: 'worldMap',
    showDiceRoll: false,
    mesos: 0,
    powerCrystals: 0,
    wisdomCrystals: 0,
    level: 1,
    slotExpansions: 0,
  }
}

const checkDecidedFirstPlayer = (game: GameState) => {
  const firstPlayer = findFirstPlayer(game)
  if (firstPlayer && !game.whoseTurn) {
    game.whoseTurn = firstPlayer
  }
}

const checkToCalculateDecidedRollSum = (game: GameState, playerId: PlayerId, rolledNums: [DieFaceNum | undefined]) => {
  const rolled1 = rolledNums[0]

  if (rolled1 && !(playerId in game.decidedRollSumByPlayerId)) {
    game.decidedRollSumByPlayerId[playerId] = rolled1

    checkDecidedFirstPlayer(game)
  }
}

Dusk.initLogic({
  minPlayers: 1,
  maxPlayers: 4,
  inputDelay: 250,

  setup: allPlayerIds => ({
    playerStateById: allPlayerIds.reduce<GameState['playerStateById']>((acc, id) => {
      acc[id] = getDefaultPlayerState(id)
      return acc
    }, {}),
    decidedRollSumByPlayerId: {},
  }),

  actions: {
    rollDie({ which }, { game, playerId }) {
      const { rolledNums } = game.playerStateById[playerId]!
      const faceNum = ((Math.floor(Math.random() * 6) % 6) + 1) as DieFaceNum

      rolledNums[which - 1] = faceNum

      checkToCalculateDecidedRollSum(game, playerId, rolledNums)
    },

    startGame(_, { game, playerId }) {
      if (game.whoseTurn === playerId) {
        game.gameStartedAt = gameTime()

        const order = playerOrder(game)
        for (let i = 0; i < order.length; i++) {
          game.playerStateById[order[i]!]!.mesos = order.length - 1 - i
        }
      }
    },

    switchView({ view }, { game, playerId }) {
      game.playerStateById[playerId]!.viewing = view
    },

    showDiceRoll({ show }, { game, playerId }) {
      game.playerStateById[playerId]!.showDiceRoll = show
    },
  },

  events: {
    playerJoined(playerId, { game }) {
      if (playerId in game.playerStateById) {
        game.playerStateById[playerId]!.afk = false
      } else {
        game.playerStateById[playerId] = getDefaultPlayerState(playerId)
      }
    },
    playerLeft(playerId, { game }) {
      game.playerStateById[playerId]!.afk = true
      checkDecidedFirstPlayer(game)
    },
  },
})

export const actions = Dusk.actions
