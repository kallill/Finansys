import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // ConfiguraÃ§Ã£o de "SobrevivÃªncia" para VPS: processa um arquivo por vez
    rollupOptions: {
      maxParallelFileOps: 1,
      output: {
        manualChunks: undefined, // Desativa chunking complexo temporariamente
      }
    },
    sourcemap: false,
    minify: 'esbuild', // Esbuild Ã© mais rÃ¡pido e usa menos RAM que Terser
    chunkSizeWarningLimit: 2000
  }
})
