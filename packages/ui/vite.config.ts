import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { externalizeDeps } from 'vite-plugin-externalize-deps'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts(),
    externalizeDeps({
      deps: true,
      peerDeps: true,
    }),
  ],
  build: {
    // Preserve the browser targets used before the Vite 7 upgrade.
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
      cssFileName: 'style',
    },
    rollupOptions: {
      watch: {
        include: 'src/**',
      },
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
})
