import { expect, test, type Browser, type Page } from '@playwright/test'

const viewports = [
  { name: 'narrow', width: 320, height: 844 },
  { name: 'grid-boundary', width: 359, height: 844 },
  { name: 'above-grid', width: 360, height: 844 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'shell', width: 720, height: 1024 },
  { name: 'above-shell', width: 721, height: 1024 },
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'short', width: 390, height: 568 },
] as const

async function openWelcome(admin: Page, browser: Browser, baseURL?: string) {
  if (!baseURL) throw new Error('baseURL is required')
  const gameName = `Welcome checks ${Date.now()}`
  await admin.goto('/admin/games', { waitUntil: 'domcontentloaded' })
  await admin.locator('input[name="name"]').fill(gameName)
  await admin.locator('input[name="playerCount"]').fill('1')
  await admin.getByRole('button', { name: 'Create Game' }).click()
  await admin.getByRole('link', { name: new RegExp(gameName) }).click()
  const joinLink = admin
    .getByTestId('player-0')
    .getByTestId('player-login-link')
  await expect(joinLink).toBeVisible({ timeout: 45_000 })
  const href = await joinLink.getAttribute('href')
  if (!href) throw new Error('Missing player join link')
  const context = await browser.newContext({
    baseURL,
    ignoreHTTPSErrors: true,
    viewport: viewports[3],
  })
  try {
    const page = await context.newPage()
    await page.goto(new URL(href, baseURL).href, {
      waitUntil: 'domcontentloaded',
    })
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

async function captureViews(page: Page, state: string) {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport)
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
      )
      .toBe(true)
    const dialog = page.getByRole('dialog')
    if (await dialog.count()) {
      await expect(dialog).toBeVisible()
      const bounds = await dialog.boundingBox()
      expect(bounds!.y).toBeGreaterThanOrEqual(0)
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(
        viewport.height + 1
      )
      await expect(
        dialog.getByRole('button', { name: /^Use / })
      ).toBeInViewport()
    } else
      await expect(
        page.locator('footer').getByRole('button').last()
      ).toBeInViewport()
    await page.screenshot({
      path: test.info().outputPath(`welcome-${state}-${viewport.name}.png`),
      animations: 'disabled',
      style:
        'nextjs-portal, [aria-label="Notifications (F8)"] { visibility: hidden !important; }',
    })
  }
  await page.setViewportSize(viewports[3])
}

