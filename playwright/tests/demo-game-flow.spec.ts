import {
  expect,
  test,
  type Browser,
  type BrowserContext,
  type Locator,
  type Page,
} from '@playwright/test'

import { expectGameStatus } from './support/waits'

const decisions = {
  playerOne: { savings: '40', bonds: '30', stocks: '30' },
  playerTwo: { savings: '20', bonds: '40', stocks: '40' },
}

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

async function createGame(page: Page, name: string) {
  await page.goto('/admin/games')
  await input(page, 'name').fill(name)
  await input(page, 'playerCount').fill('2')
  await page.getByRole('button', { name: 'Create Game' }).click()
  await page.getByRole('link', { name: new RegExp(name) }).click()
  await expect(page.getByTestId('game-detail')).toBeVisible()
}

async function addPeriod(
  page: Page,
  name: string,
  segmentCount: string,
  index: number
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

async function addSegment(page: Page, index: number) {
  await page.getByRole('button', { name: 'Add segment' }).click()
  await page.getByRole('button', { name: 'Submit' }).click()
  await expect(page.getByTestId(`period-0-segment-${index}`)).toBeVisible()
}

async function joinPlayer(
  browser: Browser,
  baseURL: string,
  joinUrl: string,
  playerName: string
): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({
    baseURL,
    ignoreHTTPSErrors: true,
  })
  const page = await context.newPage()

  await page.goto(joinUrl)
  await page.waitForURL('**/play/welcome')
  await input(page, 'name').fill(playerName)
  await page.getByRole('button', { name: 'Start Game' }).click()
  await page.waitForURL('**/play/cockpit')

  return { context, page }
}

async function submitDecision(
  page: Page,
  values: { savings: string; bonds: string; stocks: string }
) {
  // FormikNumberField currently renders visible labels without accessible names.
  const fields = page.getByRole('textbox')
  await fields.nth(0).fill(values.savings)
  await fields.nth(1).fill(values.bonds)
  await fields.nth(2).fill(values.stocks)
  await page.getByRole('button', { name: 'Submit' }).click()
  await page.getByTestId('ready-switch').click()
}

async function runSegment(
  adminPage: Page,
  playerOnePage: Page,
  playerTwoPage: Page,
  adminAction: string,
  expectedStatusAfterAdvance: string
) {
  await Promise.all([playerOnePage.reload(), playerTwoPage.reload()])
  await Promise.all([
    expect(playerOnePage.getByRole('button', { name: 'Submit' })).toBeVisible(),
    expect(playerTwoPage.getByRole('button', { name: 'Submit' })).toBeVisible(),
  ])

  await Promise.all([
    submitDecision(playerOnePage, decisions.playerOne),
    submitDecision(playerTwoPage, decisions.playerTwo),
  ])
  await adminPage.getByRole('button', { name: adminAction }).click()
  await expectGameStatus(adminPage, expectedStatusAfterAdvance)
}

test('admin and players complete demo-game flow', async ({
  page,
  browser,
  baseURL,
}) => {
  const appBaseURL = requireBaseURL(baseURL)

  const gameName = `Playwright demo ${Date.now()}`

  await createGame(page, gameName)
  await addPeriod(page, 'Period 1', '2', 0)
  await addSegment(page, 0)
  await addSegment(page, 1)
  await addPeriod(page, 'Period 2', '1', 1)

  const playerSessions: Array<{ context: BrowserContext }> = []

  try {
    const playerOne = await joinPlayer(
      browser,
      appBaseURL,
      await playerJoinUrl(page, appBaseURL, 0),
      'Playwright Bank One'
    )
    playerSessions.push(playerOne)

    const playerTwo = await joinPlayer(
      browser,
      appBaseURL,
      await playerJoinUrl(page, appBaseURL, 1),
      'Playwright Bank Two'
    )
    playerSessions.push(playerTwo)

    await page.getByRole('button', { name: 'Start Period' }).click()
    await expectGameStatus(page, 'PREPARATION')
    await page.getByRole('button', { name: 'Next Segment' }).click()
    await expectGameStatus(page, 'RUNNING')

    await runSegment(
      page,
      playerOne.page,
      playerTwo.page,
      'Segment Results',
      'PAUSED'
    )

    await page.getByRole('button', { name: 'Next Segment' }).click()
    await expectGameStatus(page, 'RUNNING')

    await runSegment(
      page,
      playerOne.page,
      playerTwo.page,
      'Consolidate',
      'CONSOLIDATION'
    )

    await page.getByRole('button', { name: 'Period Results' }).click()
    await expectGameStatus(page, 'RESULTS')

    const [reportPage] = await Promise.all([
      page.waitForEvent('popup'),
      page.getByRole('button', { name: 'Report' }).click(),
    ])
    await expect(reportPage.getByTestId('report-loaded')).toBeVisible({
      timeout: 30_000,
    })
    await expect(
      reportPage.getByRole('columnheader', { name: 'Playwright Bank One' })
    ).toBeVisible()
    await expect(
      reportPage.getByRole('columnheader', { name: 'Playwright Bank Two' })
    ).toBeVisible()
  } finally {
    await Promise.all(playerSessions.map(({ context }) => context.close()))
  }
})
