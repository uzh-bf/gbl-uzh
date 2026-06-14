import path from 'node:path'

import type { NextConfig } from 'next'

// @uzh-bf/design-system declares a React 18 peer, so pnpm resolves its subtree
// to react@18 while this app runs react@19. In dev it is additionally consumed
// as raw TypeScript source (its `development` export condition). Handle both.
const isDev = process.env.NODE_ENV !== 'production'

// Resolve the app's single React copy through pnpm's symlinks (not a hardcoded
// node_modules path, which may not exist under pnpm hoisting in a clean Docker
// build — there the alias would silently no-op and the duplicate React would
// return). require/__dirname are injected by Next's config loader.
const appReactDir = path.dirname(require.resolve('react', { paths: [__dirname] }))
const appReactDomDir = path.dirname(
  require.resolve('react-dom', { paths: [__dirname] })
)

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  // Next 16 removed the `eslint` config key (and `next lint`); linting no longer
  // runs during `next build`, so the old `eslint.ignoreDuringBuilds` is gone.
  // Lint runs standalone via the `lint` script (`eslint .`).

  // Dev only: the design system's `development` export points at raw `.tsx`
  // source that `next dev`'s webpack cannot parse on its own. A production build
  // resolves the compiled `dist` instead — transpiling there breaks the build.
  ...(isDev && { transpilePackages: ['@uzh-bf/design-system'] }),

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
      // Client bundle only: pin React to this app's single react@19 copy.
      // Without this the design system's react@18 peer adds a second physical
      // React to the browser bundle and hooks crash ("Cannot read properties of
      // null (reading 'useMemo')"). The server build keeps Next's own React
      // resolution (aliasing it there breaks production page-data collection).
      config.resolve.alias = {
        ...config.resolve.alias,
        react: appReactDir,
        'react-dom': appReactDomDir,
      }
    }
    return config
  },
}

export default nextConfig
