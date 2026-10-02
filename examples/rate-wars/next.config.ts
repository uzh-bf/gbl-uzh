import type { NextConfig } from 'next'

// The design system's development export is raw TypeScript source. Development
// must transpile it; production resolves the compiled distribution instead.
// Treat only an explicit development mode as dev: an unset NODE_ENV must use
// the safe production path rather than accidentally transpiling source.
const isDev = process.env.NODE_ENV === 'development'

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  allowedDevOrigins: ['127.0.0.1'],
  ...(isDev && { transpilePackages: ['@uzh-bf/design-system'] }),
}

export default nextConfig
