import { describe, expect, it } from '@jest/globals'
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
        role: 'private-role',
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
