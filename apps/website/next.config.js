const path = require('node:path')

const isDev = process.env.NODE_ENV === 'development'
const designSystemDist = path.resolve(
  __dirname,
  'node_modules/@uzh-bf/design-system/dist/index.js'
)

module.exports = {
  output: 'export',
  trailingSlash: true,
  allowedDevOrigins: ['gbl-website.*.localhost'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.uzh.ch',
      },
    ],
    unoptimized: true,
  },
  reactStrictMode: true,
  webpack: (config) => {
    if (isDev) {
      // The package's development export exposes raw source and unresolved
      // Tailwind plugins; use the same compiled entry as production.
      config.resolve.alias = {
        ...config.resolve.alias,
        '@uzh-bf/design-system$': designSystemDist,
      }
    }
    return config
  },
}
