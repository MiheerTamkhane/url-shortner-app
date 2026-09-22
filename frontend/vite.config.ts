import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    proxy: {
      '/user': 'http://localhost:3000',
      '/shorten': 'http://localhost:3000',
      '/codes': 'http://localhost:3000',
    },
  },
})
