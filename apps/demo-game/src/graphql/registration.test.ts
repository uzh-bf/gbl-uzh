import { makeSchema } from 'nexus'
import { expect, test, vi } from 'vitest'
import * as types from '.'

const schema = makeSchema({ types, outputs: false })

test.each([true, false])(
  'editing a shared-registration bank does not repeat setup (pending: %s)',
  async (setupEventPending) => {
    const player = {
      id: 'registered-player',
      name: 'Team 1',
      facts: { color: 'Blue' },
      enrollmentKey: 'browser-enrollment-digest',
      setupEventPending,
    }
    const readEvents = vi.fn(() => {
      throw new Error('Completed registration must not dispatch setup again')
    })
    const resolve = schema.getMutationType()!.getFields().updatePlayerData!
      .resolve!
    const result = await resolve(
      null,
      { name: 'Renamed bank' },
      {
        user: { sub: player.id, role: 'PLAYER', gameId: 1 },
        prisma: {
          player: {
            findUnique: vi.fn().mockResolvedValue(player),
            update: vi.fn().mockResolvedValue({
              ...player,
              name: 'Renamed bank',
              game: { activePeriodIx: setupEventPending ? -1 : 0 },
            }),
          },
          event: { findMany: readEvents },
        },
      },
      {} as never
    )
    expect(result).toMatchObject({ name: 'Renamed bank' })
    expect(readEvents).not.toHaveBeenCalled()
  }
)
