import { expect, test } from '@playwright/test'

test('demo-game app responds', async ({ page }) => {
  const response = await page.goto('/admin/login')

  expect(response?.ok()).toBe(true)
  await expect(page.getByText('Not signed in')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
})
