import { expect, type Page } from '@playwright/test'

export async function expectGameStatusEventually(page: Page, status: string) {
  await expect
    .poll(
      async () => {
        const gameDetail = page.getByTestId('game-detail')
        const currentStatus = await gameDetail
          .getAttribute('data-game-status', { timeout: 2_000 })
          .catch(() => null)

        if (currentStatus !== status) {
          if (currentStatus !== null) {
            await page.reload({ waitUntil: 'domcontentloaded' })
          }

          return gameDetail
            .getAttribute('data-game-status', { timeout: 2_000 })
            .catch(() => null)
        }

        return currentStatus
      },
      {
        intervals: [500, 1_000, 2_000],
        timeout: 30_000,
      }
    )
    .toBe(status)
}
