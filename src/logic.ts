import type { DuskClient, PlayerId as DuskPlayerId } from 'dusk-games-sdk/multiplayer'
import { M1, M2, M3, M4, M5, M6 } from './logic.dice'

export type PlayerId = DuskPlayerId

export type View = 'worldMap' | 'cashShop'

export type Die = [DieFace, DieFace, DieFace, DieFace, DieFace, DieFace]

export type DieFaceNum = 1 | 2 | 3 | 4 | 5 | 6

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

export type Player = {
  id: PlayerId
  afk?: boolean
  level: number
  rollBuffer?: DieFaceNum[]
}

export type GameState = {
  players: { [id in PlayerId]: Player }
  gameStartedAt?: number
  turnOrder: PlayerId[]
  whoseTurn?: PlayerId
}

type GameActions = {
  rollDie: () => void
  endTurn: () => void
}

declare global {
  const Dusk: DuskClient<GameState, GameActions>
}

const WIN_LEVEL = 2

const StartingDie: Die = [M1, M2, M3, M4, M5, M6]
export const StartingDice: [Die] = [StartingDie]

export const gameTime = () => {
  return Dusk.gameTime()
}

export const gameTimeSinceOfficialStart = (game: GameState) => {
  return game.gameStartedAt ? gameTime() - game.gameStartedAt : 0
}

export const totalOnline = (game: GameState): number => {
  return Object.values(game.players).filter(p => !p.afk).length
}

const getDefaultPlayerState = (id: PlayerId): Player => {
  return { id, level: 1 }
}

const sortedTurnOrder = (allPlayerIds: PlayerId[]) => {
  return allPlayerIds.sort((a, b) => (a < b ? -1 : 1))
}

const sortTurnOrder = (game: GameState) => {
  game.turnOrder = sortedTurnOrder(Object.keys(game.players) as PlayerId[])
}

const wipeRollBuffer = (game: GameState, playerId: PlayerId) => {
  delete game.players[playerId]!.rollBuffer
}

const nextTurn = (game: GameState) => {
  if (!game.whoseTurn) {
    throw Dusk.invalidAction()
  }
  const whoseTurnIndex = (game.turnOrder.indexOf(game.whoseTurn) + 1) % game.turnOrder.length
  const whoseTurn = game.turnOrder[whoseTurnIndex]!
  game.whoseTurn = whoseTurn
}

export const lastRollWasAOne = (player: Player) => {
  return player.rollBuffer?.length === 0
}

export const totalRoll = (player: Player) => {
  return player.rollBuffer?.reduce((a, b) => a + b, 0)
}

const checkLevelUp = (game: GameState, playerId: PlayerId) => {
  const player = game.players[playerId]!

  const additionalLevels = totalRoll(player)
  if (!additionalLevels) {
    return
  }

  player.level += additionalLevels
}

export const isGameOver = (game: GameState) => {
  return Object.values(game.players).some(p => p.level >= WIN_LEVEL)
}

export const getLeaderboard = (game: GameState) => {
  return Object.values(game.players).sort((a, b) => (a.level < b.level ? 1 : -1))
}

Dusk.initLogic({
  minPlayers: 1,
  maxPlayers: 4,
  inputDelay: 250,

  setup: allPlayerIds => ({
    players: allPlayerIds.reduce<GameState['players']>((acc, id) => {
      acc[id] = getDefaultPlayerState(id)
      return acc
    }, {}),
    turnOrder: sortedTurnOrder(allPlayerIds),
  }),

  actions: {
    rollDie(_, { game, playerId }) {
      const player = game.players[playerId]!

      if (lastRollWasAOne(player)) {
        throw Dusk.invalidAction()
      }

      const faceNum = ((Math.floor(Math.random() * 6) % 6) + 1) as DieFaceNum

      if (faceNum === 1) {
        player.rollBuffer = []
      } else {
        player.rollBuffer = [...(player.rollBuffer ?? []), faceNum]
      }

      if (!game.whoseTurn) {
        game.whoseTurn = playerId
        game.gameStartedAt = gameTime()
      }
    },

    endTurn(_, { game, playerId }) {
      checkLevelUp(game, playerId)
      wipeRollBuffer(game, playerId)

      if (isGameOver(game)) {
        Dusk.gameOver({
          players: Object.fromEntries(getLeaderboard(game).map(p => [p.id, p.level])),
        })
      } else {
        nextTurn(game)
      }
    },
  },

  events: {
    playerJoined(playerId, { game }) {
      if (playerId in game.players) {
        game.players[playerId]!.afk = false
      } else {
        game.players[playerId] = getDefaultPlayerState(playerId)
      }
      sortTurnOrder(game)
    },

    playerLeft(playerId, { game }) {
      game.players[playerId]!.afk = true
      sortTurnOrder(game)
    },
  },
})

export const actions = Dusk.actions
