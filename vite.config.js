import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { sites } from '@openai/sites-vite-plugin'
import { copyFileSync, mkdirSync } from 'node:fs'

function staticWorker() {
  return {
    name: 'resume-pilot-static-worker',
    apply: 'build',
    closeBundle() {
      mkdirSync('dist/server', { recursive: true })
      copyFileSync('worker/index.js', 'dist/server/index.js')
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), sites(), staticWorker()],
})
