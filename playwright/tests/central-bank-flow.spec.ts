import {
  expect,
  test,
  type Browser,
  type BrowserContext,
  type Locator,
  type Page,
} from '@playwright/test'

import { expectGameStatusEventually } from './support/waits'

test.setTimeout(300_000)

type DecisionValues = {
  rate: string
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
    name: 'Gov Team Hawk',
    decisions: [{ rate: '6.0' }, { rate: '5.5' }],
  },
  {
    name: 'Gov Team Dove',
    decisions: [{ rate: '3.0' }, { rate: '3.5' }],
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
  await expect(page.getByTestId('game-detail')).toBeVisible({
    timeout: 30_000,
  })
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
  // FormikNumberField renders textboxes
  await fields.nth(1).fill(segmentCount)
  await dialog.getByRole('button', { name: 'Submit' }).click()
  await expect(page.getByTestId(`period-${index}`)).toBeVisible()
}

async function addSegment(
  page: Page,
  { periodIndex }: { periodIndex: number }
) {
  const segmentIndex = await page
    .getByTestId(`period-${periodIndex}`)
    .locator('text=Roll:')
    .count()

  await page.getByRole('button', { name: 'Add segment' }).click()
  await page.getByRole('button', { name: 'Submit' }).click()
  const segment = page.getByTestId(
    `period-${periodIndex}-segment-${segmentIndex}`
  )
  await expect(segment.locator('text=Roll:')).toBeVisible()
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
    page.waitForURL('**/play/cockpit', { waitUntil: 'domcontentloaded' }),
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
  const rateInput = page.getByPlaceholder('e.g. 4.0')
  await expect(rateInput).toBeVisible()
  await rateInput.fill(values.rate)
  const submitButton = page.getByRole('button', { name: 'Submit Policy Rate' })
  const [response] = await Promise.all([
    page.waitForResponse(
      (candidate) =>
        candidate.request().method() === 'POST' &&
        candidate.url().includes('/api/trpc/play.performAction')
    ),
    submitButton.click(),
  ])
  expect(response.ok()).toBe(true)
  await expect(submitButton).toBeEnabled()

  const readySwitch = page.getByTestId('ready-switch').getByRole('switch')
  await expect(readySwitch).toBeVisible()
  await readySwitch.click()
  await expect(readySwitch).toBeChecked()
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
  // The status poll reloads the page. Wait for the tRPC mutation response
  // first so that reload cannot abort a just-dispatched client request.
  const procedure =
    action === 'Next Segment' || action === 'Segment Results'
      ? 'game.activateNextSegment'
      : 'game.activateNextPeriod'
  const [response] = await Promise.all([
    page.waitForResponse(
      (candidate) =>
        candidate.request().method() === 'POST' &&
        candidate.url().includes(`/api/trpc/${procedure}`)
    ),
    button.click(),
  ])
  expect(response.ok()).toBe(true)
  await expectGameStatusEventually(page, expectedStatus)
}

async function setCountdown(page: Page, seconds: string) {
  await page.getByTestId('countdown-seconds').getByRole('textbox').fill(seconds)
  await page.getByRole('button', { name: 'Set Countdown' }).click()
}

async function assertCountdownVisible(page: Page) {
  // Do not reload: this assertion proves that the already-connected player
  // receives the SSE event and invalidates play.result after the admin update.
  await expect(page.getByTestId('countdown')).toBeVisible({ timeout: 60_000 })
}

async function assertPlayerDecisionForm(sessions: PlayerSession[]) {
  await Promise.all(sessions.map(({ page }) => page.reload()))
  await Promise.all(
    sessions.map(({ page }) =>
      expect(
        page.getByRole('button', { name: 'Submit Policy Rate' })
      ).toBeVisible()
    )
  )
}

async function assertPlayerDashboard(page: Page) {
  await expect(page.getByText('Current Inflation').first()).toBeVisible()
  await expect(page.getByText('Unemployment').first()).toBeVisible()
  await expect(page.getByText('GDP Growth').first()).toBeVisible()
  await expect(page.getByText('Cumulative Loss').first()).toBeVisible()
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
  await assertPlayerDashboard(sessions[0].page)

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

test('admin and players complete central-bank flow', async ({
  page,
  browser,
  baseURL,
}) => {
  const appBaseURL = requireBaseURL(baseURL)
  const gameName = `Central Bank Test ${Date.now()}`

  await createGame(page, { name: gameName, playerCount: players.length })
  await expect(
    page.getByRole('button', { name: 'Start Period' })
  ).toBeDisabled()

  const joinUrls = await assertUniqueJoinUrls(page, appBaseURL, players.length)

  // Add Period 1 with 2 segments
  await addPeriod(page, { name: 'Period 1', segmentCount: '2', index: 0 })
  await expect(page.getByRole('button', { name: 'Add period' })).toBeDisabled()
  await addSegment(page, { periodIndex: 0 })
  await addSegment(page, { periodIndex: 0 })

  // Add Period 2 (sentinel period as required by GBL platform for CONSOLIDATION -> RESULTS transition)
  await addPeriod(page, {
    name: 'Period 2 (Sentinel)',
    segmentCount: '1',
    index: 1,
  })

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

    // Segment 0
    await runSegment(page, playerSessions, {
      segmentIndex: 0,
      adminAction: 'Segment Results',
      expectedStatus: 'PAUSED',
    })

    // Segment 1
    await advanceGame(page, {
      action: 'Next Segment',
      expectedStatus: 'RUNNING',
    })
    await runSegment(page, playerSessions, {
      segmentIndex: 1,
      adminAction: 'Consolidate',
      expectedStatus: 'CONSOLIDATION',
    })

    // Period results
    await advanceGame(page, {
      action: 'Period Results',
      expectedStatus: 'RESULTS',
    })

    // Verify leaderboard on player cockpit
    await expect(
      playerSessions[0].page.getByText('Leaderboard').first()
    ).toBeVisible()
  } finally {
    await Promise.all(playerSessions.map(({ context }) => context.close()))
  }
})
