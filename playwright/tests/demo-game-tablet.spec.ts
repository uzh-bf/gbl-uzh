import { expect, test, type Page } from '@playwright/test'
import { cockpitFixture } from './support/cockpitFixture'
import {
  capturePlayerScreenshot,
  expectNoPageOverflow,
  expectPhoneScrollContained,
} from './support/demoGame'

async function openCockpit(page: Page) {
  const data = cockpitFixture()
  await page.route('**/api/graphql', async (route) => {
    const request = route.request().postDataJSON()
    if (request.operationName === 'Result')
      return route.fulfill({ json: { data } })
    if (request.operationName === 'PerformAction') {
      data.result.playerResult.facts.decisions = JSON.parse(
        request.variables.payload
      )
      data.result.playerResult.facts.allocationSubmitted = true
      return route.fulfill({
        json: { data: { performAction: data.result.playerResult } },
      })
    }
    if (request.operationName === 'UpdateReadyState') {
      data.self.isReady = request.variables.isReady
      return route.fulfill({
        json: {
          data: {
            updateReadyState: {
              __typename: 'Player',
              id: data.self.id,
              isReady: data.self.isReady,
            },
          },
        },
      })
    }
    return route.continue()
  })
  await page.goto('/play/cockpit')
  await expect(
    page.getByRole('spinbutton', { name: 'Savings', exact: true })
  ).toBeVisible()
  return data
}

test('phone typography and control sizing stay compact across 601px', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 566, height: 1024 })
  await openCockpit(page)
  const sizing = () =>
    page.locator('main').evaluate((main) =>
      Array.from(main.querySelectorAll('*'))
        .filter((element) => element.getClientRects().length > 0)
        .map((element) => {
          const style = getComputedStyle(element)
          return {
            tag: element.tagName,
            fontSize: style.fontSize,
            lineHeight: style.lineHeight,
            padding: style.padding,
            gap: style.gap,
            minHeight: style.minHeight,
            borderRadius: style.borderRadius,
          }
        })
    )
  for (const tab of ['Decisions', 'Market', 'History', 'Team']) {
    await page.setViewportSize({ width: 566, height: 1024 })
    const link = page
      .getByRole('navigation', { name: 'Player navigation' })
      .getByRole('link', { name: tab, exact: true })
    await link.click()
    await expect(link).toHaveAttribute('aria-current', 'page')
    const reference = await sizing()
    for (const width of [600, 601, 620, 640]) {
      await page.setViewportSize({ width, height: 1024 })
      await expect
        .poll(sizing, `${tab} sizing at ${width}px`)
        .toEqual(reference)
      await expectNoPageOverflow(page)
      if (width === 601 && tab === 'Decisions') {
        await capturePlayerScreenshot(page, {
          path: testInfo.outputPath('phone-601.png'),
        })
      }
    }
  }
})

for (const hasTouch of [false, true]) {
  test(`tablet breakpoint preserves panels and drafts with ${hasTouch ? 'touch' : 'mouse'} input`, async ({
    browser,
    baseURL,
  }, testInfo) => {
    const context = await browser.newContext({
      baseURL,
      hasTouch,
      isMobile: hasTouch,
      viewport: { width: 640, height: 900 },
    })
    const page = await context.newPage()
    try {
      await openCockpit(page)
      const savings = page.getByRole('spinbutton', {
        name: 'Savings',
        exact: true,
      })
      await savings.fill('54.9')
      for (const viewport of [
        { width: 640, height: 900 },
        { width: 641, height: 900 },
        { width: 700, height: 390 },
        { width: 767, height: 390 },
        { width: 768, height: 900 },
        { width: 772, height: 390 },
        { width: 900, height: 390 },
        { width: 1021, height: 390 },
        { width: 1023, height: 390 },
        { width: 1024, height: 900 },
        { width: 641, height: 390 },
        { width: 640, height: 900 },
      ]) {
        await page.setViewportSize(viewport)
        const tablet = viewport.width >= 641
        await expect
          .poll(() =>
            page.evaluate(() => {
              const visible = (selector: string) =>
                !!document.querySelector(selector)?.getClientRects().length
              return {
                tabletNavigation: visible(
                  'nav[aria-label="Cockpit navigation"]'
                ),
                phoneNavigation: visible('nav[aria-label="Player navigation"]'),
                team: visible('[data-cy="team-panel"]'),
                market: visible('[data-cy="market-panel"]'),
              }
            })
          )
          .toEqual({
            tabletNavigation: tablet,
            phoneNavigation: !tablet,
            team: tablet,
            market: tablet,
          })
        await expect(savings).toHaveValue('54.9')
        await expectNoPageOverflow(page)
        if (viewport.width === 641 || viewport.width === 767)
          await capturePlayerScreenshot(page, {
            path: testInfo.outputPath(
              `layout-${viewport.width}-${viewport.height}.png`
            ),
          })
      }
    } finally {
      await context.close()
    }
  })
}

