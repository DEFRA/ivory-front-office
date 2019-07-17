const hapi = require('@hapi/hapi')
const config = require('./config')
const loadReferenceData = require('./lib/load-reference-data')

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

if (config.redisEnabled) {
  serverOptions.cache = {
    provider: {
      constructor: require('@hapi/catbox-redis'),
      options: {
        partition: 'hapi-cache',
        port: config.redisPort,
        host: config.redisHost
      }
    }
  }
}

async function createServer () {
  // Create the hapi server
  const server = hapi.server(serverOptions)

  // Add a reference to the server in the config
  config.server = server

  // Load reference data
  config.referenceData = config.serviceApiEnabled ? await loadReferenceData() : {}

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
