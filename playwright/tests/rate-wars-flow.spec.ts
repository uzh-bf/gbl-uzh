import {
  expect,
  test,
  type Browser,
  type BrowserContext,
  type Locator,
  type Page,
} from '@playwright/test'

import { expectGameStatusEventually } from './support/waits'

// Rate Wars lifecycle spec. Run it against the rate-wars app on
// PLAYWRIGHT_BASE_URL (starter mode: http://localhost:3000). The demo-game
// spec expects the demo app — run one or the other, depending on which app
// the stack is serving.
test.setTimeout(300_000)

type RateDecision = {
  depositRate: string
  loanRate: string
}

type PlayerPlan = {
  name: string
  decisions: RateDecision[]
}

type PlayerSession = {
  context: BrowserContext
  page: Page
  plan: PlayerPlan
}

const players: PlayerPlan[] = [
  {
    name: 'PW Alpenbank',
    decisions: [
      { depositRate: '2', loanRate: '4' },
      { depositRate: '3.5', loanRate: '6' },
    ],
  },
  {
    name: 'PW Leman Bank',
    decisions: [
      { depositRate: '1', loanRate: '5' },
      { depositRate: '1.5', loanRate: '5.5' },
    ],
  },
  {
    name: 'PW Gotthard',
    decisions: [
      { depositRate: '1', loanRate: '4' },
      { depositRate: '2', loanRate: '5' },
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
  await page.waitForURL('**/admin/games/*')
  // dev-mode first compile of the detail page can exceed the default expect
  // timeout
  await expect(page.getByTestId('game-detail')).toBeVisible({
    timeout: 30_000,
  })
}

async function addYear(
  page: Page,
  {
    name,
    index,
    centralBankRate,
    seed,
  }: { name: string; index: number; centralBankRate?: string; seed?: string }
) {
  await page.getByRole('button', { name: 'Add period' }).click()
  const dialog = page.getByRole('dialog', { name: 'Add Year' })
  const fields = dialog.getByRole('textbox')
  await input(dialog, 'periodName').fill(name)
  // FormikNumberField renders visible labels without accessible names, so the
  // tunables are addressed positionally: 1 = decision rounds, 2 = CB rate,
  // 3 = seed (see the Add Year dialog field order).
  await fields.nth(1).fill('1')
  if (centralBankRate) {
    await fields.nth(2).fill(centralBankRate)
  }
  if (seed) {
    await fields.nth(3).fill(seed)
  }
  await dialog.getByRole('button', { name: 'Submit' }).click()
  await expect(page.getByTestId(`period-${index}`)).toBeVisible()
}

async function addDecisionRound(
  page: Page,
  { periodIndex }: { periodIndex: number }
) {
  await page.getByRole('button', { name: 'Add segment' }).click()
  const dialog = page.getByRole('dialog', { name: 'Add Decision Round' })
  await dialog.getByRole('button', { name: 'Submit' }).click()
  // segment facts are precomputed at authoring time — the card shows the
  // realized default rate as soon as the segment exists
  await expect(
    page
      .getByTestId(`period-${periodIndex}-segment-0`)
      .getByText('Realized default:')
  ).toBeVisible()
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

async function submitRates(page: Page, values: RateDecision) {
  await expect(page.getByText('Set your rates')).toBeVisible()
  // FormikNumberField renders visible labels without accessible names; the
  // RUNNING view has exactly two textboxes: deposit rate, then loan rate.
  const fields = page.getByRole('textbox')
  const submitButton = page.getByRole('button', { name: 'Submit rates' })
  await fields.nth(0).fill(values.depositRate)
  await fields.nth(1).fill(values.loanRate)
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
  // The status poll reloads the page. Wait for the tRPC mutation response
  // first so that reload cannot abort a just-dispatched client request.
  const procedure =
    action === 'Next Segment'
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

async function assertRateForm(sessions: PlayerSession[]) {
  await Promise.all(sessions.map(({ page }) => page.reload()))
  await Promise.all(
    sessions.map(({ page }) =>
      expect(
        page.getByRole('button', { name: 'Submit rates' })
      ).toBeVisible()
    )
  )
}

async function assertLeaderboard(
  page: Page,
  { year, self }: { year: number; self: string }
) {
  // the design-system Card does not forward data-cy, so anchor on the
  // headline text instead of a test id. Give each reload time to hydrate and
  // run the aggregate query before deciding it failed (dev server is slow).
  await expect
    .poll(
      async () => {
        await page.reload()
        return page
          .getByText(`Leaderboard — Year ${year}`)
          .waitFor({ state: 'visible', timeout: 10_000 })
          .then(() => true)
          .catch(() => false)
      },
      {
        intervals: [500, 1_000],
        timeout: 60_000,
      }
    )
    .toBe(true)

  await expect(page.getByText(`${self} (you)`)).toBeVisible()
  await expect(page.getByText('Your income statement')).toBeVisible()
  await expect(page.getByText('Interest income from loans')).toBeVisible()
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

async function runYear(
  adminPage: Page,
  sessions: PlayerSession[],
  { yearIndex }: { yearIndex: number }
) {
  await assertRateForm(sessions)

  // sequential submissions: concurrent writes can hit Postgres serializable
  // transaction conflicts without adding coverage
  for (const { page, plan } of sessions) {
    await submitRates(page, plan.decisions[yearIndex])
  }

  // one decision round per year: RUNNING consolidates directly
  await advanceGame(adminPage, {
    action: 'Consolidate',
    expectedStatus: 'CONSOLIDATION',
  })

  await sessions[0].page.reload()
  await expect(sessions[0].page.getByText('Rates locked')).toBeVisible()

  await advanceGame(adminPage, {
    action: 'Period Results',
    expectedStatus: 'RESULTS',
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

async function assertAdminReport(page: Page, playerPlans: PlayerPlan[]) {
  const [reportPage] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByRole('button', { name: 'Report' }).click(),
  ])

  try {
    await expect(reportPage.getByText('Standings')).toBeVisible({
      timeout: 30_000,
    })
    for (const { name } of playerPlans) {
      await expect(reportPage.getByText(name).first()).toBeVisible()
    }
    await expect(
      reportPage.getByText('Equity per bank over the years')
    ).toBeVisible()
  } finally {
    await reportPage.close()
  }
}

test('admin and three banks play two Rate Wars years end to end', async ({
  page,
  browser,
  baseURL,
}) => {
  const appBaseURL = requireBaseURL(baseURL)
  const gameName = `Rate Wars e2e ${Date.now()}`

  await createGame(page, { name: gameName, playerCount: players.length })
  await expect(page.getByRole('button', { name: 'Start Period' })).toBeDisabled()

  const joinUrls = await assertUniqueJoinUrls(page, appBaseURL, players.length)

  await addYear(page, { name: 'Year 1', index: 0 })
  await addDecisionRound(page, { periodIndex: 0 })
  // rate-hike scenario for year 2, different seed for a different shock
  await addYear(page, { name: 'Year 2', index: 1, centralBankRate: '4.5', seed: '7' })
  await addDecisionRound(page, { periodIndex: 1 })
  // NOTE: no sentinel period — final-period consolidation is expected to work
  // (GameService disconnects the pointer instead of connecting a missing
  // period record).

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

    await runYear(page, playerSessions, { yearIndex: 0 })
    await assertLeaderboard(playerSessions[0].page, {
      year: 1,
      self: players[0].name,
    })

    await advanceGame(page, {
      action: 'Next Period',
      expectedStatus: 'PREPARATION',
    })
    await advanceGame(page, {
      action: 'Next Segment',
      expectedStatus: 'RUNNING',
    })

    await runYear(page, playerSessions, { yearIndex: 1 })
    // final year: the game must land in RESULTS without a sentinel period
    await assertLeaderboard(playerSessions[0].page, {
      year: 2,
      self: players[0].name,
    })
    await assertLeaderboard(playerSessions[1].page, {
      year: 2,
      self: players[1].name,
    })

    await assertAdminReport(page, players)
  } finally {
    await Promise.all(playerSessions.map(({ context }) => context.close()))
  }
})
