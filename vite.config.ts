import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// GitHub Pages 项目站部署在子路径，构建时通过 VITE_BASE 注入前缀，
// 例如 VITE_BASE=/personal-site/ ；本地开发与根域部署时回落到 '/'。
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
