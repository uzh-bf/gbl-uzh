import {
  expect,
  test,
  type Browser,
  type BrowserContext,
  type Locator,
  type Page,
} from '@playwright/test'

import { expectGameStatusEventually } from './support/waits'

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
      { savings: '40', bonds: '30', stocks: '30' },
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

function absoluteUrl(baseURL: string, href: string) {
  return new URL(href, baseURL).toString()
}

function requireBaseURL(baseURL: string | undefined) {
  if (!baseURL) {
    throw new Error('baseURL is required for player join links')
  }

  return baseURL
}

function input(scope: Locator | Page, name: string) {
  return scope.locator(`input[name="${name}"]`)
}

async function playerJoinUrl(page: Page, baseURL: string, index: number) {
  const href = await page
    .getByTestId(`player-${index}`)
    .getByTestId('player-login-link')
    .getAttribute('href')

  if (!href) {
    throw new Error(`Missing player ${index} join link`)
  }

  return absoluteUrl(baseURL, href)
}

async function createGame(
  page: Page,
  { name, playerCount }: { name: string; playerCount: number }
) {
  await page.goto('/admin/games')
  await input(page, 'name').fill(name)
  await input(page, 'playerCount').fill(String(playerCount))
  await page.getByRole('button', { name: 'Create Game' }).click()
  await page.getByRole('link', { name: new RegExp(name) }).click()
  await expect(page.getByTestId('game-detail')).toBeVisible()
}

async function addPeriod(
  page: Page,
  {
    name,
    segmentCount,
    index,
  }: { name: string; segmentCount: string; index: number }
) {
  await page.getByRole('button', { name: 'Add period' }).click()
  const dialog = page.getByRole('dialog', { name: 'Add Period' })
  const fields = dialog.getByRole('textbox')
  await input(dialog, 'periodName').fill(name)
  // FormikNumberField currently renders visible labels without accessible names.
  await fields.nth(1).fill(segmentCount)
  await dialog.getByRole('button', { name: 'Submit' }).click()
  await expect(page.getByTestId(`period-${index}`)).toBeVisible()
}

async function addSegment(page: Page, { periodIndex }: { periodIndex: number }) {
  const segmentIndex = await page
    .getByTestId(`period-${periodIndex}`)
    .locator('a[href*="/admin/dice/"]')
    .count()

  await page.getByRole('button', { name: 'Add segment' }).click()
  await page.getByRole('button', { name: 'Submit' }).click()
  const segment = page.getByTestId(`period-${periodIndex}-segment-${segmentIndex}`)
  await expect(segment.locator('a[href*="/admin/dice/"]')).toBeVisible()
}

async function joinPlayer(
  browser: Browser,
  baseURL: string,
  joinUrl: string,
  plan: PlayerPlan
): Promise<PlayerSession> {
  const context = await browser.newContext({
    baseURL,
    ignoreHTTPSErrors: true,
  })
  const page = await context.newPage()

  await page.goto(joinUrl)
  await page.waitForURL('**/play/welcome')
  await input(page, 'name').fill(plan.name)
  await Promise.all([
    page.waitForURL('**/play/cockpit'),
    page.getByRole('button', { name: 'Start Game' }).click(),
  ])

  return { context, page, plan }
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

async function submitDecision(page: Page, values: DecisionValues) {
  // FormikNumberField currently renders visible labels without accessible names.
  const fields = page.getByRole('textbox')
  const submitButton = page.getByRole('button', { name: 'Submit' })
  await fields.nth(0).fill(values.savings)
  await fields.nth(1).fill(values.bonds)
  await fields.nth(2).fill(values.stocks)
  await submitButton.click()
  await expect(submitButton).toBeEnabled()
  await expect(page.getByTestId('ready-switch')).toBeVisible()
  await page.getByTestId('ready-switch').click()
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
  await button.click()
  await expectGameStatusEventually(page, expectedStatus)
}

async function assertPlayerDecisionForm(sessions: PlayerSession[]) {
  await Promise.all(sessions.map(({ page }) => page.reload()))
  await Promise.all(
    sessions.map(({ page }) =>
      expect(page.getByRole('button', { name: 'Submit' })).toBeVisible()
    )
  )
}

async function assertPlayerPortfolio(page: Page) {
  await expect(page.getByText('Assets Overview').first()).toBeVisible()
  await expect(page.getByText('Savings').first()).toBeVisible()
  await expect(page.getByText('Bonds').first()).toBeVisible()
  await expect(page.getByText('Stocks').first()).toBeVisible()
  await expect(page.getByText('Total').first()).toBeVisible()
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

  await Promise.all(
    sessions.map(({ page, plan }) =>
      submitDecision(page, plan.decisions[segmentIndex])
    )
  )

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
    page.waitForEvent('popup'),
    diceLink.click(),
  ])

  try {
    await expect(dicePage.getByText('1. Month')).toBeVisible()
    await expect(dicePage.getByText('2. Month')).toBeVisible()
    await expect(dicePage.getByText('3. Month')).toBeVisible()
    await expect(dicePage.getByRole('button', { name: 'Roll' })).toHaveCount(3)
  } finally {
    await dicePage.close()
  }
}

async function assertFinalReport(page: Page, playerPlans: PlayerPlan[]) {
  const [reportPage] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByRole('button', { name: 'Report' }).click(),
  ])

  try {
    await expect(reportPage.getByTestId('report-loaded')).toBeVisible({
      timeout: 30_000,
    })

    for (const { name } of playerPlans) {
      await expect(
        reportPage.getByRole('columnheader', { name })
      ).toBeVisible()
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

test('admin and players complete multi-team multi-period demo-game flow', async ({
  page,
  browser,
  baseURL,
}) => {
  const appBaseURL = requireBaseURL(baseURL)
  const gameName = `Playwright breadth ${Date.now()}`

  await createGame(page, { name: gameName, playerCount: players.length })
  await expect(page.getByRole('button', { name: 'Start Period' })).toBeDisabled()

  const joinUrls = await assertUniqueJoinUrls(page, appBaseURL, players.length)

  await addPeriod(page, { name: 'Period 1', segmentCount: '2', index: 0 })
  await expect(page.getByRole('button', { name: 'Start Period' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Add period' })).toBeDisabled()
  await addSegment(page, { periodIndex: 0 })
  await expect(page.getByRole('button', { name: 'Add period' })).toBeDisabled()
  await addSegment(page, { periodIndex: 0 })
  await expect(page.getByRole('button', { name: 'Add segment' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Add period' })).toBeEnabled()

  await assertDicePage(page)

  await addPeriod(page, { name: 'Period 2', segmentCount: '2', index: 1 })
  await expect(page.getByRole('button', { name: 'Add period' })).toBeDisabled()
  await addSegment(page, { periodIndex: 1 })
  await expect(page.getByRole('button', { name: 'Add period' })).toBeDisabled()
  await addSegment(page, { periodIndex: 1 })
  await expect(page.getByRole('button', { name: 'Add segment' })).toBeDisabled()
  // TODO: remove sentinel when final-period consolidation no longer connects
  // the next period.
  await addPeriod(page, { name: 'Period 3', segmentCount: '1', index: 2 })

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
