import {
  arg,
  booleanArg,
  idArg,
  intArg,
  list,
  nonNull,
  objectType,
  stringArg,
} from 'nexus'
import { PlayerDecisionType } from '../generated/ops'
import * as AccountService from '../services/AccountService'
import * as GameService from '../services/GameService'

import {
  PeriodFacts,
  PeriodFactsInput,
  PeriodFactsSchema,
  PeriodSegmentFacts,
  PeriodSegmentFactsInput,
  PeriodSegmentFactsSchema,
} from '../../../../apps/demo-game/src/graphql/types/Period'
import * as PlayService from '../services/PlayService'
import { Game, Period, PeriodSegment } from './Game'
import { LearningElementAttempt } from './LearningElement'
import { Player, PlayerDecision, PlayerResult } from './Player'

const defaultReducers = {}

interface GenerateBaseMutationsArgs {
  reducers?: any
  roleAssigner?: (ix: number) => void
}

export function generateBaseMutations({
  reducers = defaultReducers,
  roleAssigner = () => 'UNSET',
}: GenerateBaseMutationsArgs = {}) {
  return objectType({
    name: 'Mutation',
    definition(t) {
      t.field('updateReadyState', {
        type: Player,
        args: {
          isReady: nonNull(booleanArg()),
        },
        async resolve(_, args, ctx) {
          return PlayService.updateReadyState(args, ctx)
        },
      })

      t.field('loginAsTeam', {
        type: Player,
        args: {
          token: nonNull(stringArg()),
        },
        async resolve(_, args, ctx) {
          return AccountService.loginAsTeam(args, ctx)
        },
      })

      t.field('createGame', {
        type: Game,
        args: {
          name: nonNull(stringArg()),
          playerCount: nonNull(intArg()),
        },
        async resolve(_, args, ctx) {
          return GameService.createGame(args, ctx, {
            roleAssigner,
          })
        },
      })

      t.field('addGamePeriod', {
        type: Period,
        args: {
          gameId: nonNull(intArg()),
          facts: arg({
            type: nonNull(PeriodFactsInput),
          }),
        },
        async resolve(_, args, ctx) {
          return GameService.addGamePeriod<PeriodFacts>(args, ctx, {
            schema: PeriodFactsSchema,
            reducers,
          })
        },
      })

      t.field('addPeriodSegment', {
        type: PeriodSegment,
        args: {
          gameId: nonNull(intArg()),
          periodIx: nonNull(intArg()),
          facts: arg({
            type: nonNull(PeriodSegmentFactsInput),
          }),
          storyElements: list(stringArg()),
          learningElements: list(stringArg()),
        },
        async resolve(_, args, ctx) {
          return GameService.addPeriodSegment<PeriodSegmentFacts>(args, ctx, {
            schema: PeriodSegmentFactsSchema,
            reducers,
          })
        },
      })

      t.field('activateNextPeriod', {
        type: Game,
        args: {
          gameId: nonNull(intArg()),
        },
        async resolve(_, args, ctx) {
          const results = await GameService.activateNextPeriod(args, ctx, {
            reducers,
          })
          if (!results) return
          return results[0] as any
        },
      })

      t.field('activateNextSegment', {
        type: Game,
        args: {
          gameId: nonNull(intArg()),
        },
        async resolve(_, args, ctx) {
          const results = await GameService.activateNextSegment(args, ctx, {
            reducers,
          })
          if (!results) return
          return results[0] as any
        },
      })

      t.field('performAction', {
        type: PlayerResult,
        args: {
          type: nonNull(stringArg()),
          payload: nonNull(stringArg()),
        },
        async resolve(_, args, ctx) {
          const currentGame = await GameService.getGameFromContext(ctx)

          if (!currentGame?.activePeriod) return null

          const facts = JSON.parse(args.payload)

          const result = await PlayService.performAction(
            {
              gameId: currentGame.id,
              actionType: args.type,
              playerId: ctx.user.sub,
              periodIx: currentGame.activePeriodIx,
              segmentIx: currentGame.activePeriod.activeSegmentIx,
              facts,
            },
            ctx,
            { reducers }
          )

          return result
        },
      })

      t.field('attemptLearningElement', {
        type: LearningElementAttempt,
        args: {
          elementId: nonNull(idArg()),
          selection: nonNull(stringArg()),
        },
        async resolve(_, args, ctx) {
          return PlayService.attemptLearningElement(args, ctx) as any
        },
      })

      t.field('markStoryElement', {
        type: Player,
        args: {
          elementId: nonNull(idArg()),
        },
        async resolve(_, args, ctx) {
          return PlayService.markStoryElement(args, ctx)
        },
      })

      t.field('updatePlayerData', {
        type: Player,
        args: {
          name: stringArg(),
          avatar: stringArg(),
          color: stringArg(),
          facts: stringArg(),
        },
        async resolve(_, args, ctx) {
          const facts = args.facts ? JSON.parse(args.facts) : {}
          return GameService.updatePlayerData({ ...args, facts }, ctx)
        },
      })

      t.field('saveConsolidationDecision', {
        type: PlayerDecision,
        args: {
          payload: nonNull(stringArg()),
        },
        async resolve(_, args, ctx) {
          const facts = JSON.parse(args.payload)

          return PlayService.saveDecisions(
            {
              decisionType: PlayerDecisionType.Consolidation,
              facts,
            },
            ctx
          )
        },
      })
    },
  })
}

export const Mutation = generateBaseMutations()