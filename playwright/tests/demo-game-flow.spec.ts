import { expect, test, type Browser, type Page } from '@playwright/test'

import { expectGameStatus } from './support/waits'

const decisions = {
  playerOne: { savings: '40', bonds: '30', stocks: '30' },
  playerTwo: { savings: '20', bonds: '40', stocks: '40' },
}

function absoluteUrl(baseURL: string, href: string) {
  return new URL(href, baseURL).toString()
}

async function createGame(page: Page, name: string) {
  await page.goto('/admin/games')
  await page.getByTestId('game-name').fill(name)
  await page.getByTestId('game-player-count').fill('2')
  await page.getByTestId('create-game').click()
  await page.getByRole('link', { name: new RegExp(name) }).click()
  await expect(page.getByTestId('game-detail')).toBeVisible()
}

async function addPeriod(page: Page) {
  await page.getByTestId('add-period').click()
  await page.getByTestId('period-name').fill('Period 1')
  await page.getByTestId('segment-count').fill('2')
  await page.getByRole('button', { name: 'Submit' }).click()
  await expect(page.getByTestId('period-0')).toBeVisible()
}

async function addSegment(page: Page, index: number) {
  await page.getByTestId('add-segment').click()
  await page.getByRole('button', { name: 'Submit' }).click()
  await expect(page.getByTestId(`period-0-segment-${index}`)).toBeVisible()
}

async function joinPlayer(
  browser: Browser,
  baseURL: string,
  joinUrl: string,
  playerName: string
) {
  const context = await browser.newContext({
    baseURL,
    ignoreHTTPSErrors: true,
  })
  const page = await context.newPage()

  await page.goto(joinUrl)
  await page.waitForURL('**/play/welcome')
  await page.getByTestId('player-name').fill(playerName)
  await page.getByTestId('welcome-start').click()
  await page.waitForURL('**/play/cockpit')
  await expect(page.getByTestId('ready-switch')).toBeVisible()

  return { context, page }
}

async function submitDecision(
  page: Page,
  values: { savings: string; bonds: string; stocks: string }
) {
  await page.getByTestId('Savings-cy').fill(values.savings)
  await page.getByTestId('Bonds-cy').fill(values.bonds)
  await page.getByTestId('Stocks-cy').fill(values.stocks)
  await page.getByTestId('decision-submit').click()
  await page.getByTestId('ready-switch').click()
}

async function runSegment(
  adminPage: Page,
  playerOnePage: Page,
  playerTwoPage: Page,
  expectedStatusAfterAdvance: string
) {
  await playerOnePage.reload()
  await playerTwoPage.reload()
  await expect(playerOnePage.getByTestId('decision-submit')).toBeVisible()
  await expect(playerTwoPage.getByTestId('decision-submit')).toBeVisible()

  await submitDecision(playerOnePage, decisions.playerOne)
  await submitDecision(playerTwoPage, decisions.playerTwo)
  await adminPage.reload()
  await expect(
    adminPage.getByTestId('player-0').getByTestId('player-ready-state')
  ).toBeVisible()
  await expect(
    adminPage.getByTestId('player-1').getByTestId('player-ready-state')
  ).toBeVisible()
  await adminPage.getByTestId('admin-state-action').click()
  await expectGameStatus(adminPage, expectedStatusAfterAdvance)
}

test('admin and players complete demo-game flow', async ({
  page,
  browser,
  baseURL,
}) => {
  test.skip(!baseURL, 'baseURL is required for player join links')
  const appBaseURL = baseURL as string

  const gameName = `Playwright demo ${Date.now()}`

  await createGame(page, gameName)
  await addPeriod(page)
  await addSegment(page, 0)
  await addSegment(page, 1)

  const playerOneHref = await page
    .getByTestId('player-0')
    .getByTestId('player-login-link')
    .getAttribute('href')
  const playerTwoHref = await page
    .getByTestId('player-1')
    .getByTestId('player-login-link')
    .getAttribute('href')

  expect(playerOneHref).toBeTruthy()
  expect(playerTwoHref).toBeTruthy()

  const playerOne = await joinPlayer(
    browser,
    appBaseURL,
    absoluteUrl(appBaseURL, playerOneHref as string),
    'Playwright Bank One'
  )
  const playerTwo = await joinPlayer(
    browser,
    appBaseURL,
    absoluteUrl(appBaseURL, playerTwoHref as string),
    'Playwright Bank Two'
  )

  await page.getByTestId('admin-state-action').click()
  await expectGameStatus(page, 'PREPARATION')
  await page.getByTestId('admin-state-action').click()
  await expectGameStatus(page, 'RUNNING')

  await runSegment(page, playerOne.page, playerTwo.page, 'PAUSED')

  await page.getByTestId('admin-state-action').click()
  await expectGameStatus(page, 'RUNNING')

  await runSegment(page, playerOne.page, playerTwo.page, 'CONSOLIDATION')

  await page.getByTestId('admin-state-action').click()
  await expectGameStatus(page, 'RESULTS')

  const [reportPage] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByTestId('open-report').click(),
  ])
  await expect(reportPage.getByTestId('report-loaded')).toBeVisible({
    timeout: 30_000,
  })
  await expect(reportPage.getByText('Playwright Bank One')).toBeVisible()
  await expect(reportPage.getByText('Playwright Bank Two')).toBeVisible()

  await playerOne.context.close()
  await playerTwo.context.close()
})
