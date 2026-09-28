import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const githubBase = repositoryName ? (repositoryName.endsWith('.github.io') ? '/' : `/${repositoryName}/`) : '/'

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? githubBase : '/',
  build: { emptyOutDir: true },
  plugins: [react(), VitePWA({ registerType: 'prompt', includeAssets: ['icon-192.png', 'icon-512.png'], manifest: { name: 'Simple Notes', short_name: 'Notes', description: 'Personliga anteckningar som fungerar offline', lang: 'sv', start_url: './', scope: './', display: 'standalone', theme_color: '#234b72', background_color: '#f5f7f9', icons: [{src:'icon-192.png',sizes:'192x192',type:'image/png'}, {src:'icon-512.png',sizes:'512x512',type:'image/png'}] }, workbox: { globPatterns: ['**/*.{js,css,html,png,svg,ico}'], navigateFallback: 'index.html' } })],
  test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'], css: true },
})
