// ESLint 9 flat config (replaces .eslintrc.js). Next 16 removed `next lint`, so
// linting runs standalone via the `lint` script (`eslint .`). eslint-config-next
// 16 ships a native flat-config array, so spread it directly — no FlatCompat /
// @eslint/eslintrc shim needed. Equivalent to the old `extends:
// 'next/core-web-vitals'`; the typescript ruleset is intentionally not added
// (it would surface a large set of new rules outside this upgrade's scope).
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    // An object with only `ignores` sets global ignores. Mirrors the old
    // `ignorePatterns` (build output + generated GraphQL); node_modules is
    // ignored by flat config out of the box.
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'src/graphql/generated/**',
    ],
  },
]

export default eslintConfig
