import { subscriptionType } from 'nexus'
import { pubSub } from '../lib/pubsub.js'
import { Event } from '../nexus.js'

export function generateBaseSubscriptions() {
  return subscriptionType({
    definition(t) {
      t.list.nonNull.field('eventsGlobal', {
        type: Event,
        async subscribe(_, args, ctx) {
          return pubSub.subscribe('global:events')
        },
        async resolve(payload) {
          return payload as any
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
