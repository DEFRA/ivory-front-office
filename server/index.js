require('dotenv').config() // Load variables from .env before any other code (especially before requiring the config.js)
const hapi = require('@hapi/hapi')
const config = require('./config')

const serverOptions = {
  port: config.port,
  routes: {
    validate: {
      options: {
        abortEarly: false
      }
    }
  }
}

async function createServer () {
  // Create the hapi server
  const server = hapi.server(serverOptions)

  // Register the plugins
  await server.register([
    require('@hapi/inert'),
    require('./plugins/views'),
    require('./plugins/router'),
    require('./plugins/robots'),
    require('./plugins/cache'),
    require('./plugins/error-pages'),
    require('./plugins/logging')
  ])

  // Register the crumb plugin only if not running in test
  if (!config.isTest) {
    await server.register([
      require('./plugins/crumb')
    ])
  }

  // Register the dev-only plugins
  if (config.isDev) {
    await server.register([
      require('blipp')
    ])
  }

  return server
}

module.exports = createServer
