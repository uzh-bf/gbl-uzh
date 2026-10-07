import type { NextConfig } from 'next'

// `next dev` sets NODE_ENV=development, `next build` sets production. The design
// system's `development` export condition points at raw `.tsx` source, so dev
// must transpile it; a production build resolves the compiled `dist` (where
// transpiling would break). An unset NODE_ENV defaults to the safe prod path.
// The react@18/19 peer split (design-system v4 declares React 18) is handled at
// the dependency level via scoped pnpm overrides in pnpm-workspace.yaml, so no
// bundler-level react alias is needed any more.
const isDev = process.env.NODE_ENV === 'development'

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  allowedDevOrigins: ['127.0.0.1'],
  // Next 16 stable React Compiler: auto-memoizes components. Requires React 19
  // (this app runs 19.2.7) and works under Turbopack.
  reactCompiler: true,
  // Next 16 removed the `eslint` config key (and `next lint`); linting runs
  // standalone via the `lint` script (`eslint .`), not during `next build`.

  ...(isDev && { transpilePackages: ['@uzh-bf/design-system'] }),
}

export default nextConfig
