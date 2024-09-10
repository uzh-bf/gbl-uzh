import { PlayerResult } from 'src/graphql/generated/ops'

export const getSegmentEndResults = (results: PlayerResult[]) => {
  return results
    .filter((o) => o.type == 'SEGMENT_END')
    .sort((a, b) =>
      a.period.index > b.period.index && a.segment.index > b.segment.index
        ? -1
        : 1
    )
}

export const getBenchmarkBank = (assetsWithReturnsFlat: any[]) => {
  const numMonths = 12
  const bankBenchmarkRed = assetsWithReturnsFlat.reduce((acc, val, ix) => {
    const period = ~~(ix / numMonths) + 1
    acc[period] = [
      ...(acc[period] || []),
      {
        bankReturn: val.bankReturn ?? 0,
        // month: months[ix % numMonths],
      },
    ]
    return acc
  }, {})
  return bankBenchmarkRed
}
