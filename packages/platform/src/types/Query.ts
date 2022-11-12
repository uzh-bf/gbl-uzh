import { idArg, intArg, nonNull, objectType } from 'nexus'
import * as GameService from '../services/GameService'
import * as PlayService from '../services/PlayService'
import { Game } from './Game'
import { LearningElement, LearningElementState } from './LearningElement'
import { Player, PlayerResult, PlayerState } from './Player'

export function generateBaseQueries() {
  return objectType({
    name: 'Query',
    definition(t) {
      t.list.nonNull.field('games', {
        type: Game,
        async resolve(_, args, ctx) {
          return GameService.getGames(args, ctx)
        },
      })

      t.field('game', {
        type: Game,
        args: {
          id: intArg(),
        },
        async resolve(_, args, ctx) {
          return GameService.getGame(args, ctx)
        },
      })

      t.field('result', {
        type: PlayerState,
        async resolve(_, args, ctx) {
          return PlayService.getPlayerResult(
            { gameId: ctx.user.gameId, playerId: ctx.user.sub },
            ctx
          ) as any
        },
      })

      t.nonNull.field('self', {
        type: Player,
        async resolve(_, args, ctx) {
          return PlayService.getPlayerData({ playerId: ctx.user.sub }, ctx)
        },
      })

      t.list.nonNull.field('learningElements', {
        type: LearningElement,
        async resolve(_, args, ctx) {
          return GameService.getLearningElements(args, ctx)
        },
      })

      t.field('learningElement', {
        type: LearningElementState,
        args: {
          id: nonNull(idArg()),
        },
        async resolve(_, args, ctx) {
          return PlayService.getLearningElement(args, ctx)
        },
      })

      t.list.nonNull.field('results', {
        type: PlayerResult,
        async resolve(_, args, ctx) {
          return PlayService.getPlayerResults(args, ctx)
        },
      })

      t.list.nonNull.field('pastResults', {
        type: PlayerResult,
        async resolve(_, args, ctx) {
          return PlayService.getPastResults(args, ctx)
        },
      })
    },
  })
}

export const Query = generateBaseQueries()