test('tablet and desktop compose Decisions, Market, Team and all result designs', async ({
  page,
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.setViewportSize({ width: 784, height: 1114 })
  const data = await openCockpit(page)
  data.self.game!.name = 'Investing · Autumn 2026'
  await page.setViewportSize({ width: 390, height: 844 })
  const mobileReady = (await page
    .getByRole('switch', { name: 'Ready', exact: true })
    .boundingBox())!
  const navigation = page.getByRole('navigation', {
    name: 'Cockpit navigation',
  })
  const market = page.getByTestId('market-panel')
  const team = page.getByTestId('team-panel')
  for (const status of [
    'RUNNING',
    'PAUSED',
    'CONSOLIDATION',
    'RESULTS',
  ] as const) {
    data.result.currentGame.status =
      status as typeof data.result.currentGame.status
    data.result.currentGame.activePeriod!.segments[1].facts.revealedRollIndices =
      [0, 1, 2]
    if (status === 'RESULTS')
      data.result.previousResults.push({
        ...data.result.previousResults.at(-1)!,
        id: 'tablet-year-end',
        type: 'PERIOD_END' as (typeof data.result.previousResults)[number]['type'],
        segment: null,
      })
    await page.evaluate(() => window.dispatchEvent(new Event('focus')))
    await expect(
      page.getByRole('region', { name: 'Game progress' })
    ).toHaveAttribute('data-game-status', status)
    let previousMarketSize: { width: number; height: number } | undefined
    for (const width of [641, 767, 768, 772, 900, 1021, 1023, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1114 })
      await expectNoPageOverflow(page)
      await expect(navigation).toBeVisible()
      await expect(navigation.getByRole('link')).toHaveText([
        'Decisions',
        'History',
      ])
      await expect(
        page.getByRole('navigation', { name: 'Player navigation' })
      ).toBeHidden()
      await expect(market).toBeVisible()
      await expect(team).toBeVisible()
      await expect(
        page
          .locator('header')
          .getByRole('link', { name: 'Edit player profile' })
      ).toBeHidden()
      await expect(
        page.getByRole('heading', {
          name: data.self.game!.name,
          exact: true,
        })
      ).toBeVisible()
      const profile = page.getByRole('link', {
        name: 'Edit player profile',
        exact: true,
      })
      await expect(profile).toBeVisible()
      await expect(
        profile.locator('img[src="/locations/flags/AG.svg"]')
      ).toBeVisible()
      await expect
        .poll(() =>
          page
            .locator('main')
            .evaluate((element) => element.scrollWidth <= element.clientWidth)
        )
        .toBe(true)
      const teamBounds = (await team.boundingBox())!
      expect(teamBounds.x).toBeGreaterThan(width * 0.55)
      expect(teamBounds.x + teamBounds.width).toBeLessThanOrEqual(width)
      const marketBounds = (await market.boundingBox())!
      const marketBlock = page.getByTestId('market-block')
      const marketBlockBounds = (await marketBlock.boundingBox())!
      const mainBounds = (await page.locator('main').boundingBox())!
      await expect(marketBlock).toHaveCSS('border-top-width', '1px')
      expect(marketBounds.x).toBe(marketBlockBounds.x)
      const expectedMarketWidth =
        width >= 1024 ? Math.min(768, mainBounds.width * 0.6) : mainBounds.width
      expect(
        Math.abs(marketBounds.width - expectedMarketWidth)
      ).toBeLessThanOrEqual(1)
      if (width >= 1024) {
        const allocation = (await page
          .locator('main > div')
          .first()
          .boundingBox())!
        expect(marketBlockBounds.x).toBe(allocation.x)
        expect(marketBlockBounds.width).toBe(allocation.width)
        expect(marketBlockBounds.y).toBe(allocation.y + allocation.height)
        expect(marketBounds.x).toBe(allocation.x)
        const sidebar = (await team.locator('..').boundingBox())!
        expect(sidebar.x).toBeGreaterThanOrEqual(
          marketBlockBounds.x + marketBlockBounds.width
        )
        expect(sidebar.y + sidebar.height).toBeGreaterThanOrEqual(
          marketBlockBounds.y + marketBlockBounds.height - 1
        )
      } else {
        expect(marketBlockBounds.x).toBe(mainBounds.x)
        expect(
          Math.abs(marketBlockBounds.width - mainBounds.width)
        ).toBeLessThanOrEqual(1)
      }
      const bondsBlock = (await market
        .getByTestId('market-bonds')
        .boundingBox())!
      const stocksBlock = (await market
        .getByTestId('market-stocks')
        .boundingBox())!
      expect(bondsBlock.x).toBe(marketBounds.x)
      expect(stocksBlock.x).toBe(bondsBlock.x + bondsBlock.width)
      expect(
        Math.abs(bondsBlock.width - stocksBlock.width)
      ).toBeLessThanOrEqual(1)
      const bondsPlot = (await market
        .getByRole('img', { name: /^Bonds: bar height/ })
        .boundingBox())!
      const stocksPlot = (await market
        .getByRole('img', { name: /^Stocks: bar height/ })
        .boundingBox())!
      const comparison =
        status === 'RUNNING'
          ? null
          : await market.getByTestId('market-comparison').boundingBox()
      for (const asset of ['Bonds', 'Stocks']) {
        const chart = market.getByRole('img', {
          name: new RegExp(`^${asset}: bar height`),
        })
        const plot = (await chart.boundingBox())!
        expect(plot.width).toBeGreaterThan(0)
        if (width < 1024) {
          await expect(chart).toHaveAttribute('height', '206')
          expect(plot.height).toBe(206)
          // Measure rendered labels inside the accessible chart: a viewBox
          // transform could enlarge text even if its computed font stays fixed.
          const labels = await chart.evaluate((element) => {
            const bounds = element.getBoundingClientRect()
            return Array.from(element.querySelectorAll('text')).map((label) => {
              const rect = label.getBoundingClientRect()
              return {
                fontSize: getComputedStyle(label).fontSize,
                scale: label.getScreenCTM()?.a,
                inside:
                  rect.left >= bounds.left - 1 &&
                  rect.right <= bounds.right + 1 &&
                  rect.top >= bounds.top - 1 &&
                  rect.bottom <= bounds.bottom + 1,
              }
            })
          })
          expect(labels).toHaveLength(22)
          labels.forEach((label, index) => {
            expect(label.fontSize).toBe(index % 2 === 0 ? '14px' : '16px')
            expect(label.scale).toBe(1)
            expect(label.inside).toBe(true)
          })
        } else {
          expect(plot.width).toBeLessThanOrEqual(352)
          expect(plot.height / plot.width).toBeCloseTo(258 / 440, 2)
          await expect(chart).toHaveAttribute('viewBox', '0 0 440 258')
        }
      }
      if (width >= 772 && width <= 1023) {
        if (previousMarketSize) {
          expect(bondsBlock.width).toBeGreaterThan(previousMarketSize.width)
          expect(bondsBlock.height).toBe(previousMarketSize.height)
        }
        previousMarketSize = bondsBlock
      }
      if (comparison)
        expect(comparison.y).toBeGreaterThanOrEqual(
          Math.max(
            bondsPlot.y + bondsPlot.height,
            stocksPlot.y + stocksPlot.height
          )
        )
      const ready = page.getByRole('switch', { name: 'Ready', exact: true })
      if (status === 'RUNNING') {
        await expect(ready).toBeDisabled()
        const readyBounds = (await ready.boundingBox())!
        expect(readyBounds.width).toBe(mobileReady.width)
        expect(readyBounds.height).toBe(mobileReady.height)
        await expect(
          page.getByRole('region', { name: 'Market outlook', exact: true })
        ).toBeHidden()
        const submit = page.getByRole('button', {
          name: 'Submit allocation',
          exact: true,
        })
        await expect(submit).toHaveCSS('font-size', '16px')
        await expect(submit).toHaveCSS('height', '44px')
        const savings = page.getByRole('spinbutton', {
          name: 'Savings',
          exact: true,
        })
        await expect(savings).toHaveCSS('font-size', '14px')
        expect((await savings.locator('..').boundingBox())!.height).toBe(36)
      } else {
        await expect(ready).toHaveCount(0)
        await expect(
          page.getByText('Waiting for the instructor to continue.', {
            exact: true,
          })
        ).toBeInViewport()
      }
      await page.locator('main').evaluate((element) => {
        element.scrollTop = element.scrollHeight
      })
      await expect
        .poll(async () => {
          const marketBottom = (await market.boundingBox())!
          const main = (await page.locator('main').boundingBox())!
          return Math.abs(
            marketBottom.y + marketBottom.height - main.y - main.height
          )
        })
        .toBeLessThanOrEqual(1)
      await page.locator('main').evaluate((element) => {
        element.scrollTop = 0
      })
      await capturePlayerScreenshot(page, {
        path: testInfo.outputPath(`tablet-${status}-${width}.png`),
      })
      const progressHeight = (await page
        .getByRole('region', { name: 'Game progress' })
        .boundingBox())!.height
      await navigation
        .getByRole('link', { name: 'History', exact: true })
        .click()
      await expect
        .poll(
          async () =>
            (
              await page
                .getByRole('group', { name: 'History year' })
                .boundingBox()
            )?.height
        )
        .toBe(progressHeight)
      await navigation
        .getByRole('link', { name: 'Decisions', exact: true })
        .click()
    }
    await market.scrollIntoViewIfNeeded()
    if (status === 'RUNNING') {
      await expect(market.getByTestId('market-comparison')).toHaveCount(0)
      continue
    }
    await expect(market.getByText('Monthly returns · Q2 · Jun')).toBeVisible()
    await expect(
      market
        .getByTestId('market-month-bonds-0')
        .getByRole('img', { name: 'Bonds die: 4' })
    ).toHaveCSS('background-color', 'rgb(255, 224, 0)')
    await expect(
      market
        .getByTestId('market-month-stocks-0')
        .getByRole('img', { name: 'Stocks die: 3' })
    ).toHaveCSS('background-color', 'rgb(38, 131, 104)')
    await expect(market.getByTestId('market-return-stocks')).toContainText(
      '+0.7%'
    )
  }
  expect(errors).toEqual([])
})

