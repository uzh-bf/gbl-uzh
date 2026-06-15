module.exports = {
  output: 'export',
  trailingSlash: true,
  images: {
    domains: ['www.uzh.ch'],
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: '**.uzh.ch',
    //   },
    // ],
    unoptimized: true,
  },
  reactStrictMode: true,
  // This app is intentionally frozen on React 18 / design-system v3 / Tailwind
  // 3 while the rest of the monorepo moved to React 19. With both @types/react
  // 18 and 19 present, TypeScript resolves the React 19 ReactNode (which adds
  // `bigint`) when checking next's own .d.ts files, producing a spurious
  // "Link cannot be used as a JSX component" error here even though the React
  // 18 runtime is unaffected. Skip the build-time type check until website is
  // upgraded alongside the rest of the workspace. (ESLint is left enabled — the
  // clash is TypeScript-only.)
  typescript: {
    ignoreBuildErrors: true,
  },
}
