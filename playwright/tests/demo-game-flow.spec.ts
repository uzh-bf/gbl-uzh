import {
  expect,
  test,
  type Browser,
  type BrowserContext,
  type Locator,
  type Page,
} from '@playwright/test'
import { FIRST_GAME_YEAR } from '../../apps/demo-game/src/lib/constants'
import {
  capturePlayerScreenshot,
  createGame,
  expectNoPageOverflow,
  openPlayerWelcome,
  playerJoinUrl,
  requireBaseURL,
} from './support/demoGame'

import { expectGameStatusEventually } from './support/waits'

test.setTimeout(300_000)

type DecisionValues = {
  savings: string
  bonds: string
  stocks: string
}

type PlayerPlan = {
  name: string
  decisions: DecisionValues[]
}

type PlayerSession = {
  context: BrowserContext
  page: Page
  plan: PlayerPlan
}

const players: PlayerPlan[] = [
  {
    name: 'Playwright Bank One',
    decisions: [
      { savings: '33.3', bonds: '33.3', stocks: '33.4' },
      { savings: '35', bonds: '35', stocks: '30' },
      { savings: '30', bonds: '45', stocks: '25' },
      { savings: '45', bonds: '25', stocks: '30' },
    ],
  },
  {
    name: 'Playwright Bank Two',
    decisions: [
      { savings: '25', bonds: '35', stocks: '40' },
      { savings: '30', bonds: '30', stocks: '40' },
      { savings: '20', bonds: '50', stocks: '30' },
      { savings: '35', bonds: '20', stocks: '45' },
    ],
  },
  {
    name: 'Playwright Bank 3',
    decisions: [
      { savings: '10', bonds: '45', stocks: '45' },
      { savings: '15', bonds: '40', stocks: '45' },
      { savings: '20', bonds: '35', stocks: '45' },
      { savings: '25', bonds: '30', stocks: '45' },
    ],
  },
  {
    name: 'Playwright Bank 4',
    decisions: [
      { savings: '55', bonds: '15', stocks: '30' },
      { savings: '50', bonds: '20', stocks: '30' },
      { savings: '45', bonds: '25', stocks: '30' },
      { savings: '40', bonds: '20', stocks: '40' },
    ],
  },
]

function input(scope: Locator | Page, name: string) {
  return scope.locator(`input[name="${name}"]`)
}

async function addPeriod(
  page: Page,
  {
    segmentCount,
    index,
    scenario,
  }: { segmentCount: string; index: number; scenario?: Record<string, string> }
) {
  await page.getByRole('button', { name: 'Add period' }).click()
  const dialog = page.getByRole('dialog', { name: 'Add Period' })
  await dialog
    .getByRole('spinbutton', { name: 'Number of segments' })
    .fill(segmentCount)
  for (const [key, value] of Object.entries(scenario ?? {}))
    await input(dialog, key).fill(value)
  await dialog.getByRole('button', { name: 'Submit' }).click()
  await expect(page.getByTestId(`period-${index}`)).toBeVisible()
}

async function addSegment(
  page: Page,
  {
    periodIndex,
    withContent = false,
    storyIds,
    learningIds,
  }: {
    periodIndex: number
    withContent?: boolean
    storyIds?: string[]
    learningIds?: string[]
  }
) {
  const segmentIndex = await page
    .getByTestId(`period-${periodIndex}`)
    .locator('a[href*="/admin/dice/"]')
    .count()

  await page.getByRole('button', { name: 'Add segment' }).click()
  if (withContent || storyIds || learningIds) {
    const dialog = page.getByRole('dialog', {
      name: 'Add Segment',
      exact: true,
    })
    for (const [picker, ids] of [
      [0, storyIds ?? (withContent ? ['bank_account'] : [])],
      [1, learningIds ?? (withContent ? ['bonds_intro'] : [])],
    ] as const) {
      for (const id of ids) {
        await dialog.getByRole('combobox').nth(picker).click()
        await dialog.getByRole('option', { name: id, exact: true }).click()
        await dialog
          .getByRole('heading', { name: 'Add Segment', exact: true })
          .click()
      }
    }
  }
  await page.getByRole('button', { name: 'Submit' }).click()
  const segment = page.getByTestId(
    `period-${periodIndex}-segment-${segmentIndex}`
  )
  await expect(segment.locator('a[href*="/admin/dice/"]')).toBeVisible()
}

async function joinPlayer(
  browser: Browser,
  baseURL: string,
  joinUrl: string,
  plan: PlayerPlan
): Promise<PlayerSession> {
  const { context, page } = await openPlayerWelcome(browser, baseURL, joinUrl)
  try {
    await page
      .getByRole('button', { name: 'Set up your bank', exact: true })
      .click()
    await page.getByLabel('Bank name', { exact: true }).fill(plan.name)
    await page.getByRole('button', { name: /^Avatar / }).click()
    await page.getByRole('button', { name: 'Bear', exact: true }).click()
    await page.getByRole('button', { name: 'Use Bear', exact: true }).click()
    await page.getByRole('button', { name: /^Location / }).click()
    await page.getByRole('textbox', { name: 'Search canton' }).fill('AG')
    await page.getByRole('button', { name: 'Aargau (AG)', exact: true }).click()
    await page
      .getByRole('button', { name: 'Use Aargau (AG)', exact: true })
      .click()
    await page.getByRole('button', { name: 'Review your bank' }).click()
    await page.setViewportSize({ width: 1280, height: 900 })
    await Promise.all([
      page.waitForURL('**/play/cockpit', { waitUntil: 'domcontentloaded' }),
      page.getByRole('button', { name: 'Start the game', exact: true }).click(),
    ])
    await expect(page.getByText('Game is scheduled.')).toBeVisible({
      timeout: 30_000,
    })
    return { context, page, plan }
  } catch (error) {
    await context.close()
    throw error
  }
}

async function joinPlayers(
  browser: Browser,
  baseURL: string,
  playerPlans: PlayerPlan[],
  joinUrls: string[]
) {
  const sessions: PlayerSession[] = []

  try {
    for (const [index, plan] of playerPlans.entries()) {
      sessions.push(await joinPlayer(browser, baseURL, joinUrls[index], plan))
    }
  } catch (error) {
    await Promise.all(sessions.map(({ context }) => context.close()))
    throw error
  }

  return sessions
}

async function assertCoveringHandle(front: Locator, back: Locator) {
  const frontBounds = await front.boundingBox()
  const backBounds = await back.boundingBox()
  if (!frontBounds || !backBounds) throw new Error('Missing slider handles')
  expect(Math.abs(frontBounds.x - backBounds.x)).toBeLessThan(1)
  expect(Math.abs(frontBounds.y - backBounds.y)).toBeLessThan(1)
  expect(
    await front.evaluate((element) => {
      const rect = element.getBoundingClientRect()
      return (
        document
          .elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)
          ?.closest('[role="slider"]') === element
      )
    })
  ).toBe(true)
}