test('tablet navigation, resizes, refetches and Ready preserve allocation and History state', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 784, height: 1114 })
  const data = await openCockpit(page)
  const savings = page.getByRole('spinbutton', {
    name: 'Savings',
    exact: true,
  })
  const bonds = page.getByRole('spinbutton', { name: 'Bonds', exact: true })
  const stocks = page.getByRole('spinbutton', { name: 'Stocks', exact: true })
  await savings.fill('33.3')
  await bonds.fill('33.3')
  await stocks.fill('33.4')
  await page.getByRole('link', { name: 'History', exact: true }).click()
  const history = page.getByTestId('history-panel')
  const previousYear = history.getByRole('button', {
    name: String(new Date().getFullYear()),
    exact: true,
  })
  await previousYear.click()
  const details = history.getByRole('button', {
    name: new RegExp(`${new Date().getFullYear()} Quarter 1 monthly details`),
  })
  await details.click()
  await expect(history.getByText('Not revealed').first()).toBeVisible()
  await expect(page.getByTestId('team-panel')).toBeVisible()
  const filters = page.getByRole('group', { name: 'History year' })
  expect((await filters.boundingBox())!.width).toBe(784)
  for (const filter of await filters.getByRole('button').all()) {
    const size = (await filter.boundingBox())!
    expect(size.width).toBeLessThan(100)
    expect(size.height).toBeLessThan(44)
    expect(
      await filter.evaluate((element) =>
        parseFloat(getComputedStyle(element).borderRadius)
      )
    ).toBeGreaterThanOrEqual(size.height / 2)
  }
  await page.setViewportSize({ width: 784, height: 1692 })
  await expect
    .poll(async () => {
      const sidebar = (await page
        .getByTestId('team-panel')
        .locator('..')
        .boundingBox())!
      const main = (await page.locator('main').boundingBox())!
      return sidebar.y + sidebar.height >= main.y + main.height - 1
    })
    .toBe(true)
  await capturePlayerScreenshot(page, {
    path: testInfo.outputPath('tablet-history-784.png'),
  })
  await page.setViewportSize({ width: 784, height: 1114 })
  await page.getByRole('link', { name: 'Decisions', exact: true }).click()
  await expect(savings).toHaveValue('33.3')
  data.result.currentGame.activePeriod!.segments[1].facts.revealedRollIndices =
    [0, 1]
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await expect(page.getByTestId('market-comparison')).toHaveCount(0)
  await expect(savings).toHaveValue('33.3')
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(savings).toHaveValue('33.3')
  await page.getByRole('link', { name: 'History', exact: true }).click()
  await expect(previousYear).toHaveAttribute('aria-pressed', 'true')
  await expect(details).toHaveAttribute('aria-expanded', 'true')
  await page.getByRole('link', { name: 'Decisions', exact: true }).click()
  await page.setViewportSize({ width: 1440, height: 1000 })
  await expect(savings).toHaveValue('33.3')
  await page
    .getByRole('button', { name: 'Submit allocation', exact: true })
    .click()
  await expect(page.getByTestId('allocation-summary')).toBeVisible()
  const ready = page.getByRole('switch', { name: 'Ready', exact: true })
  await expect(ready).toBeEnabled()
  await ready.click()
  await expect(
    page.getByRole('button', { name: 'Change allocation', exact: true })
  ).toBeDisabled()
  await expect(page.getByTestId('market-panel')).toBeVisible()
  await ready.click()
  await page
    .getByRole('button', { name: 'Change allocation', exact: true })
    .click()
  await expect(savings).toHaveValue('33.3')
})

