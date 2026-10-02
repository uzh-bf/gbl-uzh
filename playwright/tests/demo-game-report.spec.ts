import { expect, test, type Page } from '@playwright/test'
import { FIRST_GAME_YEAR } from '../../apps/demo-game/src/lib/constants'
import {
  capturePlayerScreenshot,
  expectNoPageOverflow,
} from './support/demoGame'
import { reportFixture } from './support/reportFixture'
import { routeTrpc } from './support/trpc'

async function openReport(
  page: Page,
  options: {
    empty?: boolean
    missing?: boolean
    fail?: boolean
    future?: boolean
    teamCount?: number
  } = {},
) {
  const fixture = reportFixture(options.teamCount)
  if (!options.future) fixture.game.periods.pop()
  let fail = options.fail
  let empty = options.empty
  const unroute = await routeTrpc(page, ({ path, input }) => {
    if (path !== 'game.byId' && path !== 'results.specific') return undefined
    if (fail) return { error: 'Report unavailable' }
    if (path === 'game.byId')
      return { data: options.missing ? null : fixture.game }
    if (empty) return { data: [] }
    return {
      data:
        (input as { type: string }).type === 'SEGMENT_END'
          ? fixture.rows
          : fixture.ends,
    }
  })
  await page.goto(`/admin/reports/${fixture.game.id}`)
  return {
    unroute,
    recover: () => {
      fail = false
    },
    settle: () => {
      empty = false
    },
  }
}

const scopeButton = (page: Page, year: number) =>
  page
    .getByRole('navigation', { name: 'Report scope' })
    .getByRole('button', { name: new RegExp(`^${year}`) })
const capture = (page: Page, name: string) =>
  capturePlayerScreenshot(page, {
    path: test.info().outputPath(`report-${name}.png`),
    fullPage: true,
  })

test('report reference states, scoped metrics, team focus and responsive layout', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.setViewportSize({ width: 1442, height: 950 })
  await openReport(page)
  await expect(page.getByTestId('report-loaded')).toBeVisible()
  const summary = page.getByRole('region', { name: 'Report summary' })
  const ranking = page.getByRole('region', { name: 'Ranking', exact: true })
  const performance = page.getByRole('region', {
    name: 'Performance',
    exact: true,
  })
  const decisions = page.getByRole('region', {
    name: 'Decisions',
    exact: true,
  })
  await expect(
    page.getByRole('button', { name: 'Whole game' }),
  ).toHaveAttribute('aria-pressed', 'true')
  await expect(ranking.getByRole('button')).toHaveCount(15)
  await expect(decisions.getByRole('columnheader')).toHaveCount(9)
  const wholeSummary = await summary.innerText()
  await capture(page, 'whole-assets')
  await page.getByRole('button', { name: 'Return', exact: true }).click()
  await expect(performance).toHaveAttribute('data-mode', 'return')
  expect(await summary.innerText()).toBe(wholeSummary)
  await capture(page, 'whole-return')
  await page.getByRole('button', { name: 'Assets', exact: true }).click()
  await scopeButton(page, FIRST_GAME_YEAR + 1).click()
  await expect(decisions.getByRole('columnheader')).toHaveCount(5)
  expect(await summary.innerText()).not.toBe(wholeSummary)
  const scopedSummary = await summary.innerText()
  await capture(page, 'year-assets')
  const team = ranking.getByRole('button', {
    name: 'Focus Team 13',
    exact: true,
  })
  await team.focus()
  await page.keyboard.press('Enter')
  await expect(team).toHaveAttribute('aria-pressed', 'true')
  await expect(team).toHaveAccessibleDescription(
    /Rank \d+\. Assets .+ CHF\. Return .+%\./,
  )
  for (const name of ['Performance', 'Risk and return', 'Sharpe ratio'])
    await expect(
      page.getByRole('region', { name, exact: true }),
    ).toHaveAttribute('data-focused-team', 'report-team-13')
  await expect(
    decisions.locator('[data-team-id="report-team-13"]'),
  ).toHaveAttribute('data-focused', 'true')
  expect(await summary.innerText()).toBe(scopedSummary)
  await capture(page, 'year-focused')
  await scopeButton(page, FIRST_GAME_YEAR).click()
  await expect(team).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Return', exact: true }).click()
  await expect(performance).toHaveAttribute(
    'data-focused-team',
    'report-team-13',
  )
  await expect(performance).not.toContainText('NaN')
  const rankedReturn = (await team.innerText()).match(/[+-]?\d+\.\d+%/)![0]
  await expect(performance.getByTestId('report-focused-value')).toHaveText(
    rankedReturn,
  )
  await team.click()
  await expect(team).toHaveAttribute('aria-pressed', 'false')
  await expect(performance).toHaveAttribute('data-focused-team', '')
  const bar = decisions.getByRole('button', { name: /^Team 1, Q1/ })
  await bar.focus()
  await expect(page.getByRole('tooltip')).toContainText('Savings')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('tooltip')).toHaveCount(0)
  for (const width of [768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await expectNoPageOverflow(page)
    await capture(page, `responsive-${width}`)
  }
  expect(errors).toEqual([])
})

test('report handles query failure and retry', async ({ page }) => {
  const { recover } = await openReport(page, { fail: true })
  await expect(page.getByRole('main').getByRole('alert')).toContainText(
    'could not be loaded',
  )
  recover()
  await page.getByRole('button', { name: 'Retry' }).click()
  await expect(page.getByTestId('report-loaded')).toBeVisible()
})

