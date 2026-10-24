'use strict'

const { spawnSync } = require('node:child_process')
const { TextDecoder } = require('node:util')

const SAFE_ROOTS = ['apps/demo-game/', 'examples/', 'cypress/', 'playwright/']
const PACKAGE_MANAGER_LOCKFILES = new Set([
  'bun.lock',
  'bun.lockb',
  'cargo.lock',
  'composer.lock',
  'deno.lock',
  'gemfile.lock',
  'npm-shrinkwrap.json',
  'package-lock.json',
  'pdm.lock',
  'pipfile.lock',
  'pnpm-lock.yaml',
  'poetry.lock',
  'uv.lock',
  'yarn.lock',
])
const WORKSPACE_CONFIGS = new Set([
  '.npmrc',
  '.pnpmfile.cjs',
  '.yarnrc',
  '.yarnrc.yml',
  'lerna.json',
  'nx.json',
  'pnpm-workspace.yaml',
  'rush.json',
  'turbo.json',
])
const PATH_DECODER = new TextDecoder('utf-8', { fatal: true })
const MAX_GIT_OUTPUT = 16 * 1024 * 1024

function runGit(args, cwd, encoding = 'utf8') {
  return spawnSync('git', args, {
    cwd,
    encoding,
    maxBuffer: MAX_GIT_OUTPUT,
    windowsHide: true,
  })
}

function succeeded(result) {
  return Boolean(result) && !result.error && result.status === 0
}

function outputLine(result) {
  if (!succeeded(result) || typeof result.stdout !== 'string') return null
  return result.stdout.replace(/[\r\n]+$/, '')
}

function isFullSha(value, expectedLength) {
  return (
    typeof value === 'string' &&
    value.length === expectedLength &&
    (expectedLength === 40 || expectedLength === 64) &&
    /^[0-9a-f]+$/i.test(value)
  )
}

function parseChangedPaths(output) {
  if (
    !Buffer.isBuffer(output) ||
    output.length === 0 ||
    output[output.length - 1] !== 0
  ) {
    return null
  }

  const paths = []
  let start = 0

  for (let index = 0; index < output.length; index += 1) {
    if (output[index] !== 0) continue
    if (index === start) return null
    paths.push(PATH_DECODER.decode(output.subarray(start, index)))
    start = index + 1
  }

  return start === output.length && paths.length > 0 ? paths : null
}

function isBuildSensitivePath(changedPath) {
  const basename = changedPath
    .slice(changedPath.lastIndexOf('/') + 1)
    .toLowerCase()

  if (basename === 'package.json') return true
  if (PACKAGE_MANAGER_LOCKFILES.has(basename) || basename.includes('lock'))
    return true
  if (WORKSPACE_CONFIGS.has(basename) || basename.includes('workspace'))
    return true

  // Dotfiles and config-named files can affect tooling or shared build behavior.
  if (
    basename.startsWith('.') ||
    basename.includes('config') ||
    basename === 'vercel.json'
  ) {
    return true
  }

  return false
}

function shouldSkipBuild() {
  if (process.env.VERCEL_ENV !== 'preview') return false

  const repository = outputLine(
    runGit(['rev-parse', '--show-toplevel'], process.cwd())
  )
  if (!repository) return false

  const head = outputLine(runGit(['rev-parse', '--verify', 'HEAD'], repository))
  if (!head || !isFullSha(head, head.length)) return false

  const deploymentCommit = process.env.VERCEL_GIT_COMMIT_SHA
  const previousCommit = process.env.VERCEL_GIT_PREVIOUS_SHA
  if (
    !isFullSha(deploymentCommit, head.length) ||
    deploymentCommit.toLowerCase() !== head.toLowerCase()
  ) {
    return false
  }
  if (!isFullSha(previousCommit, head.length)) return false

  const resolvedPrevious = outputLine(
    runGit(
      ['rev-parse', '--verify', '--quiet', previousCommit + '^{commit}'],
      repository
    )
  )
  if (
    !resolvedPrevious ||
    resolvedPrevious.toLowerCase() !== previousCommit.toLowerCase()
  ) {
    return false
  }

  const ancestor = runGit(
    ['merge-base', '--is-ancestor', resolvedPrevious, head],
    repository
  )
  if (!succeeded(ancestor)) return false

  const diff = runGit(
    ['diff', '--no-renames', '--name-only', '-z', resolvedPrevious, head],
    repository,
    'buffer'
  )
  if (!succeeded(diff)) return false

  const changedPaths = parseChangedPaths(diff.stdout)
  if (!changedPaths) return false

  return changedPaths.every(
    (changedPath) =>
      !isBuildSensitivePath(changedPath) &&
      SAFE_ROOTS.some((safeRoot) => changedPath.startsWith(safeRoot))
  )
}

try {
  process.exitCode = shouldSkipBuild() ? 0 : 1
} catch {
  process.exitCode = 1
}
