import { createPubSub } from 'graphql-yoga'
import type {
  BaseGlobalNotificationType,
  Event as PlatformEvent,
} from '../types.js'

export const pubSub = createPubSub<{
  'global:events': [event: PlatformEvent<BaseGlobalNotificationType>]
  'user:events': [userId: string, events: any]
}>()
