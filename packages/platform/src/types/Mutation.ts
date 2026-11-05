import { GraphQLError } from 'graphql'
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
import * as yup from 'yup'
import * as DB from '../generated/prisma/client.js'
import * as AccountService from '../services/AccountService.js'
import * as GameService from '../services/GameService.js'
import * as RegistrationService from '../services/RegistrationService.js'

import * as EventService from '../services/EventService.js'
import * as PlayService from '../services/PlayService.js'
import { Period, PeriodSegment } from './Game.js'
import { LearningElementAttempt } from './LearningElement.js'
import { Player, PlayerDecision, PlayerResult } from './Player.js'

// Yoga masks unexpected errors. Expose only the enrollment errors the UI can
// act on; database failures and other internal details stay masked.
async function registrationResponse<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work()
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      throw new GraphQLError('Check your registration details.', {
        extensions: { code: 'BAD_USER_INPUT' },
      })
    }
    if (
      error instanceof Error &&
      [
        'INVALID_REGISTRATION_LINK',
        'REGISTRATION_CLOSED',
        'REGISTRATION_FULL',
        'REGISTRATION_SESSION_REQUIRED',
        'FORBIDDEN',
      ].includes(error.message)
    ) {
      throw new GraphQLError(error.message, {
        extensions: { code: error.message },
      })
    }
    throw error
  }
}

const defaultServices = {}
const defaultSchemas = {}
const defaultInputTypes = {}

interface GenerateBaseMutationsArgs {
  services?: any
  schemas?: any
  inputTypes?: any
  // TODO(JJ): return value should be unknown
  roleAssigner?: (ix: number, facts: any) => any
}

function hasCompletedCompanySetup(
  player: { name?: unknown; facts?: unknown } | null | undefined
) {
  const hasName =
    typeof player?.name === 'string' && player.name.trim().length > 0
  if (!hasName) return false

  // Default names like "Team 1" don't count as custom company setup
  if (/^Team \d+$/i.test(player!.name as string)) return false

  const facts = player?.facts
  if (!facts || typeof facts !== 'object' || Array.isArray(facts)) return false

  const color = (facts as Record<string, unknown>).color
  return typeof color === 'string' && color.trim().length > 0
}

export function generateBaseMutations<
  GameFacts,
  PeriodFacts,
  PeriodSegmentFacts,
  PlayerFacts,