async function assertAllocationControls(page: Page, admin: Page) {
  const savings = page.getByRole('spinbutton', {
    name: 'Savings',
    exact: true,
  })
  const bonds = page.getByRole('spinbutton', { name: 'Bonds', exact: true })
  const stocks = page.getByRole('spinbutton', { name: 'Stocks', exact: true })
  const left = page.getByRole('slider', { name: 'Savings boundary' })
  const right = page.getByRole('slider', { name: 'Stocks boundary' })
  const submit = page.getByRole('button', {
    name: 'Submit allocation',
    exact: true,
  })
  await savings.fill('33.3')
  await bonds.fill('33.3')
  await stocks.fill('33.4')
  await expect(submit).toBeEnabled()
  await expect(left).toHaveAttribute('aria-valuenow', '33.3')
  await expect(page.getByTestId('allocation-bank')).toContainText(
    "3'330.00 CHF"
  )
  await savings.fill('33.2')
  await expect(submit).toBeDisabled()
  await expect(left).toBeDisabled()
  await expect(page.locator('#allocation-feedback')).toContainText(
    '0.1% remaining'
  )
  await savings.fill('33.33')
  await expect(savings).toHaveAttribute('aria-invalid', 'true')
  await savings.fill('33.3')
  await page.getByRole('link', { name: 'Market', exact: true }).click()
  await expect(page).toHaveURL(/tab=market/)
  await expect(page.getByTestId('market-panel')).toBeVisible()
  await expect(submit).toBeHidden()
  await page.getByRole('link', { name: 'History', exact: true }).click()
  await expect(page.getByTestId('history-panel')).toBeVisible()
  await page.getByRole('link', { name: 'Team', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Learning Activities' })
  ).toBeVisible()
  await expect(page.getByTestId('ready-switch')).toBeHidden()
  await page.getByRole('button', { name: 'Bonds', exact: true }).click()
  const learning = page.getByRole('dialog', {
    name: 'Learning Activity',
    exact: true,
  })
  await expect(learning).toBeVisible()
  await learning
    .getByRole('radio', {
      name: 'Eine Anleihe beinhaltet ein geringeres erwartetes Risiko als eine Aktie.',
    })
    .click()
  await learning
    .getByRole('button', { name: 'Submit answer', exact: true })
    .click()
  await expect(learning.getByText('Solved', { exact: true })).toBeVisible()
  // Both the sheet header and solved footer can close the activity.
  await learning
    .getByRole('button', { name: 'Close', exact: true })
    .first()
    .click()
  await page.getByRole('link', { name: 'Decisions', exact: true }).click()
  await expect(savings).toHaveValue('33.3')
  await setCountdown(admin, '300')
  await assertCountdownVisible(page)
  await expect(savings).toHaveValue('33.3')
  await left.focus()
  await left.press('ArrowRight')
  await expect(savings).toHaveValue('33.4')
  await left.press('Shift+ArrowLeft')
  await expect(savings).toHaveValue('32.4')
  await left.press('End')
  await expect(savings).toHaveValue('100')
  await expect(bonds).toHaveValue('0')
  await expect(stocks).toHaveValue('0')
  await assertCoveringHandle(left, right)
  await right.focus()
  await right.press('ArrowLeft')
  await expect(savings).toHaveValue('99.9')
  await expect(stocks).toHaveValue('0.1')
  await left.press('ArrowLeft')
  await expect(bonds).toHaveValue('0.1')
  await right.press('Home')
  await expect(stocks).toHaveValue('100')
  await assertCoveringHandle(right, left)
  await right.press('ArrowRight')
  await expect(bonds).toHaveValue('0.1')

  // Either boundary can be selected from the same overlapping pointer target.
  for (const direction of [-1, 1]) {
    await savings.fill('50')
    await bonds.fill('0')
    await stocks.fill('50')
    await right.scrollIntoViewIfNeeded()
    const overlap = await right.boundingBox()
    const rail = await page.getByTestId('allocation-slider').boundingBox()
    if (!overlap || !rail) throw new Error('Missing slider bounds')
    const x = overlap.x + overlap.width / 2
    const y = overlap.y + overlap.height / 2
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.move(x + direction * rail.width * 0.1, y, { steps: 8 })
    await expect(savings).toHaveValue(direction < 0 ? '40' : '50')
    await expect(bonds).toHaveValue('10')
    await expect(stocks).toHaveValue(direction < 0 ? '50' : '40')
    const selected = direction < 0 ? left : right
    await expect(selected).toBeFocused()
    await expect(selected).toHaveCSS('z-index', '2')
    const moved = await selected.boundingBox()
    expect(moved?.y).toBe(overlap.y)
    await page.mouse.up()
  }

  await savings.fill('55')
  await bonds.fill('35')
  await stocks.fill('10')
  await left.scrollIntoViewIfNeeded()
  const track = await page.getByTestId('allocation-slider').boundingBox()
  const thumb = await left.boundingBox()
  if (!track || !thumb) throw new Error('Allocation slider has no bounds')
  await page.mouse.move(thumb.x + thumb.width / 2, thumb.y + thumb.height / 2)
  await page.mouse.down()
  await page.mouse.move(
    track.x + track.width * 0.95,
    thumb.y + thumb.height / 2,
    { steps: 8 }
  )
  await page.mouse.up()
  await expect(bonds).toHaveValue('0')
  await expect(left).toHaveAttribute(
    'aria-valuenow',
    (await right.getAttribute('aria-valuenow')) ?? ''
  )

  // Failed mutations retain the draft and expose a retry, without changing Ready.
  const rejectAction = async (route: import('@playwright/test').Route) => {
    if (route.request().postData()?.includes('PerformAction')) {
      await route.fulfill({
        json: { errors: [{ message: 'Test save failure' }] },
      })
    } else await route.continue()
  }
  await page.route('**/api/graphql', rejectAction)
  await submit.click()
  await expect(
    page
      .getByRole('alert')
      .filter({ hasText: 'Could not save your allocation' })
  ).toBeVisible()
  await expect(bonds).toHaveValue('0')
  await page.unroute('**/api/graphql', rejectAction)
  await savings.fill('55')
  await bonds.fill('35')
  await stocks.fill('10')
  await page.getByRole('heading', { name: 'Your mix' }).click()
  for (const { name, width, height } of [
    { name: 'reference', width: 784, height: 1694 },
    { name: 'mobile', width: 390, height: 844 },
    { name: 'desktop', width: 1440, height: 1000 },
  ]) {
    await page.setViewportSize({ width, height })
    await expectNoPageOverflow(page)
    await capturePlayerScreenshot(page, {
      path: test.info().outputPath(`cockpit-${name}.png`),
      fullPage: true,
    })
  }
}

const cockpitViewports = [
  { name: 'narrow', width: 320, height: 844 },
  { name: 'small-boundary', width: 360, height: 844 },
  { name: 'above-small', width: 361, height: 844 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'mobile-boundary', width: 600, height: 1024 },
  { name: 'above-mobile', width: 601, height: 1024 },
  { name: 'tablet', width: 784, height: 1024 },
  { name: 'shell-boundary', width: 785, height: 1024 },
  { name: 'desktop', width: 1440, height: 1000 },
] as const

async function cockpitControlSizes(page: Page, action: Locator) {
  return Promise.all(
    [
      action,
      page.getByTestId('ready-switch'),
      page.locator('header'),
      page.getByRole('navigation', { name: 'Player navigation' }),
    ].map(async (locator) => {
      const box = await locator.boundingBox()
      return { width: Math.round(box!.width), height: Math.round(box!.height) }
    })
  )
}

async function assertSubmittedStates(page: Page, admin: Page) {
  const ready = page.getByRole('switch', { name: 'Ready', exact: true })
  const submit = page.getByRole('button', {
    name: 'Submit allocation',
    exact: true,
  })
  const change = page.getByRole('button', { name: 'Change allocation' })
  const forecast = page.getByRole('region', {
    name: 'Market outlook',
    exact: true,
  })
  await expect(forecast).toBeVisible()
  await expect(ready).toBeDisabled()
  const editingSizes = new Map<
    number,
    Awaited<ReturnType<typeof cockpitControlSizes>>
  >()
  for (const viewport of cockpitViewports) {
    await page.setViewportSize(viewport)
    await expect
      .poll(() => page.evaluate(() => innerWidth))
      .toBe(viewport.width)
    await expectNoPageOverflow(page)
    editingSizes.set(viewport.width, await cockpitControlSizes(page, submit))
    await capturePlayerScreenshot(page, {
      path: test.info().outputPath(`cockpit-editing-${viewport.name}.png`),
    })
  }
  await submit.click()
  await expect(
    page.getByText('Allocation submitted', { exact: true })
  ).toBeVisible()
  await expect(page.getByTestId('submitted-bank')).toContainText('55%')
  await expect(page.getByTestId('submitted-bank')).toContainText("5'500.00 CHF")
  await expect(ready).toBeEnabled()
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(
    page.getByText('Allocation submitted', { exact: true })
  ).toBeVisible()
  for (const state of ['submitted', 'ready']) {
    await expect(forecast).toHaveCount(0)
    if (state === 'ready') {
      const rejectReady = async (route: import('@playwright/test').Route) => {
        if (route.request().postData()?.includes('UpdateReadyState')) {
          await route.fulfill({
            json: { errors: [{ message: 'Test Ready failure' }] },
          })
        } else await route.continue()
      }
      await page.route('**/api/graphql', rejectReady)
      await ready.click()
      await expect(
        page.getByText('Could not update Ready', { exact: true })
      ).toBeVisible()
      await expect(ready).not.toBeChecked()
      await expect(change).toBeEnabled()
      await page.unroute('**/api/graphql', rejectReady)
      await ready.click()
      await expect(ready).toBeChecked()
      await expect(change).toBeDisabled()
      // Disabled hover must retain the locked action's surface, not the
      // design-system outline button's default hover background.
      await change.hover()
      await expect(change).toHaveCSS('background-color', 'rgb(248, 248, 248)')
      await expect(change).toHaveCSS('color', 'rgb(162, 162, 162)')
      await page.getByRole('navigation', { name: 'Player navigation' }).hover()
      await expect(page.getByText(/Locked mix for quarter/)).toBeVisible()
      await expect(page.getByTestId('countdown')).toBeVisible()
      await expectGameStatusEventually(admin, 'RUNNING')
    }
    await expect(page.getByRole('spinbutton')).toHaveCount(0)
    await expect(page.getByRole('slider')).toHaveCount(0)
    for (const tab of ['Market', 'History']) {
      await page.getByRole('link', { name: tab, exact: true }).click()
      await expect(page.getByTestId(`${tab.toLowerCase()}-panel`)).toBeVisible()
    }
    await page.getByRole('link', { name: 'Decisions', exact: true }).click()
    for (const { name, width, height } of cockpitViewports) {
      await page.setViewportSize({ width, height })
      await expect
        .poll(() => cockpitControlSizes(page, change))
        .toEqual(editingSizes.get(width))
      await expectNoPageOverflow(page)
      await capturePlayerScreenshot(page, {
        path: test.info().outputPath(`cockpit-${state}-${name}.png`),
      })
    }
  }
  await ready.click()
  await expect(change).toBeEnabled()
  await change.click()
  await expect(forecast).toBeVisible()
  await expect(ready).toBeDisabled()
  await expect(
    page.getByRole('spinbutton', { name: 'Savings', exact: true })
  ).toHaveValue('55')
  // An unchanged resubmission also returns to the saved summary.
  await submit.click()
  await expect(
    page.getByText('Allocation submitted', { exact: true })
  ).toBeVisible()
  await change.click()
  await page.getByRole('link', { name: 'Market', exact: true }).click()
  await setCountdown(admin, '300')
  await page.getByRole('link', { name: 'Decisions', exact: true }).click()
  await expect(submit).toBeVisible()
  await expect(ready).toBeDisabled()
  for (const [name, values] of [
    ['all-savings', ['100', '0', '0']],
    ['decimal', ['33.3', '33.3', '33.4']],
  ] as const) {
    for (const [index, label] of ['Savings', 'Bonds', 'Stocks'].entries()) {
      await page
        .getByRole('spinbutton', { name: label, exact: true })
        .fill(values[index])
    }
    await submit.click()
    await expect(
      page.getByText('Allocation submitted', { exact: true })
    ).toBeVisible()
    await page.setViewportSize({ width: 320, height: 844 })
    await expectNoPageOverflow(page)
    await capturePlayerScreenshot(page, {
      path: test.info().outputPath(`cockpit-submitted-${name}.png`),
    })
    await ready.click()
    await expect(ready).toBeChecked()
    await capturePlayerScreenshot(page, {
      path: test.info().outputPath(`cockpit-ready-${name}.png`),
    })
    await ready.click()
    await change.click()
  }
}

async function fillAllocation(page: Page, values: DecisionValues) {
  for (const [key, label] of [
    ['savings', 'Savings'],
    ['bonds', 'Bonds'],
    ['stocks', 'Stocks'],
  ] as const)
    await page
      .getByRole('spinbutton', { name: label, exact: true })
      .fill(values[key])
}

async function submitDecision(page: Page, values: DecisionValues) {
  const submitButton = page.getByRole('button', {
    name: 'Submit allocation',
    exact: true,
  })
  await fillAllocation(page, values)
  await submitButton.click()
  await expect(
    page.getByText('Allocation submitted', { exact: true })
  ).toBeVisible()
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('submitted-bank')).toContainText(
    `${values.savings}%`
  )
  await expect(page.getByTestId('submitted-bonds')).toContainText(
    `${values.bonds}%`
  )
  await expect(page.getByTestId('submitted-stocks')).toContainText(
    `${values.stocks}%`
  )
  await expect(page.getByTestId('ready-switch')).toBeVisible()
  await page.getByRole('switch', { name: 'Ready', exact: true }).click()
  await expect(
    page.getByRole('switch', { name: 'Ready', exact: true })
  ).toBeChecked()
}

async function advanceGame(
  page: Page,
  {
    action,
    expectedStatus,
  }: {
    action: string
    expectedStatus: string
  }
) {
  const button = page.getByRole('button', { name: action })
  await expect(button).toBeEnabled()
  // Await the transition response before any status-check reload can cancel it.
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/graphql') &&
      /ActivateNext(Period|Segment)/.test(response.request().postData() ?? '')
  )
  await button.click()
  const response = await responsePromise
  expect(await response.json()).not.toHaveProperty('errors')
  await expectGameStatusEventually(page, expectedStatus)
}

async function assertPlayerDecisionForm(sessions: PlayerSession[]) {
  await Promise.all(
    sessions.map(({ page }) =>
      expect(
        page.getByRole('button', { name: 'Submit allocation', exact: true })
      ).toBeVisible({
        timeout: 15_000,
      })
    )
  )
}