test('legacy Market and Team links map to Decisions only on wider screens', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await openCockpit(page)
  for (const label of ['Market', 'Team']) {
    await page.getByRole('link', { name: label, exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`tab=${label.toLowerCase()}`))
    await page.setViewportSize({ width: 641, height: 1024 })
    await expect(
      page.getByRole('spinbutton', { name: 'Savings', exact: true })
    ).toBeVisible()
    await expect(page.getByTestId('market-panel')).toBeVisible()
    await expect(page.getByTestId('team-panel')).toBeVisible()
    await expect(
      page
        .getByRole('navigation', { name: 'Cockpit navigation' })
        .getByRole('link', { name: 'Decisions', exact: true })
    ).toHaveAttribute('aria-current', 'page')
    await expect(page).toHaveURL(new RegExp(`tab=${label.toLowerCase()}`))
    await expect(
      page.getByRole('link', { name: 'Edit player profile', exact: true })
    ).toHaveAttribute('href', `/play/welcome?edit=1&tab=${label.toLowerCase()}`)
    await page.setViewportSize({ width: 390, height: 844 })
    await expect(
      page.getByRole('spinbutton', { name: 'Savings', exact: true })
    ).toBeHidden()
    await expect(
      page.getByTestId(label === 'Market' ? 'market-panel' : 'team-panel')
    ).toBeVisible()
  }
})

