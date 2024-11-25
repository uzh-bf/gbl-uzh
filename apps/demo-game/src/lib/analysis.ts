import { standardDeviation } from '@gbl-uzh/platform/dist/lib/util'
import { PlayerResult } from 'src/graphql/generated/ops'
import { MONTHS, NUM_MONTHS } from './constants'

export const getSegmentEndResults = (results: PlayerResult[]) => {
  return results.filter((o) => o.type == 'SEGMENT_END')
}

export const composeChartData = (dataPerPeriod: any, key: string) => {
  const output = []
  dataPerPeriod.forEach((periodData, periodIndex) => {
    if (Object.keys(periodData).length === 0) return

    const players = Object.values(periodData)
    const num = players.length > 0 ? players[0][key].length : NUM_MONTHS

    for (let i = 0; i < num; i++) {
      const entry = {
        period: periodIndex,
        month: MONTHS[i % NUM_MONTHS] + ' P' + (periodIndex + 1).toString(),
      }

      players.forEach((player) => {
        entry[player.name] = player[key][i]
      })

      output.push(entry)
    }
  })
  return output
}

export const computeRiskAndReturnOfPlayer = (
  segmentEndResultsOfPlayer: PlayerResult[]
) => {
  const totalAssetsReturns = segmentEndResultsOfPlayer.flatMap(({ facts }) => {
    const assetsWithReturns = facts?.assetsWithReturns.slice(1) || []
    return assetsWithReturns.map(({ totalAssetsReturn }) => totalAssetsReturn)
  })

  const bankReturnPA: number =
    12 * segmentEndResultsOfPlayer?.[0]?.facts.assetsWithReturns[1].bankReturn

  const num = totalAssetsReturns.length

  const numResults = segmentEndResultsOfPlayer.length
  const lastResult = segmentEndResultsOfPlayer[numResults - 1]
  const assetsWithReturns = lastResult.facts?.assetsWithReturns
  const lastAccReturn = assetsWithReturns.slice(-1)[0].accTotalAssetsReturn

  const risk = standardDeviation(totalAssetsReturns) * Math.sqrt(12)
  const returns = Math.pow(1 + lastAccReturn, 12 / num) - 1
  const sharpeRatio =
    risk > 0.0001 ? (returns - bankReturnPA) / risk : undefined
  return {
    returns,
    risk,
    sharpeRatio,
  }
}
