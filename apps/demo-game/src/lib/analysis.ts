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