test('embedded Market stays forecast-only during allocation and handles missing forecasts', async ({
  page,
}) => {
  await page.clock.install()
  await page.setViewportSize({ width: 641, height: 1024 })
  const data = await openCockpit(page)
  const market = page.getByTestId('market-panel')
  const savings = page.getByRole('spinbutton', {
    name: 'Savings',
    exact: true,
  })
  await savings.fill('54.9')
  data.result.currentGame.activePeriod!.segments[1].facts.revealedRollIndices =
    [0, 1]
  await page.clock.fastForward(30_001)
  await expect(market.getByTestId('market-comparison')).toHaveCount(0)
  await expect(savings).toHaveValue('54.9')
  await expect(
    page.getByRole('button', { name: 'Submit allocation', exact: true })
  ).toBeDisabled()
  for (const period of data.result.currentGame.periods)
    for (const segment of period.segments)
      segment.facts.revealedRollIndices = []
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await expect(market.getByRole('img', { name: /die:/ })).toHaveCount(0)
  await expect(market.getByTestId('market-comparison')).toHaveCount(0)
  data.result.currentGame.activePeriod!.facts = null
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await expect(
    market.getByText('Market outlook is not available yet.')
  ).toBeVisible()
  await expectNoPageOverflow(page)
  await expect(savings).toHaveValue('54.9')
})

