import { defineConfig } from 'cypress'
import viteConfig from './vite.config'

export default defineConfig({
  component: {
    devServer: {
      framework: 'vue',
      bundler: 'vite',
      viteConfig,
    },
    specPattern: '**/*.spec.{ts,tsx}',
    video: false,
  },
})
