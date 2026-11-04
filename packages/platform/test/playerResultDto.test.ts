import { describe, expect, it } from 'vitest'
import { PlayerResultType } from '../src/generated/prisma/client.js'
import {
  toPlayerResultDto,
  toPastResultDto,
  toSpecificResultDto,
} from '../src/trpc/dto/results.js'

describe('toPlayerResultDto', () => {
  it('includes leaderboard identity without exposing private player fields', () => {
    const result = toPlayerResultDto({
      currentGame: {
        id: 1,
        status: 'RUNNING' as any,
        periods: [],
        players: [
          {
            id: 'player-1',
            name: 'Bank One',
            token: 'private-join-token',
            facts: { private: true },
            experience: 50,
            completedLearningElementIds: ['private-progress'],
          },
        ],
      },
      playerResult: null,
      previousResults: [],
      transactions: [],
    })

    expect(result?.currentGame.players).toEqual([
      { id: 'player-1', name: 'Bank One' },
    ])
  })

  it('applies the game redaction to period and segment facts only', () => {
    const segment = { id: 20, index: 0, facts: { rolls: [1, 2, 3] } }
    const result = toPlayerResultDto(
      {
        currentGame: {
          id: 1,
          status: 'RUNNING' as any,
          periods: [
            { id: 10, index: 0, facts: { rate: 1 }, segments: [segment] },
          ],
          activePeriod: {
            id: 10,
            index: 0,
            facts: { rate: 1 },
            activeSegment: segment,
          },
          players: [],
        },
        playerResult: {
          id: 5,
          type: PlayerResultType.SEGMENT_END,
          facts: { cash: 100 },
          period: { id: 10, index: 0 },
        },
        previousResults: [],
        transactions: [],
      },
      {
        period: () => ({ hidden: true }),
        segment: (facts) => ({
          rolls: (facts as { rolls: number[] }).rolls.slice(0, 1),
        }),
      }
    )

    expect(result?.currentGame.periods[0]?.facts).toEqual({ hidden: true })
    expect(result?.currentGame.periods[0]?.segments[0]?.facts).toEqual({
      rolls: [1],
    })
    expect(result?.currentGame.activePeriod?.facts).toEqual({ hidden: true })
    expect(result?.currentGame.activePeriod?.activeSegment?.facts).toEqual({
      rolls: [1],
    })
    expect(result?.playerResult?.facts).toEqual({ cash: 100 })
  })

  it('maps result player identity without private player fields', () => {
    const player = {
      id: 'player-1',
      name: 'Governor One',
      token: 'sensitive-value',
      facts: { private: true },
      experience: 50,
      completedLearningElementIds: ['private-progress'],
    }
    const result = toSpecificResultDto({
      id: 1,
      type: PlayerResultType.SEGMENT_END,
      facts: {},
      period: { id: 10, index: 0 },
      player,
    })

    expect(result?.player).toEqual({
      id: 'player-1',
      name: 'Governor One',
    })
  })

  it("maps past result identity without another player's private fields", () => {
    const result = toPastResultDto({
      id: 2,
      type: PlayerResultType.PERIOD_END,
      facts: {},
      period: { id: 11, index: 1 },
      player: {
        id: 'player-2',
        name: 'Governor Two',
        role: 'ANALYST',
        facts: { private: true },
        experience: 75,
        experienceToNext: 100,
        level: { id: 3, index: 2 },
        completedLearningElementIds: ['private-learning-progress'],
        visitedStoryElementIds: ['private-story-progress'],
      },
    })

    expect(result?.player).toEqual({
      id: 'player-2',
      name: 'Governor Two',
    })
  })
})