async function assertPlayerPortfolio(page: Page, timeout = 10_000) {
  await expect(page.getByText('To allocate', { exact: true })).toBeVisible({
    timeout,
  })
  await expect(page.getByText('Savings').first()).toBeVisible({ timeout })
  await expect(page.getByText('Bonds').first()).toBeVisible({ timeout })
  await expect(page.getByText('Stocks').first()).toBeVisible({ timeout })
}

async function setCountdown(page: Page, seconds: string) {
  await page
    .getByRole('spinbutton', { name: 'Countdown in seconds' })
    .fill(seconds)
  await page.getByRole('button', { name: 'Set Countdown' }).click()
}

async function assertCountdownVisible(page: Page) {
  await expect(page.getByTestId('countdown')).toBeVisible({ timeout: 15_000 })
}

async function runSegment(
  adminPage: Page,
  sessions: PlayerSession[],
  {
    segmentIndex,
    adminAction,
    expectedStatus,
  }: {
    segmentIndex: number
    adminAction: string
    expectedStatus: string
  }
) {
  await assertPlayerDecisionForm(sessions)
  await assertPlayerPortfolio(sessions[0].page)

  for (const { page, plan } of sessions) {
    await submitDecision(page, plan.decisions[segmentIndex])
  }

  await advanceGame(adminPage, {
    action: adminAction,
    expectedStatus,
  })
}

async function assertUniqueJoinUrls(
  page: Page,
  baseURL: string,
  playerCount: number
) {
  await Promise.all(
    Array.from({ length: playerCount }, (_, index) =>
      expect(page.getByTestId(`player-${index}`)).toBeVisible()
    )
  )
  const joinUrls = await Promise.all(
    Array.from({ length: playerCount }, (_, index) =>
      playerJoinUrl(page, baseURL, index)
    )
  )
  expect(new Set(joinUrls).size).toBe(playerCount)
  return joinUrls
}

async function assertDicePage(page: Page) {
  const diceLink = page
    .getByTestId('period-0-segment-0')
    .locator('a[href*="/admin/dice/"]')
  await expect(diceLink).toBeVisible()

  const [dicePage] = await Promise.all([
    // Popup events wait for the initial response, including a cold dev build.
    page.waitForEvent('popup', { timeout: 60_000 }),
    diceLink.click(),
  ])

  try {
    await expect(dicePage.getByText('1. Month')).toBeVisible({
      timeout: 30_000,
    })
    await expect(dicePage.getByText('2. Month')).toBeVisible({
      timeout: 30_000,
    })
    await expect(dicePage.getByText('3. Month')).toBeVisible({
      timeout: 30_000,
    })
    await expect(dicePage.getByRole('button', { name: 'Roll' })).toHaveCount(3)
  } finally {
    await dicePage.close()
  }
}

async function assertFinalReport(page: Page, playerPlans: PlayerPlan[]) {
  const [reportPage] = await Promise.all([
    page.waitForEvent('popup', { timeout: 60_000 }),
    page.getByRole('button', { name: 'Report' }).click(),
  ])

  try {
    await expect(reportPage.getByTestId('report-loaded')).toBeVisible({
      timeout: 30_000,
    })

    for (const { name } of playerPlans) {
      await expect(reportPage.getByRole('columnheader', { name })).toBeVisible()
    }

    await expect(reportPage.getByText('Player Decisions')).toBeVisible()
    for (const label of ['P1 S1', 'P1 S2', 'P2 S1', 'P2 S2']) {
      await expect(reportPage.getByText(label)).toBeVisible()
    }

    await expect(
      reportPage.getByText('Risk-Return', { exact: true }).first()
    ).toBeVisible()
    await expect(
      reportPage.getByText('Sharpe Ratio', { exact: true })
    ).toBeVisible()
  } finally {
    await reportPage.close()
  }
}

test('cockpit allocation controls, navigation, and decimal persistence', async ({
  page,
  browser,
  baseURL,
}) => {
  const appBaseURL = requireBaseURL(baseURL)
  await createGame(page, {
    name: `Cockpit controls ${Date.now()}`,
    playerCount: 1,
  })
  await addPeriod(page, { segmentCount: '2', index: 0 })
  await addSegment(page, { periodIndex: 0, withContent: true })
  await addSegment(page, { periodIndex: 0 })
  const session = await joinPlayer(
    browser,
    appBaseURL,
    await playerJoinUrl(page, appBaseURL, 0),
    players[0]
  )
  try {
    await advanceGame(page, {
      action: 'Start Period',
      expectedStatus: 'PREPARATION',
    })
    await advanceGame(page, {
      action: 'Next Segment',
      expectedStatus: 'RUNNING',
    })
    const story = session.page.getByRole('dialog', {
      name: 'A. About the Savings Account',
      exact: true,
    })
    await expect(story).toBeVisible()
    await story.getByRole('button', { name: 'Continue', exact: true }).click()
    await expect(story).toBeHidden()
    await assertAllocationControls(session.page, page)
    await assertSubmittedStates(session.page, page)
    await submitDecision(session.page, players[0].decisions[0])
    await expect(
      session.page.getByRole('button', { name: 'Change allocation' })
    ).toBeDisabled()
    await expect(session.page.getByRole('spinbutton')).toHaveCount(0)
    await expect(session.page.getByRole('slider')).toHaveCount(0)
    await session.page.reload({ waitUntil: 'domcontentloaded' })
    await expect(session.page.getByText(/Locked mix for quarter/)).toBeVisible()
    await session.page
      .getByRole('switch', { name: 'Ready', exact: true })
      .click()
    await expect(
      session.page.getByText('Allocation submitted', { exact: true })
    ).toBeVisible()
    await session.page
      .getByRole('button', { name: 'Change allocation' })
      .click()
    await expect(
      session.page.getByRole('switch', { name: 'Ready', exact: true })
    ).toBeDisabled()
    await fillAllocation(session.page, {
      savings: '50',
      bonds: '25',
      stocks: '25',
    })
    // Keep an old-round response pending while a new quarter starts.
    const pendingActions: import('@playwright/test').Route[] = []
    await session.page.route('**/api/graphql', async (route) => {
      if (route.request().postData()?.includes('PerformAction'))
        pendingActions.push(route)
      else await route.continue()
    })
    await session.page
      .getByRole('button', { name: 'Submit allocation', exact: true })
      .click()
    await expect.poll(() => pendingActions.length).toBe(1)
    await advanceGame(page, {
      action: 'Segment Results',
      expectedStatus: 'PAUSED',
    })
    await expect(
      session.page.getByRole('button', {
        name: 'Submit allocation',
        exact: true,
      })
    ).toBeHidden()
    await advanceGame(page, {
      action: 'Next Segment',
      expectedStatus: 'RUNNING',
    })
    await expect(
      session.page.getByRole('spinbutton', { name: 'Savings', exact: true })
    ).toHaveValue('33.3')
    await session.page
      .getByRole('button', { name: 'Submit allocation', exact: true })
      .click()
    await expect.poll(() => pendingActions.length).toBe(2)
    await pendingActions[0].fulfill({
      json: { errors: [{ message: 'Late old-quarter failure' }] },
    })
    // Let the old response settle without completing the new submission.
    await session.page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        )
    )
    await expect(
      session.page.getByRole('button', { name: 'Submitting…', exact: true })
    ).toBeDisabled()
    await expect(
      session.page.getByText(
        'Could not save your allocation. Please try submitting again.'
      )
    ).toBeHidden()
    await pendingActions[1].fulfill({
      json: { errors: [{ message: 'Current-quarter failure' }] },
    })
    await expect(
      session.page.getByText(
        'Could not save your allocation. Please try submitting again.'
      )
    ).toBeVisible()
    await expect(
      session.page.getByRole('button', {
        name: 'Submit allocation',
        exact: true,
      })
    ).toBeEnabled()
  } finally {
    await session.context.close()
  }
})

