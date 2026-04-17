import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Limita o paralelismo para evitar estouro de memória em VPS
    rollupOptions: {
      maxParallelFileOps: 2
    },
    // Desativa sourcemaps para reduzir carga de CPU
    sourcemap: false,
    // Aumenta o limite de aviso de tamanho de chunk
    chunkSizeWarningLimit: 1000
  }
})
