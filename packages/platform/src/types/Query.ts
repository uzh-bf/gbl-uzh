import * as DB from '@prisma/client'
import { idArg, intArg, nonNull, objectType, stringArg } from 'nexus'
import * as GameService from '../services/GameService.js'
import * as PlayService from '../services/PlayService.js'
import { Achievement } from './Achievement.js'
import { LearningElement, LearningElementState } from './LearningElement.js'
import { Player, PlayerDecision, PlayerResult, PlayerState } from './Player.js'
import { StoryElement } from './StoryElement.js'

export function generateBaseQueries() {
  return objectType({
    name: 'Query',
    definition(t) {
      t.list.nonNull.field('games', {
        type: 'Game',
        async resolve(_, args, ctx) {
          // admin-only: the Game type exposes player login tokens
          if (
            ctx.user?.role !== DB.UserRole.ADMIN &&
            ctx.user?.role !== DB.UserRole.MASTER
          )
            return []
          return GameService.getGames(args, ctx)
        },
      })

      t.field('game', {
        type: 'Game',
        args: {
          id: intArg(),
        },
        async resolve(_, args, ctx) {
          // admin-only: the Game type exposes player login tokens
          if (
            ctx.user?.role !== DB.UserRole.ADMIN &&
            ctx.user?.role !== DB.UserRole.MASTER
          )
            return null
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

      t.field('decision', {
        type: PlayerDecision,
        async resolve(_, args, ctx) {
          return PlayService.getPlayerDecision(
            { gameId: ctx.user.gameId, playerId: ctx.user.sub },
            ctx
          ) as any
        },
      })

      t.field('self', {
        type: Player,
        async resolve(_, args, ctx) {
          if (!ctx.user) return null
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

      t.list.nonNull.field('specificResults', {
        type: PlayerResult,
        args: {
          gameId: nonNull(intArg()),
          type: nonNull(stringArg()),
        },
        async resolve(_, args, ctx) {
          return PlayService.getSpecificResults(args, ctx)
        },
      })

      t.list.nonNull.field('pastResults', {
        type: PlayerResult,
        async resolve(_, args, ctx) {
          return PlayService.getPastResults(args, ctx)
        },
      })

      t.list.nonNull.field('storyElements', {
        type: StoryElement,
        async resolve(_, args, ctx) {
          return GameService.getStoryElements(args, ctx)
        },
      })

      t.list.nonNull.field('questAchievements', {
        type: Achievement,
        async resolve(_, _args, ctx) {
          return ctx.prisma.achievement.findMany({
            where: {
              id: { notIn: ['LEARNING_ELEMENT_SOLVED'] },
            },
          })
        },
      })
    },
  })
}

export const Query = generateBaseQueries()
