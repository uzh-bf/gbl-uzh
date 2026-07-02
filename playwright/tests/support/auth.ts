import { expect, type Page } from '@playwright/test'

export const adminStorageState = '.auth/admin.json'

export async function loginAsAdmin(page: Page) {
  await page.goto('/admin/login')
  await expect(page.getByText('Not signed in')).toBeVisible()
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('**/admin/games', { timeout: 30_000 })
  await expect(page.getByRole('button', { name: 'Create Game' })).toBeVisible()
}
