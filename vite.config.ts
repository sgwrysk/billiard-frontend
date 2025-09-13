/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React and core libraries
          vendor: ['react', 'react-dom'],
          // Material UI chunk
          mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          // Chart.js chunk (if used heavily)
          charts: ['chart.js', 'react-chartjs-2'],
          // Game engines chunk
          'game-engines': [
            './src/games/rotation/RotationEngine.ts',
            './src/games/bowlard/BowlardEngine.ts', 
            './src/games/japan/JapanEngine.ts'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000 // Increase warning threshold to 1MB
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
