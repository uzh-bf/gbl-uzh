import { expect, test, type Locator } from '@playwright/test'
import { expectNoPageOverflow } from './support/demoGame'

test.use({ storageState: { cookies: [], origins: [] }, locale: 'de-CH' })

async function expectDialogWithoutLanguageSwitch(dialog: Locator) {
  await expect(dialog).toBeVisible()
  await expect(dialog.getByTestId('language-switch')).toHaveCount(0)
}

test('German instructor and English player share a game and can switch mid-decision', async ({
  page: admin,
  browser,
  baseURL,
}, testInfo) => {
  test.setTimeout(180_000)
  await admin.goto('/admin/login')
  await expect(admin.getByTestId('language-switch')).toHaveCount(1)
  await expect(admin.locator('html')).toHaveAttribute('lang', 'de-CH')
  await admin.getByRole('button', { name: 'Anmelden', exact: true }).click()
  await admin.waitForURL('**/admin/games')
  await expect(admin.getByTestId('language-switch')).toHaveCount(1)
  const name = 'Language ' + Date.now()
  await admin.getByTestId('game-name').fill(name)
  await admin.getByRole('button', { name: 'Spiel erstellen' }).click()
  await admin.getByRole('link', { name: new RegExp(name) }).click()
  const joinURL = await admin.getByLabel('Gemeinsamer Anmeldelink').inputValue()
  const adminLanguage = admin.getByTestId('language-switch')
  const countdownControls = admin.getByTestId('admin-countdown-controls')
  const desktop = admin.viewportSize()!
  const phone = { width: 375, height: 812 }
  for (const viewport of [desktop, phone]) {
    await admin.setViewportSize(viewport)
    await expect(adminLanguage).toHaveCount(1)
    await expect(countdownControls.getByTestId('language-switch')).toBeVisible()
    const languageBox = await adminLanguage.boundingBox()
    const countdownBox = await countdownControls.locator('form').boundingBox()
    expect(languageBox!.y + languageBox!.height).toBeLessThan(countdownBox!.y)
  }
  await adminLanguage.selectOption('en')
  await expect(
    countdownControls.getByRole('button', {
      name: 'Set Countdown',
      exact: true,
    })
  ).toBeVisible()
  await adminLanguage.selectOption('de')
  await admin.getByRole('button', { name: 'Periode hinzufügen' }).click()
  const form = admin.getByRole('dialog')
  await expectDialogWithoutLanguageSwitch(form)
  await expect(adminLanguage).toHaveCount(1)
  await expect(
    form.getByRole('button', { name: 'Schliessen', exact: true })
  ).toBeVisible()
  await expect(form.getByLabel('Anzahl Segmente')).toBeInViewport()
  await expectNoPageOverflow(admin)
  await form.getByLabel('Anzahl Segmente').fill('1')
  await form.getByRole('button', { name: 'Speichern' }).click()
  const period = admin.getByTestId('period-0')
  const gapHeading = period.getByRole('columnheader', {
    name: 'Renditeschritt',
  })
  await gapHeading.scrollIntoViewIfNeeded()
  await expect(gapHeading).toBeInViewport({ ratio: 1 })
  const tableRight = await gapHeading.evaluate(
    (el) => el.getBoundingClientRect().right
  )
  const cardRight = await period
    .locator(':scope > div')
    .first()
    .evaluate((el) => el.getBoundingClientRect().right)
  expect(tableRight).toBeLessThanOrEqual(cardRight)
  await admin.setViewportSize(desktop)
  await admin.getByRole('button', { name: 'Segment hinzufügen' }).click()
  await expectDialogWithoutLanguageSwitch(form)
  for (const [ix, title] of ['A. Das Sparkonto', 'Obligationen'].entries()) {
    await form.getByRole('combobox').nth(ix).click()
    await form.getByRole('option', { name: title, exact: true }).click()
    await form.getByRole('heading', { name: 'Segment hinzufügen' }).click()
  }
  await form.getByRole('button', { name: 'Speichern' }).click()

  const context = await browser.newContext({
    baseURL,
    locale: 'en-US',
    viewport: phone,
  })
  try {
    const player = await context.newPage()
    await player.goto(joinURL)
    await player.getByRole('button', { name: 'Set up your bank' }).click()
    await player.getByLabel('Bank name', { exact: true }).fill('Bonds')
    const switcher = player.getByTestId('language-switch')
    await expect(switcher).toHaveCount(1)
    await switcher.selectOption('de')
    await expect(player.getByLabel('Bankname', { exact: true })).toHaveValue(
      'Bonds'
    )
    await switcher.selectOption('en')
    await player.getByRole('button', { name: /^Avatar / }).click()
    await expectDialogWithoutLanguageSwitch(player.getByRole('dialog'))
    await player.getByRole('button', { name: 'Bear', exact: true }).click()
    await player.getByRole('button', { name: 'Use Bear' }).click()
    await player.getByRole('button', { name: /^Location / }).click()
    await player
      .getByRole('button', { name: 'Zürich (ZH)', exact: true })
      .click()
    await player.getByRole('button', { name: 'Use Zürich (ZH)' }).click()
    await player.getByRole('button', { name: 'Review your bank' }).click()
    await player
      .getByRole('button', { name: 'Edit location', exact: true })
      .click()
    const locationPicker = player.getByRole('dialog')
    await expectDialogWithoutLanguageSwitch(locationPicker)
    await locationPicker.getByLabel('Search canton').fill('GE')
    await locationPicker
      .getByRole('button', { name: 'Genève (GE)', exact: true })
      .click()
    await locationPicker
      .getByRole('button', { name: 'Use Genève (GE)' })
      .click()
    await switcher.selectOption('de')
    await player
      .getByRole('button', { name: 'Standort bearbeiten', exact: true })
      .click()
    await expect(
      locationPicker.getByRole('button', { name: 'Genf (GE)', exact: true })
    ).toHaveAttribute('aria-pressed', 'true')
    await locationPicker
      .getByRole('button', { name: 'Abbrechen', exact: true })
      .click()
    await switcher.selectOption('en')
    await player.getByRole('button', { name: 'Join game' }).click()
    await expect(player).toHaveURL(/\/play\/cockpit/)
    await admin.getByRole('button', { name: 'Periode starten' }).click()
    await admin.getByRole('button', { name: 'Nächstes Segment' }).click()
    const story = player.getByRole('dialog', {
      name: 'A. About the Savings Account',
    })
    await expectDialogWithoutLanguageSwitch(story)
    await story.getByRole('button', { name: 'Continue' }).click()
    await expect(story).toBeHidden()
    const teamLink = player.getByRole('link', { name: 'Team', exact: true })
    const teamLanguage = player.getByTestId('team-panel').getByRole('combobox')
    await expect(switcher).toBeHidden()
    await player
      .getByRole('spinbutton', { name: 'Savings', exact: true })
      .fill('33.3')
    await teamLink.click()
    for (const viewport of [desktop, phone]) {
      await player.setViewportSize(viewport)
      await expect(switcher).toHaveCount(1)
      await expect(teamLanguage).toBeVisible()
    }
    const teamUrl = player.url()
    await teamLanguage.selectOption('de')
    await expect(player).toHaveURL(teamUrl)
    await player.getByRole('link', { name: 'Entscheide' }).click()
    await expect(
      player.getByRole('spinbutton', { name: 'Sparguthaben', exact: true })
    ).toHaveValue('33.3')
    await player
      .getByRole('spinbutton', { name: 'Obligationen', exact: true })
      .fill('33.3')
    await player
      .getByRole('spinbutton', { name: 'Aktien', exact: true })
      .fill('33.4')
    // The narrow slider keeps its handles clear of labels. Each asset is
    // still named next to its editable percentage in the allocation rows.
    const slider = player.getByTestId('allocation-slider')
    await expect(slider.getByText('Obligationen', { exact: true })).toBeHidden()
    await expect(
      slider.getByText('33.3 %', { exact: true }).first()
    ).toBeVisible()
    await expectNoPageOverflow(player)
    await player.screenshot({
      path: testInfo.outputPath('german-allocation.png'),
    })
    await player.getByRole('button', { name: 'Aufteilung speichern' }).click()
    await player.getByRole('switch', { name: 'Bereit' }).click()
    await player.getByRole('link', { name: 'Team', exact: true }).click()
    await player
      .getByRole('button', { name: 'Obligationen', exact: true })
      .click()
    const quiz = player.getByRole('dialog')
    await expectDialogWithoutLanguageSwitch(quiz)
    await quiz
      .getByRole('radio', { name: /geringeres erwartetes Risiko/ })
      .check()
    await quiz
      .getByRole('button', { name: 'Schliessen', exact: true })
      .first()
      .click()
    await teamLanguage.selectOption('en')
    await player.getByRole('button', { name: 'Bonds', exact: true }).click()
    await expect(
      quiz.getByRole('radio', { name: /less risk than a share/ })
    ).toBeChecked()
    await quiz.getByRole('button', { name: 'Submit answer' }).click()
    await expect(quiz.getByText('Correct answer')).toBeVisible()
    await quiz
      .getByRole('button', { name: 'Close', exact: true })
      .first()
      .click()
    await player.getByRole('link', { name: 'Decisions' }).click()
    await expect(admin.locator('html')).toHaveAttribute('lang', 'de-CH')
    await admin.getByRole('button', { name: 'Konsolidieren' }).click()
    const dice = await admin.context().newPage()
    await dice.goto(
      (await admin.locator('a[href*="/admin/dice/"]').getAttribute('href'))!,
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    )
    for (const index of [0, 1, 2]) {
      await dice
        .getByRole('tab', { name: new RegExp('Monat ' + (index + 1)) })
        .click()
      await dice.getByRole('button', { name: 'Würfeln', exact: true }).click()
      await expect(
        dice.getByRole('status').filter({ hasText: 'für alle aufgedeckt' })
      ).toBeVisible({ timeout: 45_000 })
    }
    await expectNoPageOverflow(dice)
    await expect(dice.getByTestId('language-switch')).toHaveCount(1)
    await dice.screenshot({ path: testInfo.outputPath('german-dice.png') })
    await admin
      .getByRole('button', { name: 'Periodenergebnisse', exact: true })
      .click()
    await expect(
      player.getByText('Assets per year', { exact: true })
    ).toBeVisible()
    await teamLink.click()
    await teamLanguage.selectOption('de')
    await player.getByRole('link', { name: 'Entscheide' }).click()
    await player.reload()
    await expect(
      player.getByText('Vermögen je Jahr', { exact: true })
    ).toBeVisible()
    const report = await admin.context().newPage()
    await report.goto(
      (await admin.locator('a[href*="/admin/reports/"]').getAttribute('href'))!,
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    )
    await expect(
      report.getByRole('region', { name: 'Rangliste' })
    ).toContainText('Bonds')
    await expect(report.getByTestId('language-switch')).toHaveCount(1)
    await admin
      .getByRole('button', { name: 'Spiel beenden', exact: true })
      .click()
    await expect(admin.getByTestId('game-detail')).toHaveAttribute(
      'data-game-status',
      'COMPLETED'
    )
    for (const viewport of [desktop, phone]) {
      await admin.setViewportSize(viewport)
      await expect(adminLanguage).toHaveCount(1)
      await expect(adminLanguage).toBeVisible()
      await expect(countdownControls.locator('form')).toBeHidden()
    }
    await adminLanguage.selectOption('en')
    await admin.reload()
    await expect(adminLanguage).toHaveValue('en')
    await expect(admin.locator('html')).toHaveAttribute('lang', 'en-CH')
  } finally {
    await context.close()
  }
})
