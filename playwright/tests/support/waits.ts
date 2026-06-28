import { expect, type Page } from '@playwright/test'

export async function expectGameStatus(page: Page, status: string) {
  await expect
    .poll(
      async () => {
        const currentStatus = await page
          .getByTestId('game-detail')
          .getAttribute('data-game-status')

        if (currentStatus !== status) {
          await page.reload()
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
