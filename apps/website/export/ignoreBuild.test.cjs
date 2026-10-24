'use strict'

const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { after, test } = require('node:test')

const SCRIPT_PATH = path.join(__dirname, 'ignoreBuild.cjs')
const TEMP_ROOTS = new Set()

after(() => {
  for (const root of TEMP_ROOTS) {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    windowsHide: true,
  })

  if (result.error || result.status !== 0) {
    throw new Error(
      'Command failed: ' +
        command +
        ' ' +
        args.join(' ') +
        '\n' +
        (result.stderr || (result.error && result.error.message) || '')
    )
  }

  return result.stdout.replace(/[\r\n]+$/, '')
}

function createFixture(t, initialFiles = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vercel-ignore-build-'))
  TEMP_ROOTS.add(root)
  t.after(() => {
    fs.rmSync(root, { recursive: true, force: true })
    TEMP_ROOTS.delete(root)
  })

  fs.mkdirSync(path.join(root, 'apps', 'website'), { recursive: true })
  run('git', ['init', '--quiet'], root)
  run('git', ['config', 'user.name', 'Ignore Build Test'], root)
  run('git', ['config', 'user.email', 'ignore-build@example.invalid'], root)
  run('git', ['config', 'commit.gpgsign', 'false'], root)
  run('git', ['config', 'core.hooksPath', '/dev/null'], root)

  const fixture = { root, baseSha: '', headSha: '' }
  writeFiles(fixture, {
    'apps/website/README.md': 'website fixture\n',
    'apps/demo-game/README.md': 'demo game fixture\n',
    'examples/README.md': 'examples fixture\n',
    'cypress/README.md': 'cypress fixture\n',
    'playwright/README.md': 'playwright fixture\n',
    ...initialFiles,
  })
  run('git', ['add', '-A'], root)
  run('git', ['commit', '--quiet', '-m', 'base'], root)
  fixture.baseSha = run('git', ['rev-parse', 'HEAD'], root)
  fixture.headSha = fixture.baseSha

  return fixture
}

function writeFiles(fixture, files) {
  for (const [relativePath, contents] of Object.entries(files)) {
    const absolutePath = path.join(fixture.root, relativePath)
    if (contents === null) {
      fs.unlinkSync(absolutePath)
    } else {
      fs.mkdirSync(path.dirname(absolutePath), { recursive: true })
      fs.writeFileSync(absolutePath, contents)
    }
  }
}

function commitChanges(fixture, files, message = 'change') {
  writeFiles(fixture, files)
  run('git', ['add', '-A'], fixture.root)
  run('git', ['commit', '--quiet', '-m', message], fixture.root)
  fixture.headSha = run('git', ['rev-parse', 'HEAD'], fixture.root)
  return fixture.headSha
}

function invokeIgnoreCommand(
  fixture,
  overrides = {},
  useRepositoryRoot = false
) {
  const env = { ...process.env }
  delete env.VERCEL_ENV
  delete env.VERCEL_GIT_COMMIT_SHA
  delete env.VERCEL_GIT_PREVIOUS_SHA
  Object.assign(env, {
    VERCEL_ENV: 'preview',
    VERCEL_GIT_COMMIT_SHA: fixture.headSha,
    VERCEL_GIT_PREVIOUS_SHA: fixture.baseSha,
  })

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete env[key]
    } else {
      env[key] = value
    }
  }

  return spawnSync(process.execPath, [SCRIPT_PATH], {
    cwd: useRepositoryRoot
      ? fixture.root
      : path.join(fixture.root, 'apps', 'website'),
    encoding: 'utf8',
    env,
    windowsHide: true,
  })
}

function assertBuildDecision(
  fixture,
  expectedStatus,
  overrides,
  useRepositoryRoot = false
) {
  const result = invokeIgnoreCommand(fixture, overrides, useRepositoryRoot)
  assert.equal(result.error, undefined, result.error && result.error.message)
  assert.equal(result.status, expectedStatus, result.stderr)
}

test('skips preview builds for changes confined to the approved unrelated roots from the app root', async (t) => {
  const safeChanges = [
    'apps/demo-game/src/game.ts',
    'examples/central-bank/README.md',
    'cypress/specs/game.cy.ts',
    'playwright/specs/game.spec.ts',
  ]

  for (const relativePath of safeChanges) {
    await t.test(relativePath, (subtest) => {
      const fixture = createFixture(subtest)
      commitChanges(fixture, { [relativePath]: 'unrelated source change\n' })
      assertBuildDecision(fixture, 0)
    })
  }
})

test('builds when the Git diff is empty', (t) => {
  const fixture = createFixture(t)
  assertBuildDecision(fixture, 1)
})

test('skips when all paths across multiple commits stay in unrelated roots', (t) => {
  const fixture = createFixture(t)
  commitChanges(
    fixture,
    { 'examples/one.md': 'first\n' },
    'first unrelated change'
  )
  commitChanges(
    fixture,
    { 'apps/demo-game/two.ts': 'second\n' },
    'second unrelated change'
  )
  assertBuildDecision(fixture, 0)
})

test('builds for a mixed diff that includes a website file', (t) => {
  const fixture = createFixture(t)
  commitChanges(fixture, {
    'examples/one.md': 'unrelated\n',
    'apps/website/src/page.tsx': 'website\n',
  })
  assertBuildDecision(fixture, 1)
})

