import { expect, test, type Browser, type Page } from '@playwright/test'
import {
  capturePlayerScreenshot,
  createGame,
  expectNoPageOverflow,
  openPlayerWelcome,
  playerJoinUrl,
  requireBaseURL,
} from './support/demoGame'
import { callTrpc, routeTrpc } from './support/trpc'

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
  const appBaseURL = requireBaseURL(baseURL)
  await createGame(admin, {
    name: `Welcome checks ${Date.now()}`,
    playerCount: 1,
  })
  return openPlayerWelcome(
    browser,
    appBaseURL,
    await playerJoinUrl(admin, appBaseURL, 0),
  )
}

async function captureViews(page: Page, state: string) {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport)
    await expectNoPageOverflow(page)
    const dialog = page.getByRole('dialog')
    if (await dialog.count()) {
      await expect(dialog).toBeVisible()
      const bounds = await dialog.boundingBox()
      expect(bounds!.y).toBeGreaterThanOrEqual(0)
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(
        viewport.height + 1,
      )
      await expect(
        dialog.getByRole('button', { name: /^Use / }),
      ).toBeInViewport()
    } else
      await expect(
        page.locator('footer').getByRole('button').last(),
      ).toBeInViewport()
    await capturePlayerScreenshot(page, {
      path: test.info().outputPath(`welcome-${state}-${viewport.name}.png`),
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
    await name.fill(' ')
    await expect(review).toBeDisabled()
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
      page.getByText('Use no more than 20 characters.'),
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
      page.getByRole('button', { name: 'Cancel', exact: true }),
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
        (element) => element.scrollHeight > element.clientHeight,
      ),
    ).toBe(true)
    await page
      .getByRole('button', { name: 'Zürich (ZH)', exact: true })
      .scrollIntoViewIfNeeded()
    await expect(
      page.getByRole('button', { name: 'Zürich (ZH)', exact: true }),
    ).toBeInViewport()
    await expect(
      page.getByRole('button', { name: 'Use Aargau (AG)', exact: true }),
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
      page.getByRole('heading', { name: 'Your bank', exact: true }),
    ).toBeFocused()
    await captureViews(page, 'review')
    const editAvatar = page.getByRole('button', {
      name: 'Edit avatar',
      exact: true,
    })
    await editAvatar.click()
    await expect(
      page.getByRole('button', { name: 'Bear', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true')
    await page.keyboard.press('Escape')
    await expect(editAvatar).toBeFocused()
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
    const unrouteSave = await routeTrpc(page, async ({ path }) => {
      if (path !== 'play.updatePlayerData') return undefined
      await saveGate
      return { error: 'Test save failure' }
    })
    const start = page.getByRole('button', {
      name: 'Start the game',
      exact: true,
    })
    await start.click()
    await expect(
      page.getByRole('button', { name: 'Starting…', exact: true }),
    ).toBeDisabled()
    for (const label of [
      'Edit bank name',
      'Edit avatar',
      'Edit location',
      'Back to bank setup',
    ])
      await expect(
        page.getByRole('button', { name: label, exact: true }),
      ).toBeDisabled()
    rejectSave?.()
    await expect(page.locator('footer').getByRole('alert')).toContainText(
      'We couldn’t save your bank',
    )
    await expect(start).toBeEnabled()
    await expect(
      page.getByText('Style Bank', { exact: true }).first(),
    ).toBeVisible()
    await unrouteSave()
    await start.click()
    await page.waitForURL('**/play/cockpit', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    })
    await expect(page.getByText('Game is scheduled.')).toBeVisible({
      timeout: 30_000,
    })
    const readProgress = async () => {
      const { data, error } = await callTrpc(page.request, 'query', 'play.self')
      expect(error).toBeUndefined()
      const {
        id,
        isReady,
        experience,
        completedLearningElementIds,
        visitedStoryElementIds,
        achievementKeys,
        facts,
      } = data as Record<string, unknown>
      return {
        id,
        isReady,
        experience,
        completedLearningElementIds,
        visitedStoryElementIds,
        achievementKeys,
        facts,
      }
    }
    const before = await readProgress()
    for (const [label, tab] of [
      ['Decisions', 'cockpit'],
      ['Market', 'market'],
      ['History', 'history'],
      ['Team', 'team'],
    ]) {
      const tabLink = page.getByRole('link', { name: label, exact: true })
      await tabLink.click()
      await expect(tabLink).toHaveAttribute('aria-current', 'page')
      const profile = page.getByRole('link', { name: 'Edit player profile' })
      await profile.focus()
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL(
        new RegExp(`/play/welcome\\?edit=1&tab=${tab}$`),
      )
      await expect(
        page.getByRole('heading', { name: 'Edit your bank' }),
      ).toBeVisible()
      await expect(name).toHaveValue('Style Bank')
      await expect(avatar).toContainText('Bear')
      await expect(location).toContainText('Aargau')
      await expect(
        page.getByText('Starting capital', { exact: true }),
      ).toHaveCount(0)
      await expect(
        page.getByRole('button', { name: 'Review your bank' }),
      ).toHaveCount(0)
      await name.fill('Discard this name')
      await page.getByRole('button', { name: 'Cancel', exact: true }).click()
      await expect(page).toHaveURL(new RegExp(`/play/cockpit\\?tab=${tab}$`))
      await expect(page.locator('header').getByRole('heading')).toHaveText(
        'Style Bank',
      )
    }
    await page.getByRole('link', { name: 'Edit player profile' }).click()
    const save = page.getByRole('button', {
      name: 'Save changes',
      exact: true,
    })
    await name.fill('A')
    await name.blur()
    await expect(save).toBeDisabled()
    await expect(page.getByText('Use at least 2 characters.')).toBeVisible()
    await name.fill('Updated Bank')
    await avatar.click()
    await page.getByRole('button', { name: 'Bull', exact: true }).click()
    await page.getByRole('button', { name: 'Use Bull', exact: true }).click()
    await location.click()
    await page.getByRole('textbox', { name: 'Search canton' }).fill('ZH')
    await page.getByRole('button', { name: 'Zürich (ZH)', exact: true }).click()
    await page
      .getByRole('button', { name: 'Use Zürich (ZH)', exact: true })
      .click()
    for (const width of [320, 400, 784]) {
      await page.setViewportSize({ width, height: 844 })
      await expectNoPageOverflow(page)
      await expect(save).toBeInViewport()
      await capturePlayerScreenshot(page, {
        path: test.info().outputPath(`profile-edit-${width}.png`),
      })
    }
    const editSaveGate = new Promise<void>((resolve) => {
      rejectSave = resolve
    })
    let saveCount = 0
    const unrouteEditSave = await routeTrpc(page, async ({ path }) => {
      if (path !== 'play.updatePlayerData') return undefined
      saveCount++
      await editSaveGate
      return { error: 'Test profile save failure' }
    })
    await save.click()
    await expect(
      page.getByRole('button', { name: 'Saving…', exact: true }),
    ).toBeDisabled()
    await expect(name).toBeDisabled()
    await expect(avatar).toBeDisabled()
    await expect(location).toBeDisabled()
    await expect(
      page.getByRole('button', { name: 'Cancel', exact: true }),
    ).toBeDisabled()
    rejectSave?.()
    await expect(page.locator('footer').getByRole('alert')).toContainText(
      'We couldn’t save your bank',
    )
    expect(saveCount).toBe(1)
    await expect(name).toHaveValue('Updated Bank')
    await unrouteEditSave()
    await save.click()
    await expect(page).toHaveURL(/\/play\/cockpit\?tab=team$/)
    await expect(page.locator('header').getByRole('heading')).toHaveText(
      'Updated Bank',
    )
    await expect(page.locator('header')).toContainText('HQ Zürich')
    await expect(page.locator('header img[src*="avatars"]')).toHaveAttribute(
      'src',
      /sparbulle/,
    )
    const after = await readProgress()
    const { facts: beforeFacts, ...beforeProgress } = before
    const { facts: afterFacts, ...afterProgress } = after
    expect(afterProgress).toEqual(beforeProgress)
    const parseFacts = (value: unknown) =>
      typeof value === 'string' ? JSON.parse(value) : value
    expect(parseFacts(afterFacts)).toEqual({
      ...parseFacts(beforeFacts),
      avatar: '/avatars/sparbulle.jpeg',
      location: 'ZH',
    })
    await page.goto('/play/welcome?edit=1&tab=invalid')
    await expect(name).toHaveValue('Updated Bank')
    await page.getByRole('button', { name: 'Cancel', exact: true }).click()
    await expect(page).toHaveURL(/\/play\/cockpit\?tab=cockpit$/)
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
    await routeTrpc(page, async ({ path }) => {
      if (path !== 'play.self') return undefined
      await gate
      if (mode === 'real') return undefined
      return mode === 'error' ? { error: 'Test query failure' } : { data: null }
    })
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('status')).toContainText('Loading your bank')
    release()
    await expect(
      page.getByRole('heading', { name: 'We couldn’t load your bank' }),
    ).toBeVisible()
    await expect(page.getByRole('main').getByRole('alert')).toContainText(
      'Please try again',
    )
    mode = 'real'
    await page.getByRole('button', { name: 'Try again', exact: true }).click()
    await expect(
      page.getByRole('heading', { name: 'You just won the lottery' }),
    ).toBeVisible()
    mode = 'missing'
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('main').getByRole('alert')).toContainText(
      'Open the join link from your instructor',
    )
    await expect(
      page.getByRole('button', { name: 'Try again', exact: true }),
    ).toHaveCount(0)
    await expect(
      page.getByRole('link', { name: 'Back to Minigame' }),
    ).toHaveAttribute('href', '/')
    mode = 'error'
    await page.goto('/play/welcome?edit=1&tab=history')
    await expect(page.getByRole('main').getByRole('alert')).toContainText(
      'Please try again',
    )
    const back = page.getByRole('link', { name: 'Back to game' })
    await expect(back).toHaveAttribute('href', '/play/cockpit?tab=history')
    await back.click()
    await expect(page.getByTestId('history-panel')).toBeVisible()
  } finally {
    release?.()
    await context.close()
  }
})