test('phone reference captures preserve the existing shell and content', async ({
  browser,
  baseURL,
}, testInfo) => {
  const context = await browser.newContext({
    baseURL,
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  })
  const page = await context.newPage()
  try {
    const data = await openCockpit(page)
    for (const status of [
      'RUNNING',
      'PAUSED',
      'CONSOLIDATION',
      'RESULTS',
    ] as const) {
      data.result.currentGame.status =
        status as typeof data.result.currentGame.status
      if (status === 'RESULTS') {
        data.result.previousResults.push({
          ...data.result.previousResults.at(-1)!,
          id: 'tablet-year-end',
          type: 'PERIOD_END' as (typeof data.result.previousResults)[number]['type'],
          segment: null,
        })
      }
      await page.evaluate(() => window.dispatchEvent(new Event('focus')))
      await expect(
        page.getByRole('region', { name: 'Game progress' })
      ).toHaveAttribute('data-game-status', status)
      for (const viewport of [
        { width: 320, height: 844 },
        { width: 390, height: 844 },
        { width: 600, height: 1024 },
        { width: 640, height: 1024 },
        { width: 600, height: 390 },
        { width: 640, height: 500 },
      ]) {
        await page.setViewportSize(viewport)
        await expectNoPageOverflow(page)
        await expectPhoneScrollContained(page)
        await expect(
          page.locator('header').getByRole('heading', {
            name: data.self.game!.name,
            exact: true,
          })
        ).toBeVisible()
        for (const label of ['Decisions', 'Market', 'History', 'Team'])
          await expect(
            page
              .getByRole('navigation', { name: 'Player navigation' })
              .getByRole('link', { name: label, exact: true })
          ).toBeVisible()
        const progressHeight = (await page
          .getByRole('region', { name: 'Game progress' })
          .boundingBox())!.height
        const navigation = page.getByRole('navigation', {
          name: 'Player navigation',
        })
        await navigation
          .getByRole('link', { name: 'History', exact: true })
          .click()
        await expect
          .poll(
            async () =>
              (
                await page
                  .getByRole('group', { name: 'History year' })
                  .boundingBox()
              )?.height
          )
          .toBe(progressHeight)
        for (const tab of await page
          .getByRole('group', { name: 'History year' })
          .getByRole('button')
          .all()) {
          await expect(tab).toHaveCSS('width', '88px')
          await expect(tab).toHaveCSS('height', '36px')
          await expect(tab).toHaveCSS('font-size', '14px')
        }
        if (status === 'RUNNING' && viewport.width === 390) {
          await capturePlayerScreenshot(page, {
            path: testInfo.outputPath('phone-history-year-tabs.png'),
          })
        }
        await expectNoPageOverflow(page)
        await navigation
          .getByRole('link', { name: 'Decisions', exact: true })
          .click()
        await page.mouse.move(0, 0)
        await expect
          .poll(async () => {
            await page.locator('main').evaluate((element) => {
              element.scrollTop = 0
            })
            await page.evaluate(
              () =>
                new Promise<void>((resolve) =>
                  requestAnimationFrame(() =>
                    requestAnimationFrame(() => resolve())
                  )
                )
            )
            return page.locator('main').evaluate((element) => element.scrollTop)
          })
          .toBe(0)
        await page.evaluate(
          () =>
            new Promise<void>((resolve) =>
              requestAnimationFrame(() =>
                requestAnimationFrame(() => resolve())
              )
            )
        )
        await capturePlayerScreenshot(page, {
          path: testInfo.outputPath(`phone-${status}-${viewport.width}.png`),
        })
      }
    }
  } finally {
    await context.close()
  }
})

