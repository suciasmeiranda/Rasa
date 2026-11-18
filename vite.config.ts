import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages menyajikan situs di /MakanYuk/; build lokal dan host lain tetap di root.
  base: process.env.GITHUB_PAGES === 'true' ? '/MakanYuk/' : '/',
  server: {
    port: 5173,
    open: false,
  },
})
