import { extendType, intArg, nonNull, objectType } from 'nexus'
import {
  canRevealMarketRoll,
  getMarketDice,
  revealMarketRoll,
} from '../services/MarketRevealService'

export const MarketDice = objectType({
  name: 'MarketDice',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.int('gameId')
    t.nonNull.int('periodIx')
    t.nonNull.int('index')
    t.nonNull.field('facts', { type: 'JSONObject' })
    t.nonNull.field('periodFacts', { type: 'JSONObject' })
    t.nonNull.boolean('canReveal')
  },
})

export const MarketQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('marketDice', {
      type: MarketDice,
      args: { segmentId: nonNull(intArg()) },
      async resolve(_, { segmentId }, ctx) {
        const segment = await getMarketDice(segmentId, ctx)
        if (!segment) return null
        return {
          ...segment,
          periodFacts: segment.period.facts,
          canReveal: canRevealMarketRoll(segment),
        }
      },
    })
  },
})

export const MarketMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('revealMarketRoll', {
      type: 'MarketRollReveal',
      args: { segmentId: nonNull(intArg()), rollIndex: nonNull(intArg()) },
      resolve: (_, { segmentId, rollIndex }, ctx) =>
        revealMarketRoll(segmentId, rollIndex, ctx),
    })
  },
})

export const MarketRollReveal = objectType({
  name: 'MarketRollReveal',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.field('facts', { type: 'JSONObject' })
  },
})
