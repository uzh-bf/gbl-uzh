import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'

import { test } from '@playwright/test'

import { adminStorageState, loginAsAdmin } from '../support/auth'

test('authenticate admin', async ({ page }) => {
  await loginAsAdmin(page)
  await mkdir(dirname(adminStorageState), { recursive: true })
  await page.context().storageState({ path: adminStorageState })
})