test('skips for deletions under an unrelated root', (t) => {
  const fixture = createFixture(t, { 'examples/removed.md': 'old content\n' })
  commitChanges(fixture, { 'examples/removed.md': null })
  assertBuildDecision(fixture, 0)
})

test('parses whitespace in changed paths without treating it as multiple paths', (t) => {
  const fixture = createFixture(t)
  commitChanges(fixture, { 'examples/a file\twith spaces.md': 'content\n' })
  assertBuildDecision(fixture, 0)
})

test('builds if a cross-boundary rename moves a website file into an unrelated root', (t) => {
  const fixture = createFixture(t, {
    'apps/website/old.md': 'same rename content\n',
  })
  commitChanges(fixture, {
    'apps/website/old.md': null,
    'examples/new.md': 'same rename content\n',
  })
  assertBuildDecision(fixture, 1)
})

test('builds if a cross-boundary rename moves an unrelated file into the website', (t) => {
  const fixture = createFixture(t, {
    'examples/old.md': 'same rename content\n',
  })
  commitChanges(fixture, {
    'examples/old.md': null,
    'apps/website/new.md': 'same rename content\n',
  })
  assertBuildDecision(fixture, 1)
})

test('builds when package manifests, locks, workspace files, or config files change', async (t) => {
  const sensitivePaths = [
    'apps/demo-game/package.json',
    'apps/demo-game/pnpm-lock.yaml',
    'examples/central-bank/.npmrc',
    'examples/central-bank/next.config.ts',
    'packages/ui/src/index.ts',
    'pnpm-lock.yaml',
    'pnpm-workspace.yaml',
    'turbo.json',
    'tsconfig.quartz.json',
  ]

  for (const relativePath of sensitivePaths) {
    await t.test(relativePath, (subtest) => {
      const fixture = createFixture(subtest)
      commitChanges(fixture, { [relativePath]: 'changed\n' })
      assertBuildDecision(fixture, 1)
    })
  }
})

test('builds for website, Quartz, advisor, and unknown paths', async (t) => {
  const paths = [
    'apps/website/src/page.tsx',
    'apps/quartz/docs/page.md',
    'apps/advisor/advisor.html',
    'unclassified/file.txt',
  ]

  for (const relativePath of paths) {
    await t.test(relativePath, (subtest) => {
      const fixture = createFixture(subtest)
      commitChanges(fixture, { [relativePath]: 'changed\n' })
      assertBuildDecision(fixture, 1)
    })
  }
})

test('requires the exact preview environment and valid matching commit SHAs', async (t) => {
  const base = createFixture(t)
  commitChanges(base, { 'examples/change.md': 'change\n' })
  const unavailableSha = '0'.repeat(base.baseSha.length)

  const cases = [
    ['production environment', { VERCEL_ENV: 'production' }],
    ['unknown environment', { VERCEL_ENV: 'preview-ish' }],
    ['missing environment', { VERCEL_ENV: undefined }],
    ['missing current SHA', { VERCEL_GIT_COMMIT_SHA: undefined }],
    ['short current SHA', { VERCEL_GIT_COMMIT_SHA: base.headSha.slice(1) }],
    [
      'current SHA does not match HEAD',
      { VERCEL_GIT_COMMIT_SHA: base.baseSha },
    ],
    ['missing previous SHA', { VERCEL_GIT_PREVIOUS_SHA: undefined }],
    ['short previous SHA', { VERCEL_GIT_PREVIOUS_SHA: base.baseSha.slice(1) }],
    ['unavailable previous SHA', { VERCEL_GIT_PREVIOUS_SHA: unavailableSha }],
  ]

  for (const [name, overrides] of cases) {
    await t.test(name, (subtest) => {
      assertBuildDecision(base, 1, overrides)
    })
  }
})

test('builds when the previous commit is valid but is not an ancestor of HEAD', (t) => {
  const fixture = createFixture(t)
  const originalBranch = run('git', ['branch', '--show-current'], fixture.root)

  run('git', ['checkout', '--quiet', '-b', 'side-branch'], fixture.root)
  commitChanges(fixture, { 'examples/side.md': 'side\n' }, 'side branch')
  const sideSha = fixture.headSha

  run('git', ['checkout', '--quiet', originalBranch], fixture.root)
  commitChanges(fixture, { 'apps/demo-game/main.ts': 'main\n' }, 'main branch')

  assertBuildDecision(fixture, 1, { VERCEL_GIT_PREVIOUS_SHA: sideSha })
})

test('builds when invoked outside a Git repository', (t) => {
  const fixture = createFixture(t)
  const outsideRepository = fs.mkdtempSync(
    path.join(os.tmpdir(), 'vercel-ignore-outside-')
  )
  TEMP_ROOTS.add(outsideRepository)
  t.after(() => {
    fs.rmSync(outsideRepository, { recursive: true, force: true })
    TEMP_ROOTS.delete(outsideRepository)
  })

  const result = spawnSync(process.execPath, [SCRIPT_PATH], {
    cwd: outsideRepository,
    encoding: 'utf8',
    env: {
      ...process.env,
      VERCEL_ENV: 'preview',
      VERCEL_GIT_COMMIT_SHA: fixture.headSha,
      VERCEL_GIT_PREVIOUS_SHA: fixture.baseSha,
    },
    windowsHide: true,
  })

  assert.equal(result.error, undefined, result.error && result.error.message)
  assert.equal(result.status, 1, result.stderr)
})
