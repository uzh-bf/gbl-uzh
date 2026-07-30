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
    // eslint-config-next 16 promotes `react-hooks/set-state-in-effect` to an
    // error. It flags 4 pre-existing setState-in-effect patterns (cockpit,
    // StoryElements, LearningElement) that predate this toolchain upgrade;
    // reworking those effects is a behavior-sensitive change out of scope here
    // (this PR is toolchain/config only). Keep them visible as warnings and fix
    // as follow-up lint debt rather than block the new lint baseline.
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    // An object with only `ignores` sets global ignores. Mirrors the old
    // `ignorePatterns` for build output; node_modules is ignored by flat config
    // out of the box.
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
    ],
  },
]

export default eslintConfig
