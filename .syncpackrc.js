// @ts-check

/** @type {import("syncpack").RcFile} */
const config = {
  customTypes: {},
  dependencyTypes: [
    'dev',
    'overrides',
    'peer',
    'pnpmOverrides',
    'prod',
    'resolutions',
  ],
  filter: '.',
  indent: '  ',
  semverGroups: [
    {
      range: '',
      dependencyTypes: ['prod', 'resolutions', 'overrides', 'pnpmOverrides'],
      dependencies: ['**'],
      packages: ['**'],
    },
    {
      range: '~',
      dependencyTypes: ['dev'],
      dependencies: ['!@types/**'],
      packages: ['**'],
    },
    {
      range: '^',
      dependencyTypes: ['dev'],
      dependencies: ['@types/**'],
      packages: ['**'],
    },
    {
      range: '^',
      dependencyTypes: ['peer'],
      dependencies: ['**'],
      packages: ['**'],
    },
  ],
  sortAz: [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'resolutions',
    'scripts',
  ],
  sortFirst: [
    'private',
    'name',
    'description',
    'keywords',
    'version',
    'repository',
    'homepage',
    'bugs',
    'license',
    'main',
    'types',
    'files',
    'maintainers',
    'contributors',
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'scripts',
    'resolutions',
    'engines',
    'volta',
    'packageManager',
  ],
  source: [
    'package.json',
    'apps/*/package.json',
    'packages/*/package.json',
    'cypress/package.json',
    'docs/package.json',
  ],
  versionGroups: [
    {
      label:
        'website is intentionally frozen on the legacy React 18 / design-system v3 / Tailwind 3 stack and is upgraded separately',
      packages: ['@gbl-uzh/website'],
      isIgnored: true,
    },
    {
      label:
        '@gbl-uzh/ui and platform keep broad React 18 || 19 peer ranges that deliberately do not pin to the demo-game React version',
      dependencies: ['react', 'react-dom'],
      dependencyTypes: ['peer'],
      packages: ['@gbl-uzh/ui', '@gbl-uzh/platform'],
      isIgnored: true,
    },
  ],
}

module.exports = config
