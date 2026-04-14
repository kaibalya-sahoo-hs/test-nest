import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    "types": ["vitest/globals"],
    globals: true, // This is the magic line!
    environment: 'jsdom'
  }
})
