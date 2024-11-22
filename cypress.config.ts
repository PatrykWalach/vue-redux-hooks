import codeCoverage from '@cypress/code-coverage/task'
import { defineConfig } from 'cypress'
import viteConfig from './vite.config'

export default defineConfig({
  component: {
    setupNodeEvents(on, config) {
      codeCoverage(on, config)

      return config
    },
    devServer: {
      framework: 'vue',
      bundler: 'vite',
      viteConfig,
    },
    specPattern: '**/*.spec.{ts,tsx}',
    video: false,
  },
})
