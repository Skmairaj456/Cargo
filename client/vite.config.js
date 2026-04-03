import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
const apiTarget = process.env.VITE_PROXY_API || 'http://localhost:5000'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: process.env.CHOKIDAR_USEPOLLING === 'true',
    },
    proxy: {
      '/auth': apiTarget,
      '/bookings': apiTarget,
      '/drivers': apiTarget,
      '/pricing': apiTarget,
    },
  },
})
