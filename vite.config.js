import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        short_name: '쀼라인드',
        name: '쀼라인드 - Bblind',
        start_url: '/',
        display: 'standalone',
        theme_color: '#7B6FE0',
        background_color: '#1B2240',
        icons: [
          { src: 'pwa-192.png', type: 'image/png', sizes: '192x192' },
          { src: 'pwa-512.png', type: 'image/png', sizes: '512x512' },
          { src: 'pwa-maskable-512.png', type: 'image/png', sizes: '512x512', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
