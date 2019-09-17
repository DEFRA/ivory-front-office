const hapi = require('@hapi/hapi')
const { Persistence } = require('ivory-shared')
const config = require('./config')
const { logger } = require('defra-logging-facade')

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

async function registerPlugins (server) {
  await server.register([
    require('@hapi/inert'),
    require('./plugins/views'),
    require('./plugins/router'),
    require('./plugins/robots'),
    require('./plugins/cache'),
    require('./plugins/navigation'),
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
}

function startHandler (server) {
  logger.info('Ivory front office is starting...')
  logger.info(`Log level: ${config.logLevel}`)

  // listen on SIGTERM signal and gracefully stop the server
  process.on('SIGTERM', function () {
    logger.info('Received SIGTERM scheduling shutdown...')
    logger.info('Ivory front office is stopping...')

    server.stop({ timeout: 10000 }).then(function (err) {
      logger.info('Shutdown complete')
      process.exit((err) ? 1 : 0)
    })
  })
}

async function createServer () {
  // Create the hapi server
  const server = hapi.server(serverOptions)

  // Add a reference to the server in the config
  config.server = server

  // Load reference data
  if (config.serviceApiEnabled) {
    // Add protocol to service api url if it doesn't exist already
    if (!config.serviceApi.includes('://')) {
      config.serviceApi = `${server.info.protocol}://${config.serviceApi}`
    }
    const persistence = new Persistence({ path: `${config.serviceApi}/reference-data` })
    config.referenceData = await persistence.restore()
  } else {
    config.referenceData = {}
  }

  // Register the plugins
  await registerPlugins(server)

  server.events.on('start', () => startHandler(server))

  return server
}

module.exports = createServer