test('admin and players complete multi-team multi-period demo-game flow', async ({
  page,
  browser,
  baseURL,
}) => {
  // Cold local report compilation exceeded the 30s popup wait after ~250s
  // of valid multi-team play. Allow the complete flow plus report rendering.
  test.setTimeout(420_000)
  const appBaseURL = requireBaseURL(baseURL)
  const gameName = `Playwright breadth ${Date.now()}`

  await createGame(page, { name: gameName, playerCount: players.length })
  await expect(
    page.getByRole('button', { name: 'Start Period' })
  ).toBeDisabled()

  const joinUrls = await assertUniqueJoinUrls(page, appBaseURL, players.length)

  await addPeriod(page, { segmentCount: '2', index: 0 })
  await expect(
    page.getByRole('button', { name: 'Start Period' })
  ).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Add period' })).toBeDisabled()
  await addSegment(page, { periodIndex: 0 })
  await expect(page.getByRole('button', { name: 'Add period' })).toBeDisabled()
  await addSegment(page, { periodIndex: 0 })
  await expect(page.getByRole('button', { name: 'Add segment' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Add period' })).toBeEnabled()

  await assertDicePage(page)

  await addPeriod(page, { segmentCount: '2', index: 1 })
  await expect(page.getByRole('button', { name: 'Add period' })).toBeDisabled()
  await addSegment(page, { periodIndex: 1 })
  await expect(page.getByRole('button', { name: 'Add period' })).toBeDisabled()
  await addSegment(page, { periodIndex: 1 })
  await expect(page.getByRole('button', { name: 'Add segment' })).toBeDisabled()
  // Exercise RESULTS with an upcoming period; the result-design test covers
  // the disconnected final pointer without an upcoming period.
  await addPeriod(page, { segmentCount: '1', index: 2 })

  const playerSessions: PlayerSession[] = []

  try {
    playerSessions.push(
      ...(await joinPlayers(browser, appBaseURL, players, joinUrls))
    )

    await advanceGame(page, {
      action: 'Start Period',
      expectedStatus: 'PREPARATION',
    })
    await advanceGame(page, {
      action: 'Next Segment',
      expectedStatus: 'RUNNING',
    })
    await setCountdown(page, '120')
    await assertCountdownVisible(playerSessions[0].page)
    await runSegment(page, playerSessions, {
      segmentIndex: 0,
      adminAction: 'Segment Results',
      expectedStatus: 'PAUSED',
    })
    await advanceGame(page, {
      action: 'Next Segment',
      expectedStatus: 'RUNNING',
    })
    await runSegment(page, playerSessions, {
      segmentIndex: 1,
      adminAction: 'Consolidate',
      expectedStatus: 'CONSOLIDATION',
    })
    await advanceGame(page, {
      action: 'Period Results',
      expectedStatus: 'RESULTS',
    })

    await advanceGame(page, {
      action: 'Next Period',
      expectedStatus: 'PREPARATION',
    })
    await expect(page.getByTestId('period-1')).toContainText('PREPARATION')

    await advanceGame(page, {
      action: 'Next Segment',
      expectedStatus: 'RUNNING',
    })
    await runSegment(page, playerSessions, {
      segmentIndex: 2,
      adminAction: 'Segment Results',
      expectedStatus: 'PAUSED',
    })
    await advanceGame(page, {
      action: 'Next Segment',
      expectedStatus: 'RUNNING',
    })
    await runSegment(page, playerSessions, {
      segmentIndex: 3,
      adminAction: 'Consolidate',
      expectedStatus: 'CONSOLIDATION',
    })
    await advanceGame(page, {
      action: 'Period Results',
      expectedStatus: 'RESULTS',
    })

    await assertFinalReport(page, players)
  } finally {
    await Promise.all(playerSessions.map(({ context }) => context.close()))
  }
})

type TradeSubmission = {
  volume: number
  modifier: number
}

async function tradeSubmissions(page: Page) {
  return page.evaluate(
    () =>
      (
        window as typeof window & {
          __tradingFormSubmissions: TradeSubmission[]
        }
      ).__tradingFormSubmissions
  )
}

test('trading actions submit one validated modifier and reset after success', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const submissions: TradeSubmission[] = []
    Object.defineProperty(window, '__tradingFormSubmissions', {
      value: submissions,
    })

    const originalLog = console.log
    console.log = (...args) => {
      const [value] = args
      if (
        args.length === 1 &&
        typeof value === 'object' &&
        value !== null &&
        'volume' in value &&
        'modifier' in value
      ) {
        submissions.push(value as TradeSubmission)
      }
      originalLog(...args)
    }
  })

  await page.goto('/')

  const volume = page.getByRole('spinbutton', { name: 'Volume' })
  const buy = page.getByRole('button', { name: 'Buy' })
  const sell = page.getByRole('button', { name: 'Sell' })
  const volumeId = await volume.getAttribute('id')

  if (!volumeId) {
    throw new Error('Volume input must expose an ID for its label')
  }

  await expect(page.locator(`label[for="${volumeId}"]`)).toHaveText('Volume')

  await expect(volume).toHaveValue('0')
  await expect(buy).toBeDisabled()
  await expect(sell).toBeDisabled()
  await expect.poll(() => tradeSubmissions(page)).toEqual([])

  await volume.fill('-1')
  await expect(buy).toBeDisabled()
  await expect(sell).toBeDisabled()
  await expect(volume).toHaveAttribute('aria-invalid', 'true')
  const errorId = await volume.getAttribute('aria-errormessage')

  if (!errorId) {
    throw new Error('Invalid volume input must reference its error message')
  }

  await expect(volume).toHaveAttribute(
    'aria-describedby',
    new RegExp(`(^|\\s)${errorId}(\\s|$)`)
  )
  await expect(page.locator(`[id="${errorId}"]`)).toHaveRole('alert')
  await expect.poll(() => tradeSubmissions(page)).toEqual([])

  await volume.fill('2')
  await expect(volume).not.toHaveAttribute('aria-invalid')
  await expect(volume).not.toHaveAttribute('aria-errormessage')
  await volume.press('Enter')
  await expect.poll(() => tradeSubmissions(page)).toEqual([])

  await buy.click()
  await expect
    .poll(() => tradeSubmissions(page))
    .toEqual([{ volume: 2, modifier: 1 }])
  await expect(volume).toHaveValue('0')

  await volume.fill('')
  await expect(volume).toHaveValue('')
  await expect(buy).toBeDisabled()
  await expect(sell).toBeDisabled()

  await volume.fill('3')
  await sell.click()
  await expect
    .poll(() => tradeSubmissions(page))
    .toEqual([
      { volume: 2, modifier: 1 },
      { volume: 3, modifier: -1 },
    ])
  await expect(volume).toHaveValue('0')
})

test('Market shows fixed admin reveals to two players during allocation', async ({
  page,
  browser,
  baseURL,
}, testInfo) => {
  const appBaseURL = requireBaseURL(baseURL)
  await createGame(page, {
    name: `Market reveals ${Date.now()}`,
    playerCount: 2,
  })
  await addPeriod(page, { segmentCount: '2', index: 0 })
  await addSegment(page, { periodIndex: 0 })
  await addSegment(page, { periodIndex: 0 })
  const sessions = await joinPlayers(
    browser,
    appBaseURL,
    players.slice(0, 2),
    await assertUniqueJoinUrls(page, appBaseURL, 2)
  )
  let dicePage: Page | undefined
  const revealQuery =
    'mutation RevealMarketRoll($segmentId:Int!,$rollIndex:Int!){revealMarketRoll(segmentId:$segmentId,rollIndex:$rollIndex){id facts}}'
  try {
    await advanceGame(page, {
      action: 'Start Period',
      expectedStatus: 'PREPARATION',
    })
    await advanceGame(page, {
      action: 'Next Segment',
      expectedStatus: 'RUNNING',
    })
    const player = sessions[0].page
    await fillAllocation(player, { savings: '50', bonds: '30', stocks: '20' })
    for (const session of sessions) {
      await session.page
        .getByRole('link', { name: 'Market', exact: true })
        .click()
      await expect(session.page.getByTestId('market-comparison')).toHaveCount(0)
      await expect(
        session.page
          .getByTestId('market-panel')
          .locator('[data-highlighted="true"]')
      ).toHaveCount(0)
    }
    const link = page
      .getByTestId('period-0-segment-0')
      .locator('a[href*="/admin/dice/"]')
    const segmentId = Number((await link.getAttribute('href'))!.split('/')[3])
    const query =
      'query MarketDice($segmentId:Int!){marketDice(segmentId:$segmentId){facts periodFacts}}'
    const authoritative = await (
      await page.request.post('/api/graphql', {
        data: { query, variables: { segmentId } },
      })
    ).json()
    const original = authoritative.data.marketDice.facts
    const forbidden = await (
      await player.request.post('/api/graphql', {
        data: { query: revealQuery, variables: { segmentId, rollIndex: 0 } },
      })
    ).json()
    expect(forbidden.errors).toHaveLength(1)
    expect(forbidden.data?.revealMarketRoll).toBeNull()
    const futureId = Number(
      (await page
        .getByTestId('period-0-segment-1')
        .locator('a[href*="/admin/dice/"]')
        .getAttribute('href'))!.split('/')[3]
    )
    const future = await (
      await page.request.post('/api/graphql', {
        data: {
          query: revealQuery,
          variables: { segmentId: futureId, rollIndex: 0 },
        },
      })
    ).json()
    expect(future.errors).toHaveLength(1)
    expect(future.data?.revealMarketRoll).toBeNull()
    ;[dicePage] = await Promise.all([
      page.waitForEvent('popup', { timeout: 60_000 }),
      link.click(),
    ])
    await expect(dicePage.getByText('1. Month')).toBeVisible({
      timeout: 30_000,
    })
    let failOnce = true
    await dicePage.route('**/api/graphql', async (route) => {
      if (
        failOnce &&
        route.request().postData()?.includes('mutation RevealMarketRoll')
      ) {
        failOnce = false
        await route.fulfill({
          json: { errors: [{ message: 'Temporary publication failure' }] },
        })
      } else await route.continue()
    })
    const first = dicePage.getByTestId('admin-roll-0')
    await first.getByRole('button', { name: 'Roll', exact: true }).click()
    await expect(first.getByRole('alert')).toContainText('Could not publish')
    await expect(player.getByTestId('market-comparison')).toHaveCount(0)
    await first.getByRole('button', { name: 'Retry publishing' }).click()
    await expect(first.getByRole('status')).toHaveText('Revealed to players')
    const checkRoll = async (index: number) => {
      for (const session of sessions) {
        await expect(
          session.page.getByTestId('market-comparison')
        ).toContainText(`Monthly returns · Month ${index + 1}`)
        for (const asset of ['bonds', 'stocks']) {
          const chart = session.page.getByTestId(`market-${asset}`)
          const dice = original.diceRolls[index]
          await expect(
            chart.getByText(`Month ${index + 1}`, { exact: true })
          ).toBeVisible()
          await expect(chart).not.toContainText('Highlighted:')
          await expect(
            chart.locator('[data-highlighted="true"]')
          ).toHaveAttribute(
            'data-roll',
            String(original.diceRolls[index][asset])
          )
          await expect(chart).toContainText(
            `= ${original.diceRolls[index][asset]}`
          )
          await expect(
            chart.getByRole('img', {
              name: `Shared die: ${dice.shared}`,
              exact: true,
            })
          ).toBeVisible()
          await expect(
            chart.getByRole('img', {
              name: `${asset === 'bonds' ? 'Bonds' : 'Stocks'} die: ${dice[asset] - dice.shared}`,
              exact: true,
            })
          ).toBeVisible()
          const value = original.returns[index][asset] * 100
          await expect(
            session.page.getByTestId(`market-return-${asset}`)
          ).toContainText(`${value > 0 ? '+' : ''}${value.toFixed(1)}%`)
        }
      }
    }
    await checkRoll(0)
    await player.getByRole('link', { name: 'Decisions', exact: true }).click()
    await expect(
      player.getByRole('spinbutton', { name: 'Savings', exact: true })
    ).toHaveValue('50')
    await expect(
      player.getByRole('spinbutton', { name: 'Bonds', exact: true })
    ).toHaveValue('30')
    await expect(
      player.getByRole('spinbutton', { name: 'Stocks', exact: true })
    ).toHaveValue('20')
    await player.getByRole('link', { name: 'Market', exact: true }).click()
    // Concurrent persistence must merge both markers; replaying month 1 cannot
    // replace month 3 as the latest result.
    const responses = await Promise.all(
      [1, 2].map((rollIndex) =>
        page.request.post('/api/graphql', {
          data: { query: revealQuery, variables: { segmentId, rollIndex } },
        })
      )
    )
    for (const response of responses)
      expect((await response.json()).errors).toBeUndefined()
    await checkRoll(2)
    await first.getByRole('button', { name: 'Roll', exact: true }).click()
    await expect(first.getByRole('status')).toHaveText('Revealed to players')
    await checkRoll(2)
    const after = await (
      await page.request.post('/api/graphql', {
        data: { query, variables: { segmentId } },
      })
    ).json()
    expect(after.data.marketDice.facts).toEqual({
      ...original,
      revealedRollIndices: [0, 1, 2],
    })
    await dicePage.reload()
    await expect(
      dicePage.getByText('Revealed to players', { exact: true })
    ).toHaveCount(3)
    await player.reload()
    await checkRoll(2)
    for (const width of [360, 390, 400, 784]) {
      await player.setViewportSize({
        width,
        height: width === 784 ? 1694 : 844,
      })
      await expect(player.getByTestId('market-panel')).toBeVisible()
      for (const asset of ['Bonds', 'Stocks']) {
        const chart = player.getByRole('region', {
          name: `${asset} return probabilities`,
        })
        await expect(chart).toBeVisible()
        await expect
          .poll(() =>
            chart.evaluate(
              (element) => element.scrollWidth <= element.clientWidth
            )
          )
          .toBe(true)
        await expect(chart.locator('[data-roll]')).toHaveCount(11)
      }
      expect(
        await player.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth
        )
      ).toBe(true)
      await player.locator('main').evaluate((element) => {
        element.scrollTop = 0
      })
      await player.screenshot({
        path: testInfo.outputPath(`market-${width}.png`),
      })
      if (width < 600) {
        await player.getByTestId('market-comparison').scrollIntoViewIfNeeded()
        await player.screenshot({
          path: testInfo.outputPath(`market-${width}-results.png`),
        })
      }
    }
    await advanceGame(page, {
      action: 'Segment Results',
      expectedStatus: 'PAUSED',
    })
    await advanceGame(page, {
      action: 'Next Segment',
      expectedStatus: 'RUNNING',
    })
    await checkRoll(2)
    await advanceGame(page, {
      action: 'Consolidate',
      expectedStatus: 'CONSOLIDATION',
    })
    await advanceGame(page, {
      action: 'Period Results',
      expectedStatus: 'RESULTS',
    })
    // Closing an unrevealed quarter does not publish its precomputed outcomes.
    await checkRoll(2)
    await addPeriod(page, {
      segmentCount: '1',
      index: 1,
      scenario: {
        trendStocks: '0.012',
        gapStocks: '0.04',
        interestBank: '0.008',
      },
    })
    await addSegment(page, { periodIndex: 1 })
    await advanceGame(page, {
      action: 'Next Period',
      expectedStatus: 'PREPARATION',
    })
    await advanceGame(page, {
      action: 'Next Segment',
      expectedStatus: 'RUNNING',
    })
    await checkRoll(2)
    for (const session of sessions) {
      await expect(session.page.getByTestId('market-stocks')).toContainText(
        'Expected +1.20%'
      )
      await expect(session.page.getByTestId('market-stocks')).toContainText(
        'Trend gap 4.00%'
      )
      await expect(session.page.getByTestId('market-stocks')).toContainText(
        'Volatility 19.32%'
      )
      await expect(session.page.getByTestId('market-comparison')).toContainText(
        '+0.2%'
      )
    }
  } finally {
    await dicePage?.close()
    await Promise.all(sessions.map(({ context }) => context.close()))
  }
})

