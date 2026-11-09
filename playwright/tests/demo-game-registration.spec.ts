import { expect, test, type Page } from '@playwright/test'
import { writeFile } from 'node:fs/promises'
import { expectNoPageOverflow } from './support/demoGame'

test.setTimeout(180_000)
async function setupBank(page: Page, name: string) {
  await page
    .getByRole('button', { name: 'Set up your bank', exact: true })
    .click()
  await page.getByRole('textbox', { name: 'Bank name', exact: true }).fill(name)
  await page.getByRole('button', { name: /^Avatar / }).click()
  await page.getByRole('button', { name: 'Bear', exact: true }).click()
  await page.getByRole('button', { name: 'Use Bear', exact: true }).click()
  await page.getByRole('button', { name: /^Location / }).click()
  await page.getByRole('textbox', { name: 'Search canton' }).fill('ZH')
  await page.getByRole('button', { name: 'Zürich (ZH)', exact: true }).click()
  await page
    .getByRole('button', { name: 'Use Zürich (ZH)', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Review your bank', exact: true })
    .click()
}
async function graphql(
  page: Page,
  query: string,
  variables: Record<string, unknown> = {}
) {
  const response = await page.request.post('/api/graphql', {
    data: { query, variables },
  })
  const body = await response.json()
  expect(body.errors).toBeUndefined()
  return body.data
}
async function createOpenGame(admin: Page, name: string, capacity?: number) {
  await admin.goto('/admin/games')
  await expect(admin.getByLabel('Registration', { exact: true })).toHaveValue(
    'SHARED_LINK'
  )
  await admin.getByLabel('Name', { exact: true }).fill(name)
  if (capacity)
    await admin.getByLabel('Maximum players (optional)').fill(String(capacity))
  await admin.getByRole('button', { name: 'Create Game', exact: true }).click()
  await admin.getByRole('link', { name: new RegExp(name) }).click()
  await expect(admin.getByTestId('registration-panel')).toContainText('0')
  await expect(
    admin.getByRole('button', { name: 'Start Period', exact: true })
  ).toBeDisabled()
  return admin.getByLabel('Shared registration link').inputValue()
}

test('shared registration creates separate banks, retries safely, resumes and starts', async ({
  page: admin,
  browser,
  baseURL,
}) => {
  const url = await createOpenGame(admin, `Registration ${Date.now()}`, 2)
  const id = Number(new URL(admin.url()).pathname.split('/').pop())
  const contexts = await Promise.all(
    [390, 834, 390].map((width) =>
      browser.newContext({
        baseURL,
        viewport: { width, height: 900 },
        permissions: ['clipboard-read', 'clipboard-write'],
      })
    )
  )
  try {
    const [alice, bob, newcomer] = await Promise.all(
      contexts.map((ctx) => ctx.newPage())
    )
    await admin.getByRole('button', { name: 'Show QR code' }).click()
    await expect(
      admin.getByRole('dialog').getByTestId('registration-qr')
    ).toBeVisible()
    await admin
      .getByRole('dialog')
      .getByTestId('registration-qr')
      .screenshot({ path: test.info().outputPath('registration-qr.png') })
    await writeFile(test.info().outputPath('registration-url.txt'), url)
    await admin
      .getByRole('dialog')
      .getByRole('button', { name: 'Close', exact: true })
      .last()
      .click()
    await alice.goto(url)
    await setupBank(alice, 'Alice Bank')
    await expectNoPageOverflow(alice)
    // A failed request keeps the review and profile choices intact.
    let failOnce = true
    await alice.route('**/api/graphql', async (route) => {
      if (failOnce && route.request().postData()?.includes('RegisterPlayer')) {
        failOnce = false
        await route.abort('failed')
      } else await route.continue()
    })
    await alice.getByRole('button', { name: 'Join game', exact: true }).click()
    await expect(alice.locator('footer').getByRole('alert')).toContainText(
      'Please try again'
    )
    await expect(alice.getByRole('main')).toContainText('Alice Bank')
    await alice.getByRole('button', { name: 'Join game', exact: true }).click()
    await expect(alice).toHaveURL(/\/play\/cockpit/)
    await expect(alice.getByTestId('waiting-for-start')).toBeVisible()
    await bob.goto(url)
    await setupBank(bob, 'Bob Bank')
    await expectNoPageOverflow(bob)
    await bob.getByRole('button', { name: 'Join game', exact: true }).click()
    await expect(bob).toHaveURL(/\/play\/cockpit/)
    await expect(
      bob.getByRole('button', { name: 'Copy my return link' })
    ).toBeVisible()
    await bob.setViewportSize({ width: 1280, height: 900 })
    await expect(
      bob.getByRole('button', { name: 'Copy my return link' })
    ).toBeVisible()
    await expectNoPageOverflow(bob)
    const aliceData = await graphql(
      alice,
      '{ self { id token name } result { currentGame { players { id name token } registrationToken } } }'
    )
    const bobData = await graphql(bob, '{ self { id token } }')
    expect(aliceData.self.id).not.toBe(bobData.self.id)
    expect(aliceData.result.currentGame.registrationToken).toBeNull()
    expect(
      aliceData.result.currentGame.players.find(
        (p: { id: string }) => p.id === bobData.self.id
      ).token
    ).toBeNull()
    await alice.goto(url)
    await expect(alice).toHaveURL(/\/play\/cockpit/)
    await expect
      .poll(
        async () =>
          (
            await graphql(admin, 'query($id:Int!){game(id:$id){playerCount}}', {
              id,
            })
          ).game.playerCount
      )
      .toBe(2)
    await newcomer.goto(url)
    await expect(
      newcomer.getByText('This game is full.', { exact: true })
    ).toBeVisible()
    await expect(admin.getByTestId('registration-panel')).toContainText(
      '2 / 2 players joined'
    )
    await admin
      .getByRole('button', { name: 'Close registration', exact: true })
      .click()
    await newcomer.reload()
    await expect(
      newcomer.getByText('Registration is closed.', { exact: true })
    ).toBeVisible()
    await admin
      .getByRole('button', { name: 'Open registration', exact: true })
      .click()
    await graphql(
      admin,
      'mutation($id:Int!){addGamePeriod(gameId:$id,segmentCount:1,facts:{scenario:{seed:1,interestBank:0.002,trendBonds:0.005,gapBonds:0.0025,trendStocks:0.0075,gapStocks:0.0025}}){id}}',
      { id }
    )
    await graphql(
      admin,
      'mutation($id:Int!){addPeriodSegment(gameId:$id,periodIx:0,facts:{}){id}}',
      { id }
    )
    await admin.reload()
    await admin
      .getByRole('button', { name: 'Start Period', exact: true })
      .click()
    await expect(admin.getByTestId('game-detail')).toHaveAttribute(
      'data-game-status',
      'PREPARATION'
    )
    await expect(
      admin.getByRole('button', { name: 'Open registration', exact: true })
    ).toBeDisabled()
    await newcomer.goto(`${baseURL}/join/${aliceData.self.token}`)
    await expect(newcomer).toHaveURL(/\/play\/cockpit/)
    expect((await graphql(newcomer, '{self{id}}')).self.id).toBe(
      aliceData.self.id
    )
    await admin
      .getByRole('button', { name: 'Next Segment', exact: true })
      .click()
    await expect(admin.getByTestId('game-detail')).toHaveAttribute(
      'data-game-status',
      'RUNNING'
    )
    await expect(
      alice.getByRole('button', { name: 'Submit allocation', exact: true })
    ).toBeVisible()
    await alice
      .getByRole('button', { name: 'Submit allocation', exact: true })
      .click()
    await expect(
      alice.getByText('Allocation submitted', { exact: true })
    ).toBeVisible()
    await alice
      .getByRole('navigation', { name: 'Player navigation' })
      .getByRole('link', { name: 'Team', exact: true })
      .click()
    await alice.getByRole('button', { name: 'Copy my return link' }).click()
    expect(await alice.evaluate(() => navigator.clipboard.readText())).toBe(
      `${baseURL}/join/${aliceData.self.token}`
    )
  } finally {
    await Promise.all(contexts.map((ctx) => ctx.close()))
  }
})

test('creation switches modes without retaining hidden validation and preserves failed submissions', async ({
  page: admin,
}) => {
  const name = `Creation modes ${Date.now()}`
  await admin.goto('/admin/games')
  await admin.getByLabel('Name', { exact: true }).fill(name)
  await admin.getByLabel('Registration', { exact: true }).selectOption('FIXED')
  await admin.getByLabel('Player Count', { exact: true }).fill('')
  await admin
    .getByLabel('Registration', { exact: true })
    .selectOption('SHARED_LINK')
  await admin.getByLabel('Maximum players (optional)').fill('0')
  await admin.getByLabel('Registration', { exact: true }).selectOption('FIXED')
  await admin.getByLabel('Player Count', { exact: true }).fill('2')

  let failOnce = true
  await admin.route('**/api/graphql', async (route) => {
    if (failOnce && route.request().postData()?.includes('CreateGame')) {
      failOnce = false
      await route.abort('failed')
    } else await route.continue()
  })
  await admin.getByRole('button', { name: 'Create Game', exact: true }).click()
  await expect(admin.locator('form').getByRole('alert')).toContainText(
    'Couldn’t create the game'
  )
  await expect(admin.getByLabel('Name', { exact: true })).toHaveValue(name)
  await admin.getByRole('button', { name: 'Create Game', exact: true }).click()
  await admin.getByRole('link', { name: new RegExp(name) }).click()
  await expect(admin).toHaveURL(/\/admin\/games\/\d+$/)
  const id = Number(new URL(admin.url()).pathname.split('/').pop())
  const result = await graphql(
    admin,
    'query($id:Int!){game(id:$id){registrationMode playerCount maxPlayers}}',
    { id }
  )
  expect(result.game).toEqual({
    registrationMode: 'FIXED',
    playerCount: 2,
    maxPlayers: null,
  })

  // Blank capacity remains unlimited after switching back from fixed-count.
  await admin.goto('/admin/games')
  await admin.getByLabel('Registration', { exact: true }).selectOption('FIXED')
  await admin.getByLabel('Player Count', { exact: true }).fill('')
  await admin
    .getByLabel('Registration', { exact: true })
    .selectOption('SHARED_LINK')
  await admin.getByLabel('Name', { exact: true }).fill(`${name} unlimited`)
  await admin.getByRole('button', { name: 'Create Game', exact: true }).click()
  await admin
    .getByRole('link', { name: new RegExp(`${name} unlimited`) })
    .click()
  await expect(admin.getByLabel('Shared registration link')).toHaveValue(
    /\/join\/game\//
  )
  const openId = Number(new URL(admin.url()).pathname.split('/').pop())
  const open = await graphql(
    admin,
    'query($id:Int!){game(id:$id){registrationMode playerCount maxPlayers}}',
    { id: openId }
  )
  expect(open.game).toEqual({
    registrationMode: 'SHARED_LINK',
    playerCount: 0,
    maxPlayers: null,
  })
})

test('invalid registration link shows a useful error without creating a player', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ baseURL })
  try {
    const page = await context.newPage()
    await page.goto('/join/game/invalid-registration-link')
    await expect(
      page.getByText('This registration link is invalid.', { exact: true })
    ).toContainText('invalid')
  } finally {
    await context.close()
  }
})
