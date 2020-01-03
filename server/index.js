const hapi = require('@hapi/hapi')
const { name, version } = require('../package')
const { Persistence } = require('defra-hapi-utils')
const { SyncRegistration } = require('ivory-data-mapping')
const { logger } = require('defra-logging-facade')
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
    require('./plugins/frontend'),
    require('./plugins/version'),
    require('./plugins/photos'),
    require('./plugins/flow'),
    require('./plugins/robots'),
    require('./plugins/cache'),
    require('./plugins/navigation'),
    require('./plugins/change-your-answers'),
    require('./plugins/error-pages')
  ])

  // Register the crumb plugin only if not running in unit test
  if (!config.isUnitTest) {
    await server.register([
      require('./plugins/crumb'),
      require('./plugins/logging')
    ])
  }

  // Register the api-proxy plugin only if not running in prod
  if (!config.isProd) {
    await server.register([
      require('./plugins/service-api-proxy'),
      // require('./plugins/service-swagger-proxy'),
      // require('./plugins/service-swagger-json'),
      require('blipp')
    ])
  }
}

function startHandler (server) {
  logger.info(`${name} (${version}) is starting...`)
  logger.info(`Log level: ${config.logLevel}`)

  // listen on SIGTERM signal and gracefully stop the server
  process.on('SIGTERM', function () {
    logger.info('Received SIGTERM scheduling shutdown...')
    logger.info(`${name} (${version}) is stopping...`)

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

  // Add a reference to the config in the server
  server.app.config = config

  // Load reference data
  if (config.serviceApiEnabled) {
    // Add protocol to service api url if it doesn't exist already
    if (!config.serviceApi.includes('://')) {
      config.serviceApi = `${server.info.protocol}://${config.serviceApi}`
    }
    const persistence = Persistence.createDAO({ path: `${config.serviceApi}/reference-data` })
    config.referenceData = await persistence.restore()

    // Register the service api
    SyncRegistration.serviceApi = config.serviceApi
  } else {
    config.referenceData = {}
  }

  // Register the plugins
  await registerPlugins(server)

  server.events.on('start', () => startHandler(server))

  // Add a reference to the google analytics ID
  if (config.googleAnalyticsId) {
    server.app.googleAnalyticsId = config.googleAnalyticsId
  } else {
    logger.warn('GOOGLE_ANALYTICS_ID not set')
  }

  return server
}

module.exports = createServer
