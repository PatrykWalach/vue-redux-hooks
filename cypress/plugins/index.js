/* eslint-disable @typescript-eslint/no-var-requires*/
/// <reference types="cypress" />

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  require('@cypress/code-coverage/task')(on, config)

  if (config.testingType === 'component') {
    const { startDevServer } = require('@cypress/vite-dev-server')
    const vue = require('@vitejs/plugin-vue')
    const jsx = require('@vitejs/plugin-vue-jsx')
    const istanbul = require('vite-plugin-istanbul')
    /**
     * @type {import('vite').UserConfig}
     */
    const viteConfig = {
      plugins: [
        vue({
          reactivityTransform: true,
        }),
        jsx(),
        istanbul(),
      ],
    }

    on('dev-server:start', (options) => startDevServer({ options, viteConfig }))
  }

  return config
}
