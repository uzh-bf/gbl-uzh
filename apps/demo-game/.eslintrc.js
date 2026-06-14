module.exports = {
  root: true,
  extends: 'next/core-web-vitals',
  // `next lint` (removed in Next 16) auto-ignored build output; the `lint`
  // script now runs `eslint .` directly, so ignore generated dirs explicitly.
  ignorePatterns: [
    '.next/',
    'out/',
    'build/',
    'next-env.d.ts',
    'src/graphql/generated/',
  ],
}
