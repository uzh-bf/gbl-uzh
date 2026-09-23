import { expect, type Browser, type Page } from '@playwright/test'

export function requireBaseURL(baseURL: string | undefined) {
  if (!baseURL) {
    throw new Error('baseURL is required for player join links')
  }

  return baseURL
}

function input(scope: Page, name: string) {
  return scope.locator(`input[name="${name}"]`)
}

export async function playerJoinUrl(
  page: Page,
  baseURL: string,
  index: number
) {
  const href = await page
    .getByTestId(`player-${index}`)
    .getByTestId('player-login-link')
    .getAttribute('href')

  if (!href) {
    throw new Error(`Missing player ${index} join link`)
  }

  return new URL(href, baseURL).toString()
}

export async function createGame(
  page: Page,
  { name, playerCount }: { name: string; playerCount: number }
) {
  await page.goto('/admin/games', { waitUntil: 'domcontentloaded' })
  await input(page, 'name').fill(name)
  await input(page, 'playerCount').fill(String(playerCount))
  await page.getByRole('button', { name: 'Create Game' }).click()
  await page.getByRole('link', { name: new RegExp(name) }).click()
  await expect(page.getByTestId('game-detail')).toBeVisible({
    timeout: 20_000,
  })
}

export async function openPlayerWelcome(
  browser: Browser,
  baseURL: string,
  joinUrl: string
) {
  const context = await browser.newContext({
    baseURL,
    ignoreHTTPSErrors: true,
    viewport: { width: 390, height: 844 },
  })
  try {
    const page = await context.newPage()
    // The development toolbar must not cover player controls.
    await page.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        const style = document.createElement('style')
        style.textContent = 'nextjs-portal { display: none; }'
        document.head.append(style)
      })
    })
    await page.goto(joinUrl, { waitUntil: 'domcontentloaded' })
    await page.waitForURL('**/play/welcome', { waitUntil: 'domcontentloaded' })
    await expect(
      page.getByRole('heading', { name: 'You just won the lottery' })
    ).toBeVisible({ timeout: 30_000 })
    return { context, page }
  } catch (error) {
    await context.close()
    throw error
  }
}

export async function expectNoPageOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    )
    .toBe(true)
}

export function capturePlayerScreenshot(
  page: Page,
  options: NonNullable<Parameters<Page['screenshot']>[0]>
) {
  return page.screenshot({
    animations: 'disabled',
    style:
      'nextjs-portal, [aria-label="Notifications (F8)"] { visibility: hidden !important; }',
    ...options,
  })
}
