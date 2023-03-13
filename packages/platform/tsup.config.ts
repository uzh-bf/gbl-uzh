import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/nexus.ts',
    // 'src/generated/ops.ts',
    'src/lib/util.ts',
    'src/lib/apollo.ts',
  ],
  clean: false,
  dts: true,
})
