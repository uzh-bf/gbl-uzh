import { shouldRefetchGameResult } from '@gbl-uzh/ui'

/** The demo game's reveal event extends the platform's lifecycle refreshes. */
export function shouldRefetchDemoGame(
  event: Parameters<typeof shouldRefetchGameResult>[0],
  gameId: number
) {
  return (
    shouldRefetchGameResult(event, gameId) ||
    (['MARKET_ROLL_REVEALED', 'REGISTRATION_CHANGED'].includes(
      event?.type ?? ''
    ) &&
      event?.facts?.gameId === gameId)
  )
}
