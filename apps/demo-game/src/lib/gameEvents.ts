import { shouldRefetchGameResult } from '@gbl-uzh/ui'

/** The demo game's reveal event extends the platform's lifecycle refreshes. */
export function shouldRefetchDemoGame(
  event: Parameters<typeof shouldRefetchGameResult>[0],
  gameId: number
) {
  return (
    shouldRefetchGameResult(event, gameId) ||
    (event?.type === 'MARKET_ROLL_REVEALED' && event?.facts?.gameId === gameId)
  )
}

/**
 * Only the instructor's game page shows the roster, so only it refreshes on
 * enrollment. Waiting players would otherwise all refetch on every join.
 */
export function shouldRefetchAdminGame(
  event: Parameters<typeof shouldRefetchGameResult>[0],
  gameId: number
) {
  return (
    shouldRefetchDemoGame(event, gameId) ||
    (event?.type === 'REGISTRATION_CHANGED' && event?.facts?.gameId === gameId)
  )
}