test('History follows settled quarters, filters years and preserves hidden dice', async ({
  page,
  browser,
  baseURL,
}, testInfo) => {
  const appBaseURL = requireBaseURL(baseURL)
  await createGame(page, { name: `History ${Date.now()}`, playerCount: 1 })
  await addPeriod(page, { segmentCount: '2', index: 0 })
  await addSegment(page, { periodIndex: 0 })
  await addSegment(page, { periodIndex: 0 })
  await addPeriod(page, { segmentCount: '1', index: 1 })
  await addSegment(page, { periodIndex: 1 })
  const session = await joinPlayer(
    browser,
    appBaseURL,
    await playerJoinUrl(page, appBaseURL, 0),
    players[0]
  )
  const player = session.page
  const panel = player.getByTestId('history-panel')
  const quarters = panel.locator('[data-cy^="history-quarter-"]')
  const openHistory = () =>
    player.getByRole('link', { name: 'History', exact: true }).click()
  try {
    await advanceGame(page, {
      action: 'Start Period',
      expectedStatus: 'PREPARATION',
    })
    await advanceGame(page, {
      action: 'Next Segment',
      expectedStatus: 'RUNNING',
    })
    await fillAllocation(player, { savings: '50', bonds: '30', stocks: '20' })
    await openHistory()
    await expect(panel).toContainText(
      'Your history will appear after the first quarter closes.'
    )
    await expect(panel.getByTestId('history-value')).toHaveText("10'000.00")
    await expect(
      panel.getByRole('button', {
        name: `${FIRST_GAME_YEAR + 1}`,
        exact: true,
      })
    ).toHaveCount(0)
    await player.getByRole('link', { name: 'Decisions', exact: true }).click()
    await expect(
      player.getByRole('spinbutton', { name: 'Savings', exact: true })
    ).toHaveValue('50')
    await player
      .getByRole('button', { name: 'Submit allocation', exact: true })
      .click()
    await expect(player.getByTestId('allocation-summary')).toBeVisible()
    await openHistory()
    await advanceGame(page, {
      action: 'Segment Results',
      expectedStatus: 'PAUSED',
    })
    await expect(quarters).toHaveCount(1)
    const expand = panel.getByRole('button', {
      name: `${FIRST_GAME_YEAR} Quarter 1 monthly details`,
    })
    await expand.focus()
    await player.keyboard.press('Enter')
    await expect(expand).toHaveAttribute('aria-expanded', 'true')
    const monthly = panel.getByRole('table', {
      name: `${FIRST_GAME_YEAR} Quarter 1 monthly results`,
    })
    await expect(
      monthly.getByText('Not revealed', { exact: true })
    ).toHaveCount(3)
    const segmentLink = await page
      .getByTestId('period-0-segment-0')
      .locator('a[href*="/admin/dice/"]')
      .first()
      .getAttribute('href')
    if (!segmentLink) throw new Error('Missing quarter dice link')
    const segmentId = Number(segmentLink.split('/')[3])
    const reveal = await page.request.post('/api/graphql', {
      data: {
        query:
          'mutation RevealMarketRoll($segmentId:Int!,$rollIndex:Int!){revealMarketRoll(segmentId:$segmentId,rollIndex:$rollIndex){id facts}}',
        variables: { segmentId, rollIndex: 0 },
      },
    })
    expect(await reveal.json()).not.toHaveProperty('errors')
    await expect(
      monthly.getByText('Not revealed', { exact: true })
    ).toHaveCount(2)
    await advanceGame(page, {
      action: 'Next Segment',
      expectedStatus: 'RUNNING',
    })
    await expect(quarters).toHaveCount(1)
    await advanceGame(page, {
      action: 'Consolidate',
      expectedStatus: 'CONSOLIDATION',
    })
    await expect(quarters).toHaveCount(2)
    await advanceGame(page, {
      action: 'Period Results',
      expectedStatus: 'RESULTS',
    })
    await expect(quarters).toHaveCount(2)
    await expect(
      panel.getByRole('button', {
        name: `${FIRST_GAME_YEAR + 1}`,
        exact: true,
      })
    ).toHaveCount(0)
    await advanceGame(page, {
      action: 'Next Period',
      expectedStatus: 'PREPARATION',
    })
    await expect(
      panel.getByRole('button', {
        name: `${FIRST_GAME_YEAR + 1}`,
        exact: true,
      })
    ).toBeVisible()
    // Selection survives refetches and tabs, while a fresh page defaults to the latest started year.
    await expect(
      panel.getByRole('button', { name: `${FIRST_GAME_YEAR}`, exact: true })
    ).toHaveAttribute('aria-pressed', 'true')
    await player.reload()
    await expect(
      panel.getByRole('button', {
        name: `${FIRST_GAME_YEAR + 1}`,
        exact: true,
      })
    ).toHaveAttribute('aria-pressed', 'true')
    await expect(panel).toContainText(
      `No completed quarters in ${FIRST_GAME_YEAR + 1} yet.`
    )
    await advanceGame(page, {
      action: 'Next Segment',
      expectedStatus: 'RUNNING',
    })
    await expect(quarters).toHaveCount(0)
    await advanceGame(page, {
      action: 'Consolidate',
      expectedStatus: 'CONSOLIDATION',
    })
    await expect(quarters).toHaveCount(1)
    await advanceGame(page, {
      action: 'Period Results',
      expectedStatus: 'RESULTS',
    })
    await expect(quarters).toHaveCount(1)
    const value = await panel.getByTestId('history-value').innerText()
    await panel.getByRole('button', { name: 'All', exact: true }).click()
    await expect(quarters).toHaveCount(3)
    await expect(quarters.first()).toContainText(`${FIRST_GAME_YEAR} · Q1`)
    await expect(quarters.last()).toContainText(`${FIRST_GAME_YEAR + 1} · Q1`)
    await expect(panel.getByTestId('history-value')).toHaveText(value)
    const header = player.locator('header')
    for (const tab of ['Decisions', 'Market', 'Team', 'History']) {
      await player.getByRole('link', { name: tab, exact: true }).click()
      await expect(header.getByRole('heading', { level: 1 })).toHaveText(
        players[0].name
      )
      await expect(header.locator('p')).toHaveText('HQ Aargau')
      await expect(header.locator('img')).toHaveCount(1)
      if (tab === 'Team')
        await expect(
          player.getByTestId('team-panel').locator('img')
        ).toHaveCount(0)
    }
    await expect(
      panel.getByRole('button', { name: 'All', exact: true })
    ).toHaveAttribute('aria-pressed', 'true')
    await panel
      .getByRole('button', { name: `${FIRST_GAME_YEAR}`, exact: true })
      .click()
    await expect(quarters).toHaveCount(2)
    await expect(panel.getByTestId('history-value')).toHaveText(value)
    await expect(
      panel
        .getByRole('list', { name: 'Quarterly portfolio values' })
        .getByRole('listitem')
    ).toHaveCount(3)
    await player.getByRole('link', { name: 'Market', exact: true }).click()
    await openHistory()
    await expect(
      panel.getByRole('button', { name: `${FIRST_GAME_YEAR}`, exact: true })
    ).toHaveAttribute('aria-pressed', 'true')
    for (const width of [784, 390, 320]) {
      await player.setViewportSize({
        width,
        height: width === 784 ? 1692 : 844,
      })
      await expectNoPageOverflow(player)
      const breakdown = panel.getByRole('region', {
        name: 'Quarterly results',
        exact: true,
      })
      await breakdown.evaluate((element) => {
        element.scrollLeft = 0
      })
      await player.getByRole('main').evaluate((element) => {
        element.scrollTop = 0
      })
      await expect(
        player.getByRole('link', { name: 'Team', exact: true })
      ).toBeInViewport()
      await player.screenshot({
        path: testInfo.outputPath(`history-${width}.png`),
      })
      await panel
        .getByRole('button', {
          name: `${FIRST_GAME_YEAR} Quarter 1 monthly details`,
        })
        .click()
      await panel
        .getByRole('button', {
          name: `${FIRST_GAME_YEAR} Quarter 1 monthly details`,
        })
        .evaluate((element) =>
          element.scrollIntoView({ block: 'center', inline: 'nearest' })
        )
      await breakdown.evaluate((element) => {
        element.scrollLeft = 0
      })
      await player.screenshot({
        path: testInfo.outputPath(`history-${width}-expanded.png`),
      })
      if (width < 600) {
        await breakdown.focus()
        await player.keyboard.press('ArrowRight')
        await expect
          .poll(() => breakdown.evaluate((element) => element.scrollLeft))
          .toBeGreaterThan(0)
        await breakdown.evaluate((element) => {
          element.scrollLeft = element.scrollWidth
        })
        await player.screenshot({
          path: testInfo.outputPath(`history-${width}-results.png`),
        })
      }
      await panel
        .getByRole('button', {
          name: `${FIRST_GAME_YEAR} Quarter 1 monthly details`,
        })
        .click()
    }
  } finally {
    await session.context.close()
  }
})

