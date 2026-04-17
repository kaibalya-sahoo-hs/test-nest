import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

console.log(process.env.PORT)
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: process.env.VITE_PORT || 3000, 
  },
  test: {
    "types": ["vitest/globals"],
    globals: true, // This is the magic line!
    environment: 'jsdom',
  }
})
