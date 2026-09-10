import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const buildId = Date.now().toString(36)

export default defineConfig(() => ({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: `assets/${buildId}/[name]-[hash].js`,
        chunkFileNames: `assets/${buildId}/[name]-[hash].js`,
        assetFileNames: `assets/${buildId}/[name]-[hash][extname]`,
        manualChunks(id: string) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/recharts/') || id.includes('node_modules/d3-')) {
            return 'vendor-charts'
          }
          return undefined
        },
      },
    },
  },
}))
