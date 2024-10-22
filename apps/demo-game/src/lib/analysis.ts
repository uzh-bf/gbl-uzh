import { PlayerResult } from 'src/graphql/generated/ops'

export const getSegmentEndResults = (results: PlayerResult[]) => {
  return results.filter((o) => o.type == 'SEGMENT_END')
}
