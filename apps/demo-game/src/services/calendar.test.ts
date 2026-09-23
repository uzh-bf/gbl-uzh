import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { test } from 'node:test'
import { NUM_MONTHS_PER_SEGMENT } from '../lib/constants'
import { readMarketRoll, revealedIndices } from '../lib/market'
import { PeriodFactsSchema } from '../types/Period'
import { end } from './SegmentResultService'
import { initialize } from './SegmentService'

const scenario = {
  seed: 1,
  trendBonds: 0.0031,
  trendStocks: 0.0065,
  gapBonds: 0.005,
  gapStocks: 0.025,
  interestBank: 0.002,
}

test('legacy month overrides are stripped and generation always uses three months', () => {
  for (const rollsPerSegment of [1, 5, -1, '12', null]) {
    const validated = PeriodFactsSchema.validateSync({
      scenario,
      rollsPerSegment,
    })
    assert.equal('rollsPerSegment' in validated, false)
    // Even callers bypassing the input schema cannot override the game rule.
    const result = initialize({}, {
      periodFacts: { scenario, rollsPerSegment },
      periodIx: 0,
      segmentIx: 0,
    } as never).resultFacts
    assert.equal(result.diceRolls.length, NUM_MONTHS_PER_SEGMENT)
    assert.equal(result.returns.length, NUM_MONTHS_PER_SEGMENT)
    assert.equal(readMarketRoll(result, NUM_MONTHS_PER_SEGMENT), null)
    assert.deepEqual(
      revealedIndices({ revealedRollIndices: [0, 1, 2, 3, -1] }),
      [0, 1, 2]
    )
  }
})

test('settlement rejects incompatible stored month counts before computing results', () => {
  for (const count of [0, 2, 4]) {
    assert.throws(
      () =>
        end(
          {} as never,
          {
            segmentFacts: {
              returns: Array(count).fill({}),
              diceRolls: Array(count).fill({}),
            },
          } as never
        ),
      /must contain 3 monthly returns and dice rolls/
    )
  }
})

test('fresh runtime labels follow the current year across years and period offsets', () => {
  for (const year of [2031, 2032]) {
    execFileSync(
      process.execPath,
      [
        '--import',
        'tsx',
        '--input-type=module',
        '-e',
        `
      import assert from 'node:assert/strict';
      globalThis.Date = class extends Date { getFullYear() { return ${year} } };
      const constants = (await import('./src/lib/constants.ts')).default;
      const market = (await import('./src/lib/market.ts')).default;
      const team = (await import('./src/lib/team.ts')).default;
      assert.equal(constants.FIRST_GAME_YEAR, ${year});
      assert.equal(market.marketTimeLabel(0, 0, 0), '${year} · Quarter 1 · Month 1');
      assert.equal(market.marketTimeLabel(1, 0, 0), '${year + 1} · Quarter 1 · Month 1');
      const period = { id: 'p', index: 1, activeSegmentIx: 0, segments: [{ id: 's', index: 0,
        storyElements: [{ id: 'story', title: 'Story' }] }] };
      assert.equal(team.storyLibrary({ result: { currentGame: { periods: [period], activePeriod: period } } })[0].sequence.year, ${year + 1});
    `,
      ],
      { cwd: process.cwd(), stdio: 'pipe' }
    )
  }
})