>({
  services = defaultServices,
  roleAssigner,
  schemas = defaultSchemas,
  inputTypes = defaultInputTypes,
}: GenerateBaseMutationsArgs = {}) {
  return objectType({
    name: 'Mutation',
    definition(t) {
      t.field('prepareRegistration', {
        type: 'RegistrationInfo',
        args: { token: nonNull(stringArg()) },
        resolve: (_, { token }, ctx) =>
          registrationResponse(() =>
            RegistrationService.prepareRegistration(token, ctx)
          ),
      })
      t.boolean('resumeRegistration', {
        args: { token: nonNull(stringArg()) },
        resolve: (_, { token }, ctx) =>
          registrationResponse(() =>
            RegistrationService.resumeRegistration(token, ctx)
          ),
      })
      t.boolean('registerPlayer', {
        args: {
          token: nonNull(stringArg()),
          name: nonNull(stringArg()),
          facts: nonNull(stringArg()),
        },
        resolve: (_, args, ctx) =>
          registrationResponse(() =>
            RegistrationService.registerPlayer(
              { ...args, facts: JSON.parse(args.facts) },
              ctx,
              {
                schema:
                  schemas.RegistrationSchema ??
                  yup.object({
                    name: yup.string().trim().required().max(100),
                    facts: schemas.PlayerFactsSchema ?? yup.object(),
                  }),
                roleAssigner,
              }
            )
          ),
      })
      t.field('setRegistrationOpen', {
        type: 'Game',
        args: { gameId: nonNull(intArg()), open: nonNull(booleanArg()) },
        resolve: (_, { gameId, open }, ctx) =>
          registrationResponse(() =>
            RegistrationService.setRegistrationOpen(gameId, open, ctx)
          ),
      })
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

      t.boolean('logoutAsTeam', {
        async resolve(_, __, ctx) {
          return AccountService.logoutAsTeam(ctx)
        },
      })

      t.field('createGame', {
        type: 'Game',
        args: {
          name: nonNull(stringArg()),
          playerCount: intArg(),
          registrationMode: arg({ type: 'RegistrationMode' }),
          maxPlayers: intArg(),
          facts: arg({
            type: nonNull(inputTypes.GameFactsInput),
          }),
        },
        async resolve(_, args, ctx) {
          return GameService.createGame<GameFacts>(args, ctx, {
            schema: schemas.GameFactsSchema,
            roleAssigner,
          })
        },
      })

      t.field('addGamePeriod', {
        type: Period,
        args: {
          gameId: nonNull(intArg()),
          facts: arg({
            type: nonNull(inputTypes.PeriodFactsInput),
          }),
          segmentCount: nonNull(intArg()),
        },
        async resolve(_, args, ctx) {
          return GameService.addGamePeriod<PeriodFacts>(args, ctx, {
            schema: schemas.PeriodFactsSchema,
            services,
          })
        },
      })

      t.field('addPeriodSegment', {
        type: PeriodSegment,
        args: {
          gameId: nonNull(intArg()),
          periodIx: nonNull(intArg()),
          facts: arg({
            type: nonNull(inputTypes.PeriodSegmentFactsInput),
          }),
          storyElements: list(stringArg()),
          learningElements: list(stringArg()),
        },
        async resolve(_, args, ctx) {
          return GameService.addPeriodSegment<PeriodSegmentFacts>(args, ctx, {
            schema: schemas.PeriodSegmentFactsSchema,
            services,
          })
        },
      })

      t.field('activateNextPeriod', {
        type: 'Game',
        args: {
          gameId: nonNull(intArg()),
        },
        resolve: (_, args, ctx) =>
          GameService.activateNextPeriod(args, ctx, { services }),
      })

      t.nonNull.field('finishGame', {
        type: 'Game',
        args: { gameId: nonNull(intArg()) },
        resolve: (_, { gameId }, ctx) => GameService.finishGame(gameId, ctx),
      })

      t.field('activateNextSegment', {
        type: 'Game',
        args: {
          gameId: nonNull(intArg()),
        },
        async resolve(_, args, ctx) {
          const results = await GameService.activateNextSegment(args, ctx, {
            services,
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

          const result = await PlayService.performActionWithRetry(
            {
              gameId: currentGame.id,
              actionType: args.type,
              playerId: ctx.user.sub,
              periodIx: currentGame.activePeriodIx,
              segmentIx: currentGame.activePeriod.activeSegmentIx,
              facts,
            },
            ctx,
            { services }
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
          facts: stringArg(),
        },
        async resolve(_, args, ctx) {
          const previousPlayer = await ctx.prisma.player.findUnique({
            where: {
              id: ctx.user.sub,
            },
            select: {
              name: true,
              facts: true,
              enrollmentKey: true,
            },
          })
          const hadSetupBefore =
            Boolean(previousPlayer?.enrollmentKey) ||
            hasCompletedCompanySetup(previousPlayer)

          const facts = args.facts ? JSON.parse(args.facts) : {}
          const player = await GameService.updatePlayerData<PlayerFacts>(
            { ...args, facts },
            ctx,
            { schema: schemas.PlayerFactsSchema }
          )

          const hasSetupAfter = hasCompletedCompanySetup(player)
          if (!hadSetupBefore && hasSetupAfter && player) {
            await EventService.receiveEvents({
              events: [
                {
                  type: 'COMPANY_SETUP_COMPLETED',
                  facts: { hasName: 1, hasColor: 1 },
                },
              ],
              ctx: {
                user: ctx.user,
                args: {
                  gameId: ctx.user.gameId,
                  periodIx: player.game?.activePeriodIx ?? 0,
                  playerId: ctx.user.sub,
                },
                achievements: player.achievementKeys,
                experience: player.experience,
                currentLevelIx: player.levelIx,
              },
              prisma: ctx.prisma,
            })
          }

          return player
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
              decisionType: DB.PlayerDecisionType.CONSOLIDATION,
              facts,
            },
            ctx
          )
        },
      })

      t.boolean('addCountdown', {
        args: {
          gameId: nonNull(intArg()),
          seconds: nonNull(intArg()),
        },
        async resolve(_, args, ctx) {
          return PlayService.addCountdown(args, ctx)
        },
      })

      t.boolean('toggleSwitch', {
        args: {
          gameId: nonNull(intArg()),
          toggle: nonNull(booleanArg()),
        },
        async resolve(_, args, ctx) {
          return PlayService.toggleSwitch(args, ctx)
        },
      })
    },
  })
}

export const Mutation = generateBaseMutations()