test('welcome layouts, picker drafts, validation, and failed-save recovery', async ({
  page: admin,
  browser,
  baseURL,
}) => {
  test.setTimeout(240_000)
  const { context, page } = await openWelcome(admin, browser, baseURL)
  let rejectSave: (() => void) | undefined
  try {
    await captureViews(page, 'intro')
    const setup = page.getByRole('button', {
      name: 'Set up your bank',
      exact: true,
    })
    await setup.hover()
    await expect(setup).toHaveCSS('background-color', 'rgb(0, 31, 130)')
    await setup.click()
    const name = page.getByLabel('Bank name', { exact: true })
    const review = page.getByRole('button', { name: 'Review your bank' })
    await name.fill('A')
    await name.blur()
    await expect(page.getByText('Use at least 2 characters.')).toBeVisible()
    await expect(review).toBeDisabled()
    await review.hover()
    await expect(review).toHaveCSS('background-color', 'rgb(248, 248, 248)')
    await expect(review).toHaveCSS('color', 'rgb(162, 162, 162)')
    await name.fill('A name longer than twenty characters')
    await name.blur()
    await expect(
      page.getByText('Use no more than 20 characters.')
    ).toBeVisible()
    await name.fill('Style Bank')
    await captureViews(page, 'setup')
    const avatar = page.getByRole('button', { name: /^Avatar / })
    await avatar.click()
    await page.getByRole('button', { name: 'Bear', exact: true }).click()
    await captureViews(page, 'avatar')
    await page.getByRole('button', { name: 'Use Bear', exact: true }).focus()
    await page.keyboard.press('Tab')
    await expect(
      page.getByRole('button', { name: 'Cancel', exact: true })
    ).toBeFocused()
    await page.getByRole('button', { name: 'Cancel', exact: true }).click()
    await expect(avatar).toBeFocused()
    await expect(avatar).toContainText('Choose an animal')
    await avatar.click()
    await page.getByRole('button', { name: 'Bear', exact: true }).click()
    await page.getByRole('button', { name: 'Use Bear', exact: true }).click()
    const location = page.getByRole('button', { name: /^Location / })
    await location.click()
    const search = page.getByRole('textbox', { name: 'Search canton' })
    await search.fill('not-a-canton')
    await expect(page.getByRole('status')).toContainText('No cantons found')
    await search.fill('AG')
    await page.getByRole('button', { name: 'Aargau (AG)', exact: true }).click()
    await captureViews(page, 'canton')
    await search.fill('')
    await page.setViewportSize(viewports[7])
    const cantonList = page
      .getByRole('dialog')
      .locator('[aria-label="Where is your bank?"]')
    expect(
      await cantonList.evaluate(
        (element) => element.scrollHeight > element.clientHeight
      )
    ).toBe(true)
    await page
      .getByRole('button', { name: 'Zürich (ZH)', exact: true })
      .scrollIntoViewIfNeeded()
    await expect(
      page.getByRole('button', { name: 'Zürich (ZH)', exact: true })
    ).toBeInViewport()
    await expect(
      page.getByRole('button', { name: 'Use Aargau (AG)', exact: true })
    ).toBeInViewport()
    await page.setViewportSize(viewports[3])
    await page.keyboard.press('Escape')
    await expect(location).toBeFocused()
    await expect(location).toContainText('Choose a canton')
    await location.click()
    await expect(search).toHaveValue('')
    await search.fill('AG')
    await page.getByRole('button', { name: 'Aargau (AG)', exact: true }).click()
    await page
      .getByRole('button', { name: 'Use Aargau (AG)', exact: true })
      .click()
    await review.click()
    await expect(
      page.getByRole('heading', { name: 'Your bank', exact: true })
    ).toBeFocused()
    await captureViews(page, 'review')
    await page
      .getByRole('button', { name: 'Edit bank name', exact: true })
      .click()
    await expect(name).toBeFocused()
    await expect(name).toHaveCSS('outline-width', '2px')
    await expect(name).toHaveValue('Style Bank')
    await review.click()
    const saveGate = new Promise<void>((resolve) => {
      rejectSave = resolve
    })
    await page.route('**/api/graphql', async (route) => {
      if (route.request().postDataJSON()?.operationName !== 'UpdatePlayerData')
        return route.continue()
      await saveGate
      await route.fulfill({
        json: { errors: [{ message: 'Test save failure' }] },
      })
    })
    const start = page.getByRole('button', {
      name: 'Start the game',
      exact: true,
    })
    await start.click()
    await expect(
      page.getByRole('button', { name: 'Starting…', exact: true })
    ).toBeDisabled()
    for (const label of [
      'Edit bank name',
      'Edit avatar',
      'Edit location',
      'Back to bank setup',
    ])
      await expect(
        page.getByRole('button', { name: label, exact: true })
      ).toBeDisabled()
    rejectSave?.()
    await expect(page.locator('footer').getByRole('alert')).toContainText(
      'We couldn’t save your bank'
    )
    await expect(start).toBeEnabled()
    await expect(
      page.getByText('Style Bank', { exact: true }).first()
    ).toBeVisible()
    await page.unroute('**/api/graphql')
    await start.click()
    await page.waitForURL('**/play/cockpit', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    })
    await expect(page.getByText('Game is scheduled.')).toBeVisible({
      timeout: 30_000,
    })
  } catch (error) {
    await test.info().attach('welcome-failure', {
      body: await page.screenshot(),
      contentType: 'image/png',
    })
    throw error
  } finally {
    rejectSave?.()
    await context.close()
  }
})

test('welcome loading, query retry, and missing-player views', async ({
  page: admin,
  browser,
  baseURL,
}) => {
  const { context, page } = await openWelcome(admin, browser, baseURL)
  let release!: () => void
  try {
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    let mode: 'error' | 'real' | 'missing' = 'error'
    await page.route('**/api/graphql', async (route) => {
      if (route.request().postDataJSON()?.operationName !== 'Self')
        return route.continue()
      await gate
      if (mode === 'real') return route.continue()
      await route.fulfill({
        json:
          mode === 'error'
            ? { errors: [{ message: 'Test query failure' }] }
            : { data: { self: null } },
      })
    })
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('status')).toContainText('Loading your bank')
    release()
    await expect(
      page.getByRole('heading', { name: 'We couldn’t load your bank' })
    ).toBeVisible()
    await expect(page.getByRole('main').getByRole('alert')).toContainText(
      'Please try again'
    )
    mode = 'real'
    await page.getByRole('button', { name: 'Try again', exact: true }).click()
    await expect(
      page.getByRole('heading', { name: 'You just won the lottery' })
    ).toBeVisible()
    mode = 'missing'
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('main').getByRole('alert')).toContainText(
      'Open the join link from your instructor'
    )
    await expect(
      page.getByRole('button', { name: 'Try again', exact: true })
    ).toHaveCount(0)
    await expect(
      page.getByRole('link', { name: 'Back to Minigame' })
    ).toHaveAttribute('href', '/')
  } finally {
    release?.()
    await context.close()
  }
})
