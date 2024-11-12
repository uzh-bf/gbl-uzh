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

    for (let i = 0; i < NUM_MONTHS; i++) {
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
