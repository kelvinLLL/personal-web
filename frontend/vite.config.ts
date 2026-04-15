import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// @ts-expect-error Shared JS helper is consumed by Vite config at runtime.
import { buildFrontendDevProxyConfig } from '../scripts/lib/dev-ports.mjs'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: buildFrontendDevProxyConfig(process.env),
  },
})
