import { defineConfig } from 'vite'

export default defineConfig({
  base: './', // ✅ Netlify가 상대경로로 빌드하도록 강제
})