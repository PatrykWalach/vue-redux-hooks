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
    const istanbul = require('vite-plugin-istanbul')

 
    const viteConfig = {
      plugins: [vue(), istanbul()],
    }

    on('dev-server:start', (options) => startDevServer({ options, viteConfig }))
  }

  return config
}
