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
    testTimeout: 30000,      // 30秒に延長 (デフォルト5秒)
    hookTimeout: 30000,      // setup/teardownも30秒
    pool: 'forks',           // forksプールでより安定した並列実行
    poolOptions: {
      forks: {
        singleFork: false,   // マルチフォーク有効
        maxForks: 2,         // 最大2フォークで安定性重視
        minForks: 1          // 最小1フォーク
      }
    },
    // テスト分離は有効にして安定性確保
    isolate: true,
    // テスト結果のバッファリング
    reporters: ['default'],
    // カバレッジ設定
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/**/*.test.*',
        'src/**/__tests__/**'
      ]
    }
  },
})
