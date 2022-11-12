import { createPubSub } from 'graphql-yoga'

export const pubSub = createPubSub<{
  'global:events': [event: any]
  'user:events': [userId: string, events: any]
}>()
