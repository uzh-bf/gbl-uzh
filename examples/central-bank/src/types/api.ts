import type { RouterOutputs } from '~/server/trpc/router'

export type PlayerResult = NonNullable<RouterOutputs['play']['result']>
export type SelfPlayer = NonNullable<RouterOutputs['play']['self']>
export type GameDetail = NonNullable<RouterOutputs['game']['byId']>
export type CurrentGameResult =
  RouterOutputs['results']['listForCurrentGame'][number]
