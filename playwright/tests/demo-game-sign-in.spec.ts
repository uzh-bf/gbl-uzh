import { expect, test } from '@playwright/test'
import {
  capturePlayerScreenshot,
  expectNoPageOverflow,
} from './support/demoGame'

test.use({ storageState: { cookies: [], origins: [] } })

for (const route of ['/', '/admin/login']) {
  test(`${route} shows the responsive StartInvest sign-in page`, async ({
    page,
  }, testInfo) => {
    await page.goto(route)
    await expect(
      page.getByRole('heading', { name: 'Sign in to StartInvest' })
    ).toBeVisible()
    await expect(page.getByRole('status')).toHaveText('You are not signed in.')

    for (const viewport of [
      { name: 'desktop', width: 1600, height: 1000 },
      { name: 'mobile', width: 375, height: 812 },
      { name: 'short', width: 375, height: 400 },
    ]) {
      await page.setViewportSize(viewport)
      await expect(
        page.getByRole('img', { name: 'Universität Zürich' })
      ).toBeVisible()
      await expect(
        page.getByRole('button', { name: 'Sign in', exact: true })
      ).toBeEnabled()
      await expectNoPageOverflow(page)
      await capturePlayerScreenshot(page, {
        path: testInfo.outputPath(`sign-in-${viewport.name}.png`),
        fullPage: true,
      })
    }

    await page.keyboard.press('Tab')
    await expect(
      page.getByRole('button', { name: 'Sign in', exact: true })
    ).toBeFocused()
  })
}

test('home sign-in can retry initiation and existing administrators skip both entry pages', async ({
  page,
}) => {
  await page.goto('/')
  const signIn = page.getByRole('button', { name: 'Sign in', exact: true })
  await expect(signIn).toBeEnabled()
  await page.route('**/api/auth/signin/auth0', (route) => route.abort(), {
    times: 1,
  })
  await signIn.click()
  await expect(page.getByRole('main').getByRole('alert')).toHaveText(
    'Could not start sign-in. Please try again.'
  )
  await expect(signIn).toBeEnabled()
  await signIn.click()
  await page.waitForURL('**/admin/games', { timeout: 30_000 })
  await expect(page.getByRole('button', { name: 'Create Game' })).toBeVisible()

  for (const route of ['/', '/admin/login']) {
    await page.goto(route)
    await page.waitForURL('**/admin/games')
    await expect(
      page.getByRole('button', { name: 'Create Game' })
    ).toBeVisible()
  }
})

test('session loading disables sign-in and player sessions can still sign in as an administrator', async ({
  page,
}) => {
  let releaseSession!: () => void
  const sessionReady = new Promise<void>((resolve) => {
    releaseSession = resolve
  })
  await page.route('**/api/auth/session', async (route) => {
    await sessionReady
    await route.fulfill({
      json: { user: { role: 'PLAYER' }, expires: '2099-01-01T00:00:00.000Z' },
    })
  })
  await page.goto('/')
  const signIn = page.getByRole('button', { name: 'Sign in', exact: true })
  try {
    await expect(page.getByRole('status')).toHaveText('Checking your session…')
    await expect(signIn).toBeDisabled()
  } finally {
    releaseSession()
  }
  await expect(page.getByRole('status')).toHaveText(
    'Sign in with an administrator account.'
  )
  await expect(signIn).toBeEnabled()
  await expect(page).toHaveURL(/\/$/)
})
