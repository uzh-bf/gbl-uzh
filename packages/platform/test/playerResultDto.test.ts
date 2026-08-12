import { describe, expect, it } from '@jest/globals'
import { PlayerResultType } from '../src/generated/prisma/client.js'
import {
  toPlayerResultDto,
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
    expect(result?.currentGame.players[0]).not.toHaveProperty('token')
    expect(result?.currentGame.players[0]).not.toHaveProperty('facts')
  })

  it('maps result player identity without private player fields', () => {
    const player = {
      id: 'player-1',
      name: 'Governor One',
      token: 'sensitive-value',
      facts: { private: true },
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
    expect(result?.player).not.toHaveProperty('token')
    expect(result?.player).not.toHaveProperty('facts')
  })
})