test('closed quarter reveals all months before portfolio results, including repeated totals', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 784, height: 1000 })
  const data = await openCockpit(page)
  const game = data.result.currentGame
  const segment = game.activePeriod!.segments[1]
  const previousValue = await page.getByTestId('team-panel').textContent()
  game.status = 'PAUSED' as typeof game.status
  segment.facts.diceRolls[1] = { ...segment.facts.diceRolls[0] }
  for (const indices of [[], [0], [0, 1]]) {
    segment.facts.revealedRollIndices = indices
    await page.evaluate(() => window.dispatchEvent(new Event('focus')))
    await expect(page.getByTestId('awaiting-dice')).toContainText(
      `${indices.length} of 3`
    )
    await expect(page.getByTestId('result-total')).toHaveCount(0)
    await expect(page.getByTestId('team-panel')).toHaveText(previousValue ?? '')
    const months = page.getByTestId('market-months-bonds')
    for (const label of ['Apr', 'May', 'Jun'])
      await expect(months.getByText(label, { exact: true })).toBeVisible()
    await expect(months.getByRole('img', { name: /Shared die:/ })).toHaveCount(
      indices.length
    )
  }
  await expect(
    page
      .getByTestId('market-bonds')
      .locator('[data-roll="7"] linearGradient stop')
  ).toHaveCount(4)
  await page.reload()
  await expect(page.getByTestId('awaiting-dice')).toContainText('2 of 3')
  for (const width of [320, 390, 641, 784, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    if (width < 641)
      await page.getByRole('link', { name: 'Market', exact: true }).click()
    await expectNoPageOverflow(page)
    await capturePlayerScreenshot(page, {
      path: testInfo.outputPath(`monthly-reveals-${width}.png`),
    })
  }
  segment.facts.revealedRollIndices = [0, 1, 2]
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await expect(page.getByTestId('awaiting-dice')).toHaveCount(0)
  await expect(page.getByTestId('quarter-results')).toBeVisible()
  await expect(
    page
      .getByTestId('market-months-bonds')
      .getByRole('img', { name: /Shared die:/ })
  ).toHaveCount(3)
})
