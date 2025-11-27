import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    hmr: true, // This is true by default
    watch: {
      usePolling: true, // Enable if running in Docker/WSL
    }
  }
})