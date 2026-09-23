import { expect, type Page } from '@playwright/test'

export async function expectGameStatusEventually(page: Page, status: string) {
  await expect(page.getByTestId('game-detail')).toHaveAttribute(
    'data-game-status',
    status,
    { timeout: 30_000 }
  )
}
