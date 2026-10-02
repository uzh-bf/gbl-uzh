import { expect, type Page } from '@playwright/test'

export const adminStorageState = '.auth/admin.json'

export async function loginAsAdmin(page: Page) {
  await page.goto('/admin/login', { waitUntil: 'domcontentloaded' })
  const signIn = page.getByRole('button', { name: 'Sign in', exact: true })
  await expect(signIn).toBeEnabled()
  await signIn.click()
  await page.waitForURL('**/admin/games', {
    timeout: 30_000,
    waitUntil: 'domcontentloaded',
  })
  await expect(page.getByRole('button', { name: 'Create Game' })).toBeVisible()
}
