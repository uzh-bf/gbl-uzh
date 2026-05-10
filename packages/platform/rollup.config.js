import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import { defineConfig } from 'rollup'
import copy from 'rollup-plugin-copy'

const config = defineConfig([
  {
    // Main build configuration
    input: [
      'src/index.ts',
      'src/lib/util.ts',
      'src/trpc/init.ts',
      'src/trpc/createPlatformRouter.ts',
      'src/trpc/context.ts',
      'src/trpc/errors.ts',
      'src/trpc/schemas.ts',
    ],
    output: {
      dir: 'dist',
      format: 'esm',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: '[name].js',
    },
    plugins: [
      nodeResolve(),
      typescript({
        tsconfig: './tsconfig.json',
        rootDir: process.env.NODE_ENV === 'test' ? 'instrumented' : 'src',
      }),
      copy({
        targets: [{ src: 'public/*', dest: 'dist' }],
      }),
    ],
    external: [/@gbl-uzh*/, /node_modules/], // Exclude node_modules and specific external dependencies
  },
])

export default config
