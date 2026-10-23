import { expect, test, vi } from 'vitest'
import { activateNextPeriod, activateNextSegment } from './GameService.js'

test.each([
  ['PAUSED', activateNextSegment],
  ['CONSOLIDATION', activateNextPeriod],
] as const)(
  '%s validates advancement before any writes, even with no players',
  async (status, advance) => {
    const facts = { revealedRollIndices: [0, 1] }
    const game = {
      id: 1,
      status,
      players: [],
      results: [],
      periods: [],
      activePeriodIx: 0,
      activePeriod: {
        activeSegmentIx: 0,
        segments: [{ index: 0 }, { index: 1 }],
        activeSegment: { facts, results: [] },
        results: [],
        decisions: [],
      },
    }
    const transaction = vi.fn()
    const validateAdvance = vi.fn(() => {
      throw new Error('Reveal all months')
    })
    const ctx = {
      prisma: {
        game: { findUnique: vi.fn(async () => game) },
        $transaction: transaction,
      },
    }
    await expect(
      advance(
        { gameId: 1 },
        ctx as never,
        {
          services: { Segment: { validateAdvance } },
        } as never
      )
    ).rejects.toThrow('Reveal all months')
    expect(validateAdvance).toHaveBeenCalledWith(facts)
    expect(transaction).not.toHaveBeenCalled()
  }
)
