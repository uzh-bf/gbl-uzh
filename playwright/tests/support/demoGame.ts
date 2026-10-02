import {
  expect,
  type Browser,
  type BrowserContextOptions,
  type Page,
} from '@playwright/test'

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
  joinUrl: string,
  device: Pick<BrowserContextOptions, 'hasTouch' | 'isMobile'> = {}
) {
  const context = await browser.newContext({
    baseURL,
    ignoreHTTPSErrors: true,
    viewport: { width: 390, height: 844 },
    ...device,
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

export async function expectPhoneScrollContained(page: Page) {
  const nav = page.getByRole('navigation', { name: 'Player navigation' })
  const main = page.getByRole('main')
  const header = page.locator('header')
  const viewport = page.viewportSize()!
  await expect(nav.getByRole('link').first()).toHaveCSS('height', '40px')
  await expect
    .poll(async () => {
      const bounds = await nav.boundingBox()
      return Math.round(bounds!.y + bounds!.height)
    })
    .toBe(viewport.height)
  const navBefore = await nav.boundingBox()
  const headerBefore = await header.boundingBox()
  expect((await main.boundingBox())!.height).toBeGreaterThan(100)
  await main.evaluate((element) => {
    element.scrollTop = element.scrollHeight
  })
  // Exercise scroll chaining at the end of the content and over the tabs.
  await main.hover()
  await page.mouse.wheel(0, 1000)
  await nav.hover()
  await page.mouse.wheel(0, 1000)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  expect(await nav.boundingBox()).toEqual(navBefore)
  expect(await header.boundingBox()).toEqual(headerBefore)
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight)
  ).toBeLessThanOrEqual(viewport.height)
  await expect
    .poll(() =>
      main.evaluate((element) =>
        Math.abs(
          element.scrollHeight - element.clientHeight - element.scrollTop
        )
      )
    )
    .toBeLessThanOrEqual(1)
  await main.evaluate((element) => {
    element.scrollTop = 0
  })
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