test('Team stories and learning sheets preserve progress, drafts and released content', async ({
  page: admin,
  browser,
  baseURL,
}, testInfo) => {
  const appBaseURL = requireBaseURL(baseURL)
  await createGame(admin, {
    name: `Team content ${Date.now()}`,
    playerCount: 1,
  })
  await addPeriod(admin, { segmentCount: '2', index: 0 })
  await addSegment(admin, {
    periodIndex: 0,
    storyIds: ['bank_account', 'bonds'],
    learningIds: ['bonds_intro', 'investments_risks'],
  })
  await addSegment(admin, {
    periodIndex: 0,
    storyIds: ['bank_account', 'stocks'],
    learningIds: ['investments_risks', 'stocks_intro'],
  })
  const session = await joinPlayer(
    browser,
    appBaseURL,
    await playerJoinUrl(admin, appBaseURL, 0),
    { name: 'Team 1', decisions: players[0].decisions }
  )
  const player = session.page
  const pageErrors: string[] = []
  player.on('pageerror', (error) => pageErrors.push(error.message))
  const story = () =>
    player
      .getByRole('dialog')
      .filter({ has: player.getByText(/Story element ·/) })
  const quiz = () =>
    player.getByRole('dialog', { name: 'Learning Activity', exact: true })
  const team = player.getByTestId('team-panel')
  const teamTab = () =>
    player.getByRole('link', { name: 'Team', exact: true }).click()
  const capture = async (state: string) => {
    for (const width of [784, 390, 320]) {
      await player.setViewportSize({
        width,
        height: width === 784 ? 1692 : 844,
      })
      await expectNoPageOverflow(player)
      const dialog = player.getByRole('dialog')
      if (await dialog.count()) {
        const bounds = await dialog.boundingBox()
        expect(bounds!.y).toBeGreaterThanOrEqual(0)
        await expect(dialog.getByRole('button').last()).toBeInViewport()
      }
      await capturePlayerScreenshot(player, {
        path: testInfo.outputPath(`team-${state}-${width}.png`),
      })
    }
    await player.setViewportSize({ width: 390, height: 844 })
  }
  try {
    await teamTab()
    await expect(
      team.getByText('Stories will appear when a quarter begins.')
    ).toBeVisible()
    await expect(
      team.getByText('No learning activities available yet.')
    ).toBeVisible()
    await expect(
      player.getByRole('region', { name: 'Game progress' })
    ).toBeHidden()
    await advanceGame(admin, {
      action: 'Start Period',
      expectedStatus: 'PREPARATION',
    })
    await advanceGame(admin, {
      action: 'Next Segment',
      expectedStatus: 'RUNNING',
    })
    await expect(story()).toBeVisible()
    await expect(story().getByText('Card 1 of 2')).toBeVisible()
    await capture('story')
    // Outside pointer interactions must not skip the sequence.
    await player.mouse.click(4, 4)
    await expect(story()).toBeVisible()
    await story().getByRole('button', { name: 'Continue', exact: true }).click()
    await expect(story().getByText('Card 2 of 2')).toBeVisible()
    await story().getByRole('button', { name: 'Skip stories' }).click()
    await expect(story()).toBeHidden()
    await expect(
      team.getByRole('button', {
        name: 'A. About the Savings Account',
        exact: true,
      })
    ).toContainText('Read')
    const bondStory = team.getByRole('button', {
      name: 'B. About Bonds',
      exact: true,
    })
    await expect(bondStory).toContainText('New')
    await expect(bondStory).toHaveAccessibleDescription(
      `Card 2 of 2 · ${FIRST_GAME_YEAR} · Q1 New`
    )
    await expect(
      team.getByRole('button', { name: 'C. About Stocks', exact: true })
    ).toHaveCount(0)
    await expect(team.getByTestId('team-value')).toHaveText("10'000.00")
    await expect(team.getByTestId('team-last-quarter')).toHaveText('—')
    await capture('panel')
    await bondStory.click()
    await expect(story().getByText('Card 2 of 2')).toBeVisible()
    await player.keyboard.press('Escape')
    await expect(bondStory).toBeFocused()
    await expect(bondStory).toContainText('New')
    await bondStory.click()
    let rejectMark = true
    await player.route('**/api/graphql', async (route) => {
      if (
        route.request().postDataJSON()?.operationName === 'MarkStoryElement' &&
        rejectMark
      ) {
        rejectMark = false
        await route.fulfill({
          json: { errors: [{ message: 'Injected mark failure' }] },
        })
      } else await route.fallback()
    })
    await story().getByRole('button', { name: 'Continue', exact: true }).click()
    await expect(story().getByRole('alert')).toContainText(
      'Could not save your progress'
    )
    await story().getByRole('button', { name: 'Continue', exact: true }).click()
    await expect(story()).toBeHidden()
    await expect(bondStory).toContainText('Read')
    await player
      .getByRole('link', { name: 'Decisions', exact: true })
      .press('Enter')
    const savings = player.getByRole('spinbutton', {
      name: 'Savings',
      exact: true,
    })
    // Keep an invalid edit alive through content requests and switching tabs.
    await savings.fill('42.1')
    await teamTab()
    const bonds = team.getByRole('button', { name: 'Bonds', exact: true })
    await expect(bonds).toHaveAccessibleDescription('Quiz New')
    await bonds.click()
    await expect(quiz().getByRole('radio')).toHaveCount(3)
    await expect(
      quiz().getByRole('button', { name: 'Submit answer' })
    ).toBeDisabled()
    await quiz().getByRole('radio').nth(1).check()
    await capture('learning')
    await quiz().getByRole('button', { name: 'Later', exact: true }).click()
    await expect(bonds).toBeFocused()
    await expect(bonds).toHaveAccessibleDescription('Quiz Open')
    await bonds.click()
    await expect(quiz().getByRole('radio').nth(1)).toBeChecked()
    let rejectAnswer = true
    await player.route('**/api/graphql', async (route) => {
      if (
        route.request().postDataJSON()?.operationName ===
          'AttemptLearningElement' &&
        rejectAnswer
      ) {
        rejectAnswer = false
        await route.fulfill({
          json: { data: { attemptLearningElement: null } },
        })
      } else await route.fallback()
    })
    await quiz().getByRole('button', { name: 'Submit answer' }).click()
    await expect(quiz().getByRole('alert')).toContainText('Could not submit')
    await expect(quiz().getByRole('radio').nth(1)).toBeChecked()
    await quiz().getByRole('radio').first().check()
    await quiz().getByRole('button', { name: 'Submit answer' }).click()
    await expect(
      quiz().getByText('That answer is not correct. Try again.')
    ).toBeVisible()
    await quiz().getByRole('radio').nth(1).check()
    await quiz().getByRole('button', { name: 'Submit answer' }).click()
    await expect(quiz().getByText('Solved', { exact: true })).toBeVisible()
    await expect(quiz().getByRole('radio').nth(1)).toBeChecked()
    await expect(quiz().getByRole('radio').nth(1)).toBeDisabled()
    await expect(
      quiz().getByRole('heading', { name: 'Explanation' })
    ).toBeVisible()
    await quiz()
      .getByRole('button', { name: 'Close', exact: true })
      .first()
      .click()
    await expect(bonds).toHaveAccessibleDescription('Quiz Solved')
    await player
      .getByRole('link', { name: 'Decisions', exact: true })
      .press('Enter')
    await expect(savings).toHaveValue('42.1')
    await teamTab()
    const risks = team.getByRole('button', {
      name: 'Investment Risks',
      exact: true,
    })
    let rejectLoad = true
    await player.route('**/api/graphql', async (route) => {
      if (
        route.request().postDataJSON()?.operationName === 'LearningElement' &&
        rejectLoad
      ) {
        rejectLoad = false
        await route.fulfill({
          json: { errors: [{ message: 'Injected loading failure' }] },
        })
      } else await route.fallback()
    })
    await risks.click()
    await expect(quiz().getByRole('alert')).toContainText(
      'Could not load this activity'
    )
    await expect(quiz().getByRole('radio')).toHaveCount(0)
    await quiz().getByRole('button', { name: 'Try again' }).click()
    await expect(quiz().getByRole('radio')).toHaveCount(3)
    await quiz().getByRole('button', { name: 'Later' }).click()
    await player.reload()
    await expect(story()).toBeHidden()
    await expect(risks).toContainText('Open')
    await expect(bonds).toContainText('Solved')
    await expect(bondStory).toContainText('Read')
    await setCountdown(admin, '0')
    await risks.click()
    await quiz().getByRole('radio').nth(2).check()
    await expect(
      quiz().getByRole('button', { name: 'Submit answer' })
    ).toBeEnabled()
    // Instructor progression preempts the open activity with the newly released story.
    await advanceGame(admin, {
      action: 'Segment Results',
      expectedStatus: 'PAUSED',
    })
    await advanceGame(admin, {
      action: 'Next Segment',
      expectedStatus: 'RUNNING',
    })
    await expect(story()).toBeVisible()
    await expect(quiz()).toHaveCount(0)
    await expect(story().getByText('Card 2 of 2')).toBeVisible()
    await expect(
      story()
        .getByRole('heading', { name: 'C. About Stocks', exact: true })
        .last()
    ).toBeVisible()
    await story().getByRole('button', { name: 'Continue', exact: true }).click()
    await expect(
      team.getByRole('button', {
        name: 'A. About the Savings Account',
        exact: true,
      })
    ).toContainText(`${FIRST_GAME_YEAR} · Q1`)
    await expect(
      team.getByRole('button', {
        name: 'A. About the Savings Account',
        exact: true,
      })
    ).toHaveCount(1)
    await expect(
      team.getByRole('button', { name: 'C. About Stocks', exact: true })
    ).toContainText(`${FIRST_GAME_YEAR} · Q2`)
    await expect(team.getByTestId('team-last-quarter')).not.toHaveText('—')
    await risks.click()
    await expect(quiz().getByRole('radio').nth(2)).toBeChecked()
    await quiz().getByRole('button', { name: 'Later' }).click()
    // A query finishing after switching activities must not replace the
    // current title, options or solved state; null content stays explicit.
    let releaseQuery: (() => void) | undefined
    let queryReleased = false
    await player.route('**/api/graphql', async (route) => {
      const request = route.request().postDataJSON()
      if (
        request?.operationName === 'LearningElement' &&
        request.variables.id === 'stocks_intro'
      ) {
        await new Promise<void>((resolve) => {
          releaseQuery = resolve
        })
        await route.fulfill({ json: { data: { learningElement: null } } })
        queryReleased = true
      } else await route.fallback()
    })
    const stocks = team.getByRole('button', { name: 'Stocks', exact: true })
    await stocks.click()
    await expect(quiz().getByText('Loading activity…')).toBeVisible()
    await expect.poll(() => !!releaseQuery).toBe(true)
    await quiz().getByRole('button', { name: 'Later' }).click()
    await bonds.click()
    releaseQuery!()
    // Closing can cancel the fetch, so a response event is not guaranteed.
    await expect.poll(() => queryReleased).toBe(true)
    await expect(
      quiz().getByRole('heading', { name: 'Bonds', exact: true })
    ).toBeVisible()
    await expect(quiz().getByText('Solved', { exact: true })).toBeVisible()
    await quiz()
      .getByRole('button', { name: 'Close', exact: true })
      .first()
      .click()
    // Allow subsequent requests for the unavailable lesson to resolve directly.
    await player.route('**/api/graphql', async (route) => {
      const request = route.request().postDataJSON()
      if (
        request?.operationName === 'LearningElement' &&
        request.variables.id === 'stocks_intro'
      ) {
        await route.fulfill({ json: { data: { learningElement: null } } })
      } else await route.fallback()
    })
    await stocks.click()
    await expect(
      quiz().getByText('This activity is unavailable.')
    ).toBeVisible()
    await expect(
      quiz().getByRole('button', { name: 'Submit answer' })
    ).toBeDisabled()
    await quiz().getByRole('button', { name: 'Later' }).click()

    let releaseAttempt: (() => void) | undefined
    await player.route('**/api/graphql', async (route) => {
      if (
        route.request().postDataJSON()?.operationName ===
        'AttemptLearningElement'
      ) {
        await new Promise<void>((resolve) => {
          releaseAttempt = resolve
        })
        await route.fulfill({
          json: { errors: [{ message: 'Delayed attempt failure' }] },
        })
      } else await route.fallback()
    })
    await risks.click()
    await quiz().getByRole('button', { name: 'Submit answer' }).click()
    await expect.poll(() => !!releaseAttempt).toBe(true)
    await quiz().getByRole('button', { name: 'Later' }).click()
    await bonds.click()
    const attemptResponse = player.waitForResponse(
      (response) =>
        response.url().includes('/api/graphql') &&
        response.request().postDataJSON()?.operationName ===
          'AttemptLearningElement'
    )
    releaseAttempt!()
    await (await attemptResponse).finished()
    await expect(quiz().getByText('Solved', { exact: true })).toBeVisible()
    await expect(quiz().getByRole('alert')).toHaveCount(0)
    await quiz()
      .getByRole('button', { name: 'Close', exact: true })
      .first()
      .click()
    // Successful late submissions refresh the submitted activity, even while
    // a different activity is open, including its answer and explanation.
    let releaseSuccess: (() => void) | undefined
    await player.route('**/api/graphql', async (route) => {
      if (
        route.request().postDataJSON()?.operationName ===
        'AttemptLearningElement'
      ) {
        await new Promise<void>((resolve) => {
          releaseSuccess = resolve
        })
        await route.continue()
      } else await route.fallback()
    })
    await risks.click()
    await expect(quiz().getByRole('radio').nth(2)).toBeChecked()
    await quiz().getByRole('button', { name: 'Submit answer' }).click()
    await expect.poll(() => !!releaseSuccess).toBe(true)
    await quiz().getByRole('button', { name: 'Later' }).click()
    await bonds.click()
    const submittedActivityRefresh = player.waitForResponse((response) => {
      const request = response.request().postDataJSON()
      return (
        response.url().includes('/api/graphql') &&
        request?.operationName === 'LearningElement' &&
        request.variables.id === 'investments_risks'
      )
    })
    releaseSuccess!()
    await (await submittedActivityRefresh).finished()
    await expect(
      quiz().getByRole('heading', { name: 'Bonds', exact: true })
    ).toBeVisible()
    await expect(quiz().getByRole('radio').nth(1)).toBeChecked()
    await expect(quiz().getByRole('alert')).toHaveCount(0)
    await quiz()
      .getByRole('button', { name: 'Close', exact: true })
      .first()
      .click()
    await expect(risks).toHaveAccessibleDescription('Quiz Solved')
    await risks.click()
    await expect(quiz().getByRole('radio').nth(2)).toBeChecked()
    await expect(quiz().getByRole('radio').nth(2)).toBeDisabled()
    await expect(
      quiz().getByRole('heading', { name: 'Explanation' })
    ).toBeVisible()
    await expect(
      quiz().getByRole('button', { name: 'Submit answer' })
    ).toHaveCount(0)
    await quiz()
      .getByRole('button', { name: 'Close', exact: true })
      .first()
      .click()
    await advanceGame(admin, {
      action: 'Consolidate',
      expectedStatus: 'CONSOLIDATION',
    })
    await advanceGame(admin, {
      action: 'Period Results',
      expectedStatus: 'RESULTS',
    })
    await teamTab()
    await expect(
      team.getByRole('button', { name: 'B. About Bonds', exact: true })
    ).toBeVisible()
    await bondStory.click()
    await expect(story().getByText('Card 2 of 2')).toBeVisible()
    await story().getByRole('button', { name: 'Continue', exact: true }).click()
    await expect(story()).toBeHidden()
    expect(pageErrors).toEqual([])
  } finally {
    await session.context.close()
  }
})

