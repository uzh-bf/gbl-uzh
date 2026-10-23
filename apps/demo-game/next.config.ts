import path from 'node:path'

import type { NextConfig } from 'next'

// Resolve the app's single React copy through pnpm's symlinks. The workspace
// packages are linked into the app, so without these client aliases webpack can
// include a second physical React module even when all package versions are 19.x.
const appReactDir = path.dirname(
  require.resolve('react', { paths: [__dirname] })
)
const appReactDomDir = path.dirname(
  require.resolve('react-dom', { paths: [__dirname] })
)

// @apollo/client peer-resolves separately for react@18 and react@19, so pnpm
// materialises two physical copies. demo-game imports its hooks from the
// react@19 copy, while `@gbl-uzh/platform/dist` (which creates the client and is
// imported by `_app`) pulls the react@18 copy. Two copies = two distinct
// `ApolloContext` objects: the provider seeds one, `useQuery` reads the other,
// so queries never settle and pages hang on `loading` forever despite the
// network request returning 200. Pin every `@apollo/client` import in this
// app's bundle to a single copy.
const appApolloDir = path.dirname(
  require.resolve('@apollo/client/package.json', { paths: [__dirname] })
)

// Linked UI keeps v4 for its other consumers; this app supplies the v5 runtime.
const appDesignSystemDir = path.dirname(
  require.resolve('@uzh-bf/design-system/package.json', { paths: [__dirname] })
)
const appRhfEntry = require.resolve('react-hook-form', { paths: [__dirname] })

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  allowedDevOrigins: ['127.0.0.1'],
  typescript: {
    ignoreBuildErrors: true,
  },
  // Next 16 removed the `eslint` config key (and `next lint`); linting no longer
  // runs during `next build`, so the old `eslint.ignoreDuringBuilds` is gone.
  // Lint runs standalone via the `lint` script (`eslint .`).

  // @uzh-bf/design-system 5.x ships a compiled `dist` with no `development`
  // export condition, so no transpilePackages entry is needed in dev. The
  // client aliases below still matter for linked workspace packages: they
  // ensure every client import uses the app's one React/ReactDOM module.

  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@uzh-bf/design-system$': path.join(appDesignSystemDir, 'dist/index.js'),
      'react-hook-form$': appRhfEntry,
    }
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
      config.resolve.alias = {
        ...config.resolve.alias,
        react: appReactDir,
        'react-dom': appReactDomDir,
        // Collapse the duplicate @apollo/client copies (see appApolloDir above)
        // to one, so the provider and useQuery share a single ApolloContext.
        '@apollo/client': appApolloDir,
        // Some `~/types/*` modules (nexus GraphQL type defs) are imported by
        // client pages for an incidental util (e.g. computePeriodStatus). nexus
        // statically pulls in `prettier`, whose ESM build imports Node builtins
        // (`module`, `v8`, ...) that don't exist in the browser. Production
        // tree-shakes the dead nexus/prettier code; `next dev` does not, so it
        // 500s. prettier is never needed client-side -> stub it to an empty
        // module. (Pre-existing import-boundary smell, surfaced by dev mode.)
        prettier: false,
      }
    }
    return config
  },
}

export default nextConfig
