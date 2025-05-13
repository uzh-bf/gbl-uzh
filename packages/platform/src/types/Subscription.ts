import { subscriptionType } from 'nexus'
import { pubSub } from '../lib/pubsub.js'
import { Event } from '../nexus.js'

export function generateBaseSubscriptions() {
  return subscriptionType({
    definition(t) {
      t.field('eventsGlobal', {
        type: Event,
        async subscribe(_, args, ctx) {
          // ctx.pubSub should be the instance you configured in createYoga context
          if (ctx.pubSub) {
            console.log('[Subscription] Subscribing to "global:events" topic.')
            return ctx.pubSub.subscribe('global:events') // pubSub.subscribe() returns AsyncIterableIterator
          }
          console.error('[Subscription] pubSub not found in context!')
          // Fallback or error handling if pubSub is not in context
          // This will likely lead to the "Expected Iterable" error if this path is taken
          // Forcing an error or returning an empty async iterable is better than returning undefined
          async function* empty() {}
          return empty()
        },
        async resolve(payload) {
          console.log(
            '[Subscription] Resolving payload for "eventsGlobal":',
            payload
          )
          return payload
        },
      })
      t.list.nonNull.field('eventsUser', {
        type: Event,
        async subscribe(_, args, ctx) {
          if (ctx.user) {
            return pubSub.subscribe('user:events', String(ctx.user.sub))
          }

          return pubSub.subscribe('user:events', 'anonymous')
        },
        async resolve(payload) {
          return payload as any
        },
      })
    },
  })
}

export const Subscription = generateBaseSubscriptions()