test('cockpit result designs follow settled quarters, consolidation and completed years', async ({
  page,
  browser,
  baseURL,
}, testInfo) => {
  const appBaseURL = requireBaseURL(baseURL)
  await createGame(page, {
    name: `Result designs ${Date.now()}`,
    playerCount: 1,
  })
  const joinUrl = await playerJoinUrl(page, appBaseURL, 0)
  for (let periodIndex = 0; periodIndex < 2; periodIndex++) {
    await addPeriod(page, { segmentCount: '4', index: periodIndex })
    for (let quarter = 0; quarter < 4; quarter++)
      await addSegment(page, { periodIndex })
  }
  const session = await joinPlayer(browser, appBaseURL, joinUrl, players[0])
  const player = session.page
  const errors: string[] = []
  player.on('pageerror', (error) => errors.push(error.message))
  const ready = player.getByRole('switch', { name: 'Ready', exact: true })
  const progress = player.getByRole('region', { name: 'Game progress' })
  const waiting = player.getByText('Waiting for the instructor to continue.', {
    exact: true,
  })
  const capture = async (state: string) => {
    for (const { name, width, height } of [
      { name: 'reference', width: 784, height: 1694 },
      { name: 'mobile', width: 390, height: 844 },
      { name: 'narrow', width: 320, height: 844 },
    ]) {
      await player.setViewportSize({ width, height })
      await expectNoPageOverflow(player)
      await player.locator('main').evaluate((element) => {
        element.scrollTop = 0
      })
      await expect(ready).toHaveCount(0)
      await expect(waiting).toBeInViewport()
      await player.screenshot({
        path: testInfo.outputPath(`${state}-${name}.png`),
        animations: 'disabled',
      })
      if (width < 600) {
        await player.locator('main').evaluate((element) => {
          element.scrollTop = element.scrollHeight
        })
        await player.screenshot({
          path: testInfo.outputPath(`${state}-${name}-bottom.png`),
          animations: 'disabled',
        })
      }
    }
    await player.setViewportSize({ width: 784, height: 1694 })
  }
  const checkReview = async (status: string) => {
    await expect(progress).toHaveAttribute('data-game-status', status)
    await expect(ready).toHaveCount(0)
    await expect(waiting).toBeVisible()
  }
  try {
    for (let periodIndex = 0; periodIndex < 2; periodIndex++) {
      await advanceGame(page, {
        action: periodIndex === 0 ? 'Start Period' : 'Next Period',
        expectedStatus: 'PREPARATION',
      })
      await expect(progress).toHaveAttribute('data-game-status', 'PREPARATION')
      await expect(ready).toHaveCount(0)
      await expect(waiting).toHaveCount(0)
      for (let quarter = 1; quarter <= 4; quarter++) {
        await advanceGame(page, {
          action: 'Next Segment',
          expectedStatus: 'RUNNING',
        })
        await expect(
          player.getByRole('button', {
            name: 'Submit allocation',
            exact: true,
          })
        ).toBeVisible()
        await expect(ready).toBeDisabled()
        await expect(ready).not.toBeChecked()
        await submitDecision(player, {
          savings: '55',
          bonds: '35',
          stocks: '10',
        })
        const finalQuarter = quarter === 4
        await advanceGame(page, {
          action: finalQuarter ? 'Consolidate' : 'Segment Results',
          expectedStatus: finalQuarter ? 'CONSOLIDATION' : 'PAUSED',
        })
        await expect(
          player.getByTestId(
            finalQuarter ? 'consolidation-results' : 'quarter-results'
          )
        ).toBeVisible()
        await checkReview(finalQuarter ? 'CONSOLIDATION' : 'PAUSED')
        await expect(player.getByTestId('result-total')).toContainText('CHF')
        await expect(player.getByTestId('result-total')).not.toContainText('—')
        await expect(player.getByLabel('No countdown')).toHaveCount(0)
        if (!finalQuarter) {
          await expect(progress).toContainText(
            `${FIRST_GAME_YEAR + periodIndex} · Quarter ${quarter} closed`
          )
        } else {
          await expect(progress).toContainText('Consolidation · held')
          await expect(player.getByTestId('result-total')).toContainText('0.00')
        }
        if (periodIndex === 1 && quarter === 3) {
          await capture('segment-end')
          await player
            .getByRole('link', { name: 'History', exact: true })
            .click()
          await expect(player.getByTestId('history-panel')).toBeVisible()
          await player
            .getByRole('link', { name: 'Decisions', exact: true })
            .click()
          await expect(player.getByTestId('quarter-results')).toBeVisible()
          await checkReview('PAUSED')
        }
        if (periodIndex === 1 && finalQuarter) await capture('consolidation')
      }
      await advanceGame(page, {
        action: 'Period Results',
        expectedStatus: 'RESULTS',
      })
      await expect(player.getByTestId('year-results')).toBeVisible()
      await expect(progress).toContainText(
        `${FIRST_GAME_YEAR + periodIndex} closed`
      )
      await expect(progress).toContainText('All quarters closed')
      await expect(player.getByTestId('result-yearly-assets')).toContainText(
        String(FIRST_GAME_YEAR + periodIndex)
      )
      await checkReview('RESULTS')
      if (periodIndex === 1) {
        // There is no upcoming authored period: the active pointer disconnects.
        await player.reload({ waitUntil: 'domcontentloaded' })
        await expect(player.getByTestId('year-results')).toBeVisible()
        await expect(progress).toContainText(`${FIRST_GAME_YEAR + 1} closed`)
        await expect(player.getByTestId('result-yearly-assets')).toContainText(
          `${FIRST_GAME_YEAR}`
        )
        await checkReview('RESULTS')
        await capture('period-end')
      }
    }
    expect(errors).toEqual([])
  } finally {
    await session.context.close()
  }
})

