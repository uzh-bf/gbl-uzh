import { subscriptionType } from 'nexus'
import { pubSub } from '../lib/pubsub'
import { Event } from '../nexus'

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
          return pubSub.subscribe('user:events', String(ctx.user.sub))
        },
        async resolve(payload) {
          return payload as any
        },
      })
    },
  })
}

export const Subscription = generateBaseSubscriptions()