test('report refreshes newly settled results on window focus without resetting controls', async ({
  page,
}) => {
  const { settle } = await openReport(page, { empty: true })
  await expect(
    page.getByText('No settled results in this scope yet.'),
  ).toBeVisible()
  await scopeButton(page, FIRST_GAME_YEAR).click()
  await page.getByRole('button', { name: 'Return', exact: true }).click()
  await page.getByRole('button', { name: 'Focus Team 13', exact: true }).click()
  settle()
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await expect(
    page.getByRole('region', { name: 'Report summary' }),
  ).toContainText('Across 15 teams')
  await expect(scopeButton(page, FIRST_GAME_YEAR)).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  const performance = page.getByRole('region', {
    name: 'Performance',
    exact: true,
  })
  await expect(performance).toHaveAttribute('data-mode', 'return')
  await expect(performance).toHaveAttribute(
    'data-focused-team',
    'report-team-13',
  )
})

test('report accommodates 60 teams with bounded lists and keyboard access', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1442, height: 950 })
  await openReport(page, { teamCount: 60 })
  await expect(page.getByTestId('report-loaded')).toBeVisible()
  const ranking = page.getByRole('region', { name: 'Ranking', exact: true })
  const decisions = page.getByRole('region', { name: 'Decisions', exact: true })
  const sharpe = page.getByRole('region', { name: 'Sharpe ratio', exact: true })
  await expect(ranking.getByRole('button')).toHaveCount(60)
  await expect(decisions.getByRole('rowheader')).toHaveCount(61)
  await expect(sharpe.getByRole('listitem')).toHaveCount(60)
  await expect(
    page.getByRole('region', { name: 'Report summary' }),
  ).toContainText('Across 60 teams')
  for (const list of [ranking.getByRole('list'), sharpe.getByRole('list')]) {
    expect(
      await list.evaluate((node) => node.scrollHeight > node.clientHeight),
    ).toBe(true)
  }
  expect((await ranking.boundingBox())!.height).toBeLessThanOrEqual(468)
  await capture(page, '60-teams')
  const lastTeam = ranking.getByRole('button').last()
  await lastTeam.focus()
  await page.keyboard.press('Enter')
  await expect(lastTeam).toHaveAttribute('aria-pressed', 'true')
  const performance = page.getByRole('region', {
    name: 'Performance',
    exact: true,
  })
  const focusedId = await performance.getAttribute('data-focused-team')
  for (const panel of [decisions, sharpe])
    await expect(
      panel.locator(`[data-team-id="${focusedId}"]`),
    ).toHaveAttribute('data-focused', 'true')
  await capture(page, '60-teams-focused')
  await page.keyboard.press('Enter')
  await expect(lastTeam).toHaveAttribute('aria-pressed', 'false')
  for (const width of [768, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await expectNoPageOverflow(page)
    await page.getByRole('button', { name: 'Assets', exact: true }).focus()
    const allocation = decisions.getByRole('button', {
      name: new RegExp(`^Team 60, Q1 ${String(FIRST_GAME_YEAR).slice(-2)}:`),
    })
    await allocation.focus()
    await expect(page.getByRole('tooltip')).toContainText('Savings')
    await page.keyboard.press('Escape')
    await capture(page, `60-teams-${width}`)
  }
})

test('report keeps a queued refresh when one query fails before the others finish', async ({
  page,
}) => {
  const { unroute } = await openReport(page, { empty: true })
  await expect(page.getByTestId('report-loaded')).toBeVisible()
  await unroute()
  const fixture = reportFixture()
  let gameReads = 0
  let segmentReads = 0
  let releaseSegments!: () => void
  const pendingSegments = new Promise<void>((resolve) => {
    releaseSegments = resolve
  })
  let releaseRecovery!: () => void
  const pendingRecovery = new Promise<void>((resolve) => {
    releaseRecovery = resolve
  })
  // tRPC batches the three report reads into one HTTP response, so the game
  // failure only surfaces once the held segment read is released. The queued
  // refresh is held in turn to observe the failure before it recovers.
  await routeTrpc(page, async ({ path, input }) => {
    if (path === 'game.byId') {
      if (++gameReads === 1) return { error: 'Temporary game query failure' }
      await pendingRecovery
      return { data: fixture.game }
    }
    if (path !== 'results.specific') return undefined
    const segments = (input as { type: string }).type === 'SEGMENT_END'
    const firstSegmentRead = segments && ++segmentReads === 1
    if (firstSegmentRead) await pendingSegments
    return {
      data: firstSegmentRead ? [] : segments ? fixture.rows : fixture.ends,
    }
  })
  try {
    await page.evaluate(() => window.dispatchEvent(new Event('focus')))
    await expect.poll(() => segmentReads).toBe(1)
    // The recovery event arrives while the failed refresh still has a pending read.
    await page.evaluate(() => window.dispatchEvent(new Event('online')))
    releaseSegments()
    await expect(page.getByRole('main').getByRole('alert')).toContainText(
      'could not be loaded',
    )
    releaseRecovery()
    await expect(
      page.getByRole('region', { name: 'Report summary' }),
    ).toContainText('Across 15 teams')
    expect(segmentReads).toBe(2)
  } finally {
    releaseSegments()
    releaseRecovery()
  }
})

test('report handles unplayed years, empty results and missing games', async ({
  page,
}) => {
  const first = await openReport(page, { future: true })
  await scopeButton(page, FIRST_GAME_YEAR + 2).click()
  await expect(
    page.getByText('No settled results in this scope yet.'),
  ).toBeVisible()
  await first.unroute()
  const second = await openReport(page, { empty: true })
  await expect(
    page.getByText('No settled results in this scope yet.'),
  ).toBeVisible()
  await second.unroute()
  await openReport(page, { missing: true })
  await expect(page.getByText('Game not found.')).toBeVisible()
})
