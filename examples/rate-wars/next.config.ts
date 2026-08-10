import type { NextConfig } from 'next'

// The design system's development export is raw TypeScript source. Development
// must transpile it; production resolves the compiled distribution instead.
const isDev = process.env.NODE_ENV === 'development'

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  allowedDevOrigins: ['127.0.0.1'],
  ...(isDev && { transpilePackages: ['@uzh-bf/design-system'] }),
}

export default nextConfig
