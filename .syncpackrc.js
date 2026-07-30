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
      dependencyTypes: ['dev'],
      dependencies: ['typescript', 'typescript-native'],
      packages: ['**'],
    },
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
        'website pins its separately approved React 19.2.8 and Next.js 16.2.12 targets',
      dependencies: ['next', 'eslint-config-next', 'react', 'react-dom'],
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
