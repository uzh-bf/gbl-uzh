import { z } from 'zod'
import {
  createTRPCRouter,
  playerProcedure,
  protectedProcedure,
} from '../init.js'
import { idSchema } from '../schemas.js'
import * as PlayService from '../../services/PlayService.js'
import { storyElementDtoSchema, toStoryElementDto } from '../dto/content.js'

export function createStoryRouter() {
  return createTRPCRouter({
    list: protectedProcedure
      .output(z.array(storyElementDtoSchema))
      .query(async ({ ctx }) => {
        const elements = await ctx.prisma.storyElement.findMany({
          select: {
            id: true,
            type: true,
            title: true,
            content: true,
            contentRole: true,
          },
        })

        return (elements ?? [])
          .map((element: any) => toStoryElementDto(element))
          .filter(
            (element): element is NonNullable<typeof element> =>
              element !== null
          )
      }),

    markVisited: playerProcedure
      .input(z.object({ elementId: idSchema }))
      .mutation(async ({ input, ctx }) => {
        const player = await PlayService.markStoryElement(
          { elementId: input.elementId } as any,
          ctx as any
        )

        if (!player) return null

        // Return only the fields the client needs; the raw Player record
        // includes the login token and other internal columns.
        return {
          id: player.id,
          visitedStoryElementIds: player.visitedStoryElementIds,
        }
      }),
  })
}
