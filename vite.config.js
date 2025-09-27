import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: 'localhost', // optional: avoids binding to your LAN IP
    open: false        // optional: don’t auto-open a new tab
  }
})