test('countdown notifications match player notices across tabs and viewport sizes', async ({
  page: admin,
  browser,
  baseURL,
}, testInfo) => {
  const appBaseURL = requireBaseURL(baseURL)
  await createGame(admin, {
    name: `Countdown style ${Date.now()}`,
    playerCount: 1,
  })
  await addPeriod(admin, { segmentCount: '1', index: 0 })
  await addSegment(admin, { periodIndex: 0 })
  const session = await joinPlayer(
    browser,
    appBaseURL,
    await playerJoinUrl(admin, appBaseURL, 0),
    players[0]
  )
  const player = session.page
  try {
    await advanceGame(admin, {
      action: 'Start Period',
      expectedStatus: 'PREPARATION',
    })
    await advanceGame(admin, {
      action: 'Next Segment',
      expectedStatus: 'RUNNING',
    })
    await submitDecision(player, players[0].decisions[0])
    await player.getByRole('switch', { name: 'Ready', exact: true }).click()
    await expect(
      player.getByRole('switch', { name: 'Ready', exact: true })
    ).not.toBeChecked()
    let seconds = 600
    for (const width of [320, 390, 784]) {
      await player.setViewportSize({ width, height: 1000 })
      await player.getByRole('link', { name: 'Decisions', exact: true }).click()
      const allocation = player
        .getByRole('status')
        .filter({ hasText: 'Allocation submitted' })
      const expected = await allocation.evaluate((element) => {
        const style = getComputedStyle(element)
        return {
          backgroundColor: style.backgroundColor,
          borderColor: style.borderColor,
          borderRadius: style.borderRadius,
        }
      })
      for (const tab of ['Decisions', 'Market', 'History', 'Team']) {
        await player.getByRole('link', { name: tab, exact: true }).click()
        await setCountdown(admin, String(seconds++))
        const notification = player
          .getByRole('region', { name: 'Notifications (F8)' })
          .getByRole('status')
          .filter({ hasText: 'Countdown set/updated!' })
        await expect(notification).toBeVisible()
        await expect(notification).toHaveCSS(
          'background-color',
          expected.backgroundColor
        )
        await expect(notification).toHaveCSS(
          'border-color',
          expected.borderColor
        )
        await expect(notification).toHaveCSS(
          'border-radius',
          expected.borderRadius
        )
        await expect(notification.locator('svg.lucide-clock-3')).toBeVisible()
        await expectNoPageOverflow(player)
        await expect(
          notification.getByRole('button', { name: 'Dismiss notification' })
        ).toBeInViewport()
        await expect
          .poll(() =>
            notification.evaluate((element) => {
              const box = element.getBoundingClientRect()
              return (
                box.top >= 0 &&
                box.bottom <= window.innerHeight &&
                box.left >= 0 &&
                box.right <= window.innerWidth
              )
            })
          )
          .toBe(true)
        if (tab === 'Team')
          await player.screenshot({
            animations: 'disabled',
            path: testInfo.outputPath(`countdown-${width}.png`),
          })
        await notification
          .getByRole('button', { name: 'Dismiss notification' })
          .click()
        await expect(notification).toBeHidden()
      }
    }
    // GraphQL must reject the removed configurable month count.
    const response = await admin.request.post('/api/graphql', {
      data: {
        query:
          'mutation($facts: PeriodFactsInput!) { addGamePeriod(gameId: -1, segmentCount: 1, facts: $facts) { id } }',
        variables: { facts: { rollsPerSegment: 5 } },
      },
    })
    expect(JSON.stringify((await response.json()).errors)).toContain(
      'rollsPerSegment'
    )
  } finally {
    await session.context.close()
  }
})

test('Decisions forecast matches Market and handles unavailable scenarios', async ({
  page: admin,
  browser,
  baseURL,
}, testInfo) => {
  const appBaseURL = requireBaseURL(baseURL)
  await createGame(admin, {
    name: `Decisions forecast ${Date.now()}`,
    playerCount: 1,
  })
  await addPeriod(admin, {
    segmentCount: '1',
    index: 0,
    scenario: {
      trendBonds: '-0.01',
      gapBonds: '0.001',
      trendStocks: '0.02',
      gapStocks: '0.01',
    },
  })
  await addSegment(admin, { periodIndex: 0 })
  const session = await joinPlayer(
    browser,
    appBaseURL,
    await playerJoinUrl(admin, appBaseURL, 0),
    players[0]
  )
  const player = session.page
  try {
    await expect(player.getByTestId('ready-switch')).toHaveCount(0)
    await advanceGame(admin, {
      action: 'Start Period',
      expectedStatus: 'PREPARATION',
    })
    await advanceGame(admin, {
      action: 'Next Segment',
      expectedStatus: 'RUNNING',
    })
    await player.goto(`${appBaseURL}/play/cockpit?tab=cockpit`)
    await expect(
      player.getByRole('link', { name: 'Decisions', exact: true })
    ).toHaveAttribute('aria-current', 'page')
    const forecast = player.getByRole('region', {
      name: 'Market outlook',
      exact: true,
    })
    await expect(forecast.getByRole('link')).toHaveCount(0)
    const fixtures = [
      { asset: 'Bonds', values: ['-1.00%', '0.10%', '0.48%'] },
      { asset: 'Stocks', values: ['+2.00%', '1.00%', '4.83%'] },
    ]
    for (const { asset, values } of fixtures)
      await expect(
        forecast
          .getByRole('region', { name: `${asset} forecast` })
          .locator('dd')
      ).toHaveText(values)
    for (const width of [784, 390, 320]) {
      await player.setViewportSize({ width, height: 1024 })
      await forecast.scrollIntoViewIfNeeded()
      await expectNoPageOverflow(player)
      await expect(forecast).toBeInViewport()
      await capturePlayerScreenshot(player, {
        path: testInfo.outputPath(`decisions-forecast-${width}.png`),
      })
    }
    await player.getByRole('link', { name: 'Market', exact: true }).click()
    for (const { asset, values } of fixtures)
      await expect(
        player.getByTestId(`market-${asset.toLowerCase()}`).locator('strong')
      ).toHaveText(values)
    await player.getByRole('link', { name: 'Decisions', exact: true }).click()
    await expect(player).toHaveURL(/tab=cockpit/)
    await submitDecision(player, { savings: '55', bonds: '35', stocks: '10' })
    await expect(forecast).toHaveCount(0)
    await player.getByRole('switch', { name: 'Ready', exact: true }).click()
    await expect(forecast).toHaveCount(0)
    await player.getByRole('button', { name: 'Change allocation' }).click()
    await expect(forecast).toBeVisible()
    // Zero gap is readable legacy data but cannot be authored in the admin UI.
    // Exercise it and invalid/missing scenarios without changing the game.
    for (const scenario of [
      {
        trendBonds: -0.01,
        gapBonds: 0,
        trendStocks: 0.02,
        gapStocks: 0.01,
        interestBank: 0.001,
      },
      null,
      { trendBonds: 0, gapBonds: -1 },
    ]) {
      const overrideScenario = async (
        route: import('@playwright/test').Route
      ) => {
        if (route.request().postDataJSON()?.operationName !== 'Result')
          return route.fallback()
        const response = await route.fetch()
        const json = await response.json()
        json.data.result.currentGame.activePeriod.facts.scenario = scenario
        await route.fulfill({ response, json })
      }
      await player.route('**/api/graphql', overrideScenario)
      await player.reload({ waitUntil: 'domcontentloaded' })
      await player.getByRole('button', { name: 'Change allocation' }).click()
      if (scenario?.gapBonds === 0) {
        await expect(
          forecast.getByRole('region', { name: 'Bonds forecast' }).locator('dd')
        ).toHaveText(['-1.00%', '0.00%', '0.00%'])
      } else {
        await expect(
          forecast.getByText('Market outlook is not available yet.')
        ).toBeVisible()
        await expect(forecast.locator('dd')).toHaveCount(0)
      }
      await player.unroute('**/api/graphql', overrideScenario)
    }
  } finally {
    await session.context.close()
  }
})

test('Ready countdown reminders stop during review while timers remain visible', async ({
  page: admin,
  browser,
  baseURL,
}) => {
  const appBaseURL = requireBaseURL(baseURL)
  await createGame(admin, {
    name: `Review countdown ${Date.now()}`,
    playerCount: 1,
  })
  await addPeriod(admin, { segmentCount: '2', index: 0 })
  await addSegment(admin, { periodIndex: 0 })
  await addSegment(admin, { periodIndex: 0 })
  const session = await joinPlayer(
    browser,
    appBaseURL,
    await playerJoinUrl(admin, appBaseURL, 0),
    players[0]
  )
  try {
    await advanceGame(admin, {
      action: 'Start Period',
      expectedStatus: 'PREPARATION',
    })
    await advanceGame(admin, {
      action: 'Next Segment',
      expectedStatus: 'RUNNING',
    })
    await setCountdown(admin, '300')
    const player = await session.context.newPage()
    await player.clock.install()
    await player.goto(`${appBaseURL}/play/cockpit`)
    const notices = player
      .getByRole('region', { name: 'Notifications (F8)' })
      .getByRole('status')
      .filter({ hasText: /Countdown (set\/updated!|Update)/ })
    await expect(notices).toContainText('Countdown set/updated!')
    await notices.getByRole('button', { name: 'Dismiss notification' }).click()
    await player.clock.fastForward(130_000)
    await expect(notices).toContainText(
      'Less than 3 min remaining! Please press ready.'
    )
    await notices.getByRole('button', { name: 'Dismiss notification' }).click()
    await advanceGame(admin, {
      action: 'Segment Results',
      expectedStatus: 'PAUSED',
    })
    await expect(player.getByTestId('quarter-results')).toBeVisible()
    await player.clock.fastForward(120_000)
    await expect(player.getByTestId('countdown')).toBeVisible()
    await expect(notices).toHaveCount(0)
    await player.close()
    for (const status of ['PAUSED', 'CONSOLIDATION', 'RESULTS']) {
      if (status === 'CONSOLIDATION') {
        await advanceGame(admin, {
          action: 'Next Segment',
          expectedStatus: 'RUNNING',
        })
        await advanceGame(admin, {
          action: 'Consolidate',
          expectedStatus: 'CONSOLIDATION',
        })
      }
      if (status !== 'RESULTS') await setCountdown(admin, '300')
      else
        await advanceGame(admin, {
          action: 'Period Results',
          expectedStatus: 'RESULTS',
        })
      const review = await session.context.newPage()
      await review.clock.install()
      await review.goto(`${appBaseURL}/play/cockpit`)
      await expect(
        review.getByText('Waiting for the instructor to continue.', {
          exact: true,
        })
      ).toBeVisible()
      await expect(
        review.getByRole('switch', { name: 'Ready', exact: true })
      ).toHaveCount(0)
      if (status !== 'RESULTS')
        await expect(review.getByTestId('countdown')).toBeVisible()
      await review.clock.fastForward(250_000)
      await expect(
        review
          .getByRole('region', { name: 'Notifications (F8)' })
          .getByRole('status')
          .filter({ hasText: /Please press ready/ })
      ).toHaveCount(0)
      await review.close()
    }
  } finally {
    await session.context.close()
  }
})
