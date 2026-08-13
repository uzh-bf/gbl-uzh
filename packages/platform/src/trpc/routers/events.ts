import { TRPCError } from '@trpc/server'
import { playerProcedure, createTRPCRouter } from '../init.js'
import {
  subscribeToGlobalEvents,
  subscribeToUserEvents,
} from '../../lib/realtime.js'

export function createEventsRouter() {
  return createTRPCRouter({
    global: playerProcedure.subscription(({ ctx, signal }) => {
      if (typeof ctx.user.gameId !== 'number') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Forbidden' })
      }

      return subscribeToGlobalEvents(ctx.user.gameId, signal)
    }),
    user: playerProcedure.subscription(({ ctx, signal }) =>
      subscribeToUserEvents(ctx.user.sub, signal)
    ),
  })
}
