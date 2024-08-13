import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/nexus.ts',
    'src/lib/util.ts',
    'src/lib/apollo.ts',
  ],
  format: ['esm'],
  clean: false,
  dts: true,
  publicDir: true,
})
