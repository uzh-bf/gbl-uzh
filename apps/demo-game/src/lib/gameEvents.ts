import { shouldRefetchGameResult } from '@gbl-uzh/ui'

/** The demo game's reveal event extends the platform's lifecycle refreshes. */
export function shouldRefetchDemoGame(
  event: Parameters<typeof shouldRefetchGameResult>[0],
  gameId: number
) {
  return (
    shouldRefetchGameResult(event, gameId) ||
    (event?.type === 'MARKET_ROLL_REVEALED' && event.facts?.gameId === gameId)
  )
}
