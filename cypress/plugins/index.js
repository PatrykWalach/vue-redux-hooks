/* eslint-disable @typescript-eslint/no-var-requires*/
const { startDevServer } = require('@cypress/webpack-dev-server')
const webpackConfig = require('@vue/cli-service/webpack.config.js')

/// <reference types="cypress" />

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  require('@cypress/code-coverage/task')(on, config)

  on('dev-server:start', (options) =>
    startDevServer({
      options,
      webpackConfig,
    }),
  )

  return config
}
